const express = require('express');
const supabase = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

// Book appointment
router.post('/', async (req, res) => {
    try {
        const { applicationId, date, time, location } = req.body;

        // Verify application ownership
        const { data: app, error: appError } = await supabase
            .from('applications')
            .select('id, status')
            .eq('id', applicationId)
            .eq('user_id', req.user.id)
            .single();

        if (appError || !app) {
            return res.status(404).json({ error: 'Application not found or unauthorized' });
        }

        // Check for existing appointment
        const { data: existingApt } = await supabase
            .from('appointments')
            .select('id')
            .eq('application_id', applicationId)
            .single();

        let appointment;

        if (existingApt) {
            const { data: updatedApt, error: updateError } = await supabase
                .from('appointments')
                .update({
                    appointment_date: date,
                    appointment_time: time,
                    psk_location: location,
                    status: 'scheduled',
                    updated_at: new Date().toISOString()
                })
                .eq('id', existingApt.id)
                .select()
                .single();

            if (updateError) throw updateError;
            appointment = updatedApt;
        } else {
            const { data: newApt, error: dbError } = await supabase
                .from('appointments')
                .insert([{
                    application_id: applicationId,
                    appointment_date: date,
                    appointment_time: time,
                    psk_location: location,
                    status: 'scheduled'
                }])
                .select()
                .single();

            if (dbError) throw dbError;
            appointment = newApt;
        }

        // Update application status
        if (app.status === 'draft') {
            await supabase
                .from('applications')
                .update({ status: 'submitted' })
                .eq('id', applicationId);
        }

        res.status(201).json({ appointment });
    } catch (error) {
        console.error('Booking error:', error);
        res.status(500).json({ error: 'Failed to book appointment' });
    }
});

module.exports = router;
