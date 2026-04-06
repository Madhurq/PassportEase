const express = require('express');
const supabase = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken); // Apply to all application routes

// Get all applications for current user
router.get('/', async (req, res) => {
    try {
        const { data: applications, error } = await supabase
            .from('applications')
            .select(`
                id,
                status,
                created_at,
                updated_at,
                appointments (
                    appointment_date,
                    appointment_time,
                    psk_location
                )
            `)
            .eq('user_id', req.user.id)
            .order('updated_at', { ascending: false });

        if (error) throw error;
        res.json({ applications });
    } catch (error) {
        console.error('Fetch applications error:', error);
        res.status(500).json({ error: 'Failed to fetch applications' });
    }
});

// Get specific application
router.get('/:id', async (req, res) => {
    try {
        const { data: application, error } = await supabase
            .from('applications')
            .select(`
                *,
                documents (*),
                appointments (*)
            `)
            .eq('id', req.params.id)
            .eq('user_id', req.user.id)
            .single();

        if (error || !application) {
            return res.status(404).json({ error: 'Application not found' });
        }

        res.json({ application });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch application' });
    }
});

// Create new application draft
router.post('/', async (req, res) => {
    try {
        const { data: activeApps, error: checkError } = await supabase
            .from('applications')
            .select('id')
            .eq('user_id', req.user.id)
            .eq('status', 'draft');

        if (!checkError && activeApps?.length > 0) {
            return res.status(400).json({ 
                error: 'You already have an active draft application',
                applicationId: activeApps[0].id 
            });
        }

        const { data: application, error } = await supabase
            .from('applications')
            .insert([{
                user_id: req.user.id,
                status: 'draft',
                form_data: req.body.data || {},
                current_step: req.body.currentStep || 1
            }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json({ application });
    } catch (error) {
        console.error('Create application error:', error);
        res.status(500).json({ error: 'Failed to create application draft' });
    }
});

// Update application
router.put('/:id', async (req, res) => {
    try {
        const { data, currentStep, status } = req.body;
        
        const updateData = {
            form_data: data,
            current_step: currentStep,
            updated_at: new Date().toISOString()
        };

        if (status) {
            updateData.status = status;
        }

        const { data: application, error } = await supabase
            .from('applications')
            .update(updateData)
            .eq('id', req.params.id)
            .eq('user_id', req.user.id)
            .select()
            .single();

        if (error || !application) {
            return res.status(404).json({ error: 'Application not found or unauthorized' });
        }

        res.json({ application });
    } catch (error) {
        console.error('Update application error:', error);
        res.status(500).json({ error: 'Failed to update application' });
    }
});

// Delete draft application
router.delete('/:id', async (req, res) => {
    try {
        const { error } = await supabase
            .from('applications')
            .delete()
            .eq('id', req.params.id)
            .eq('user_id', req.user.id)
            .eq('status', 'draft');

        if (error) throw error;
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete application' });
    }
});

// Export application data
router.get('/:id/export', async (req, res) => {
    try {
        const { data: app, error: appError } = await supabase
            .from('applications')
            .select('*, profiles(email, full_name)')
            .eq('id', req.params.id)
            .eq('user_id', req.user.id)
            .single();

        if (appError || !app) {
            return res.status(404).json({ error: 'Application not found' });
        }

        const { data: documents } = await supabase
            .from('documents')
            .select('*')
            .eq('application_id', req.params.id);

        const { data: appointments } = await supabase
            .from('appointments')
            .select('*')
            .eq('application_id', req.params.id)
            .single();

        const exportData = {
            applicationId: app.id,
            applicantName: app.profiles?.full_name || 'User',
            applicantEmail: app.profiles?.email || '',
            applicationType: app.form_data?.passportType === 'fresh' ? 'Fresh Passport' : 'Renewal',
            submittedAt: app.created_at,
            status: app.status,
            appointment: appointments ? {
                location: appointments.psk_location,
                date: appointments.appointment_date,
                time: appointments.appointment_time
            } : null,
            documents: documents || []
        };

        res.json({ exportData });
    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ error: 'Failed to export application' });
    }
});

module.exports = router;
