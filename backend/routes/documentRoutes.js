const express = require('express');
const supabase = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(authenticateToken); // Apply to all document routes

// Get documents for application
router.get('/:applicationId', async (req, res) => {
    try {
        // Verify application belongs to user
        const { data: app, error: appError } = await supabase
            .from('applications')
            .select('id')
            .eq('id', req.params.applicationId)
            .eq('user_id', req.user.id)
            .single();

        if (appError || !app) {
            return res.status(404).json({ error: 'Application not found or unauthorized' });
        }

        const { data: documents, error } = await supabase
            .from('documents')
            .select('*')
            .eq('application_id', req.params.applicationId);

        if (error) throw error;
        res.json({ documents });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch documents' });
    }
});

// Upload document
router.post('/:applicationId/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { documentType } = req.body;
        const applicationId = req.params.applicationId;
        const userId = req.user.id;

        // Verify application ownership
        const { data: app, error: appError } = await supabase
            .from('applications')
            .select('id')
            .eq('id', applicationId)
            .eq('user_id', userId)
            .single();

        if (appError || !app) {
            return res.status(404).json({ error: 'Application not found or unauthorized' });
        }

        const fileExt = req.file.originalname.split('.').pop();
        const fileName = `${userId}/${applicationId}/${documentType}_${Date.now()}.${fileExt}`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
            .from('documents')
            .upload(fileName, req.file.buffer, {
                contentType: req.file.mimetype,
                upsert: true
            });

        if (uploadError) throw uploadError;

        // Ensure idempotency: if document type already exists for this app, update it
        const { data: existingDocs } = await supabase
            .from('documents')
            .select('id, file_url')
            .eq('application_id', applicationId)
            .eq('type', documentType);

        if (existingDocs && existingDocs.length > 0) {
            // Delete old file from storage to save space
            if (existingDocs[0].file_url !== fileName) {
                await supabase.storage
                    .from('documents')
                    .remove([existingDocs[0].file_url]);
            }

            // Update database record
            const { data: document, error: updateError } = await supabase
                .from('documents')
                .update({
                    file_name: req.file.originalname,
                    file_url: fileName,
                    file_size: req.file.size,
                    updated_at: new Date().toISOString()
                })
                .eq('id', existingDocs[0].id)
                .select()
                .single();

            if (updateError) throw updateError;
            return res.status(201).json({ document });
        }

        // Create new database record
        const { data: document, error: dbError } = await supabase
            .from('documents')
            .insert([{
                application_id: applicationId,
                user_id: userId,
                type: documentType,
                file_name: req.file.originalname,
                file_url: fileName,
                file_size: req.file.size
            }])
            .select()
            .single();

        if (dbError) throw dbError;

        res.status(201).json({ document });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload document' });
    }
});

// Delete document
router.delete('/:documentId', async (req, res) => {
    try {
        const { data: doc, error: fetchError } = await supabase
            .from('documents')
            .select('*, applications!inner(user_id)')
            .eq('id', req.params.documentId)
            .single();

        if (fetchError || !doc || doc.applications.user_id !== req.user.id) {
            return res.status(404).json({ error: 'Document not found or unauthorized' });
        }

        await supabase.storage
            .from('documents')
            .remove([doc.file_path]);

        const { error: deleteError } = await supabase
            .from('documents')
            .delete()
            .eq('id', req.params.documentId);

        if (deleteError) throw deleteError;

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete document' });
    }
});

module.exports = router;
