const express = require('express');
const bcrypt = require('bcrypt');
const supabase = require('../config/supabase');

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const DEMO_EMAIL = 'hire-me@anshumat.org';
        const DEMO_PASSWORD = 'HireMe@2025!';

        // 1. Clean existing demo user
        const { data: existingUser } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', DEMO_EMAIL)
            .single();

        if (existingUser) {
            await supabase
                .from('profiles')
                .delete()
                .eq('id', existingUser.id);
        }

        // 2. Create Profile
        const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
        
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .insert([{
                email: DEMO_EMAIL,
                password_hash: passwordHash,
                full_name: 'Anshumat Reviewer',
                dob: '1995-01-01',
                gender: 'male',
                city: 'Delhi'
            }])
            .select()
            .single();

        if (profileError) throw profileError;

        // 3. Create a completed application
        const { data: completedApp, error: appError } = await supabase
            .from('applications')
            .insert([{
                user_id: profile.id,
                status: 'submitted',
                current_step: 5,
                form_data: {
                    passportType: 'fresh',
                    purpose: 'tourism',
                    firstName: 'Anshumat',
                    lastName: 'Reviewer',
                    dob: '1995-01-01',
                    city: 'Delhi',
                    gender: 'male',
                    nationality: 'indian',
                    fatherName: 'Demo Father',
                    motherName: 'Demo Mother',
                    currentAddress: '123 Test Street, Developer District',
                    pincode: '110001',
                    country: 'Singapore'
                }
            }])
            .select()
            .single();

        if (appError) throw appError;

        // 4. Create an appointment
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);

        await supabase
            .from('appointments')
            .insert([{
                application_id: completedApp.id,
                appointment_date: nextWeek.toISOString().split('T')[0],
                appointment_time: '10:30',
                psk_location: 'psk_del_1',
                status: 'scheduled'
            }]);

        // 5. Create a draft application
        await supabase
            .from('applications')
            .insert([{
                user_id: profile.id,
                status: 'draft',
                current_step: 2,
                form_data: {
                    passportType: 'renewal',
                    purpose: 'business',
                    firstName: 'Anshumat',
                    lastName: 'Reviewer'
                }
            }]);

        res.json({ 
            success: true, 
            message: 'Demo user seeded successfully',
            credentials: {
                email: DEMO_EMAIL,
                password: DEMO_PASSWORD
            }
        });
    } catch (error) {
        console.error('Seed error:', error);
        res.status(500).json({ error: 'Failed to seed demo user' });
    }
});

module.exports = router;
