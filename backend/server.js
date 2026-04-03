require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ============================================
// APP SETUP
// ============================================
const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET;
const BCRYPT_ROUNDS = 12;

if (!JWT_SECRET) {
    console.error('❌ JWT_SECRET is not set in .env');
    process.exit(1);
}

// Supabase — used ONLY as a PostgreSQL database client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ============================================
// MIDDLEWARE
// ============================================
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// JWT Auth Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};

// Generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// ============================================
// FILE UPLOAD CONFIG
// ============================================
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './uploads';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPG, PNG, and PDF are allowed.'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// ============================================
// ROUTES — HEALTH
// ============================================
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// ============================================
// ROUTES — AUTHENTICATION (own implementation)
// ============================================

// Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, fullName, dob, city, gender } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Check if user already exists
        const { data: existingUser } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', email.toLowerCase().trim())
            .single();

        if (existingUser) {
            return res.status(409).json({ error: 'An account with this email already exists' });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

        // Create profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .insert([{
                email: email.toLowerCase().trim(),
                password_hash: passwordHash,
                full_name: fullName || null,
                dob: dob || null,
                city: city || null,
                gender: gender || null
            }])
            .select('id, email, full_name, dob, city, gender, created_at')
            .single();

        if (profileError) {
            console.error('Profile creation error:', profileError);
            throw new Error('Failed to create account');
        }

        // Generate JWT
        const token = generateToken(profile);

        res.status(201).json({
            token,
            user: {
                id: profile.id,
                email: profile.email,
                full_name: profile.full_name,
                dob: profile.dob,
                city: profile.city,
                gender: profile.gender
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: error.message || 'Registration failed' });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user by email
        const { data: user, error: findError } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', email.toLowerCase().trim())
            .single();

        if (findError || !user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Compare password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate JWT
        const token = generateToken(user);

        // Return user without password_hash
        const { password_hash, ...safeUser } = user;

        res.json({
            token,
            user: safeUser
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Get Current User
app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const { data: user, error } = await supabase
            .from('profiles')
            .select('id, email, full_name, dob, city, gender, created_at, updated_at')
            .eq('id', req.user.id)
            .single();

        if (error || !user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// ROUTES — APPLICATIONS
// ============================================

// List all applications for current user
app.get('/api/applications', authenticateToken, async (req, res) => {
    try {
        const { data: applications, error } = await supabase
            .from('applications')
            .select('*')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json({ applications: applications || [] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new application
app.post('/api/applications', authenticateToken, async (req, res) => {
    try {
        const { data, currentStep } = req.body;

        const { data: application, error } = await supabase
            .from('applications')
            .insert([{
                user_id: req.user.id,
                status: 'draft',
                form_data: data || {},
                current_step: currentStep || 1
            }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json({ application });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single application
app.get('/api/applications/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const { data: application, error } = await supabase
            .from('applications')
            .select('*')
            .eq('id', id)
            .eq('user_id', req.user.id)
            .single();

        if (error) {
            return res.status(404).json({ error: 'Application not found' });
        }

        // Get associated documents
        const { data: documents } = await supabase
            .from('documents')
            .select('*')
            .eq('application_id', id)
            .eq('user_id', req.user.id);

        res.json({ application, documents: documents || [] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update application (auto-save)
app.put('/api/applications/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { form_data, current_step, status } = req.body;

        const updateData = {};
        if (form_data !== undefined) updateData.form_data = form_data;
        if (current_step !== undefined) updateData.current_step = current_step;
        if (status !== undefined) updateData.status = status;

        const { data: application, error } = await supabase
            .from('applications')
            .update(updateData)
            .eq('id', id)
            .eq('user_id', req.user.id)
            .select()
            .single();

        if (error) throw error;
        res.json({ application });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Export application data (for receipt/PDF)
app.get('/api/applications/:id/export', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        // Get application
        const { data: application, error: appError } = await supabase
            .from('applications')
            .select('*')
            .eq('id', id)
            .eq('user_id', req.user.id)
            .single();

        if (appError || !application) {
            return res.status(404).json({ error: 'Application not found' });
        }

        // Get user profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('id, email, full_name, dob, city, gender')
            .eq('id', req.user.id)
            .single();

        // Get documents
        const { data: documents } = await supabase
            .from('documents')
            .select('*')
            .eq('application_id', id);

        // Get appointment
        const { data: appointment } = await supabase
            .from('appointments')
            .select('*')
            .eq('application_id', id)
            .maybeSingle();

        res.json({
            application,
            profile,
            documents: documents || [],
            appointment,
            exportData: {
                applicationId: application.id,
                applicantName: profile?.full_name || 'N/A',
                applicantEmail: profile?.email,
                applicationType: application.form_data?.passportType === 'renewal' ? 'Passport Renewal' : 'Fresh Passport',
                submittedAt: application.updated_at || application.created_at,
                status: application.status,
                formData: application.form_data,
                appointment: appointment ? {
                    location: appointment.psk_location,
                    date: appointment.appointment_date,
                    time: appointment.appointment_time,
                    bookedAt: appointment.booked_at
                } : null,
                documents: (documents || []).map(d => ({
                    type: d.type,
                    fileName: d.file_name,
                    uploadedAt: d.uploaded_at
                }))
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// ROUTES — DOCUMENTS
// ============================================

// Upload document
app.post('/api/documents/upload', authenticateToken, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { applicationId, docType } = req.body;

        if (!applicationId || !docType) {
            // Clean up uploaded file
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: 'applicationId and docType are required' });
        }

        // Verify application belongs to user
        const { data: app } = await supabase
            .from('applications')
            .select('id')
            .eq('id', applicationId)
            .eq('user_id', req.user.id)
            .single();

        if (!app) {
            fs.unlinkSync(req.file.path);
            return res.status(404).json({ error: 'Application not found' });
        }

        // Remove existing document of same type for this application
        await supabase
            .from('documents')
            .delete()
            .eq('application_id', applicationId)
            .eq('type', docType);

        // Save document record
        const fileUrl = `/uploads/${req.file.filename}`;
        const { data: document, error } = await supabase
            .from('documents')
            .insert([{
                application_id: applicationId,
                user_id: req.user.id,
                type: docType,
                file_name: req.file.originalname,
                file_url: fileUrl,
                file_size: req.file.size
            }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({ document });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: error.message || 'Upload failed' });
    }
});

// Get documents for application
app.get('/api/applications/:id/documents', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const { data: documents, error } = await supabase
            .from('documents')
            .select('*')
            .eq('application_id', id)
            .eq('user_id', req.user.id);

        if (error) throw error;
        res.json({ documents: documents || [] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// ROUTES — APPOINTMENTS
// ============================================

// Get PSK locations
app.get('/api/psk/locations', (req, res) => {
    const locations = [
        { id: 1, name: 'PSK Mumbai — Andheri East', address: 'Passport Seva Kendra, J.B. Nagar, Andheri East', city: 'Mumbai', distance: 5.2 },
        { id: 2, name: 'PSK Thane', address: 'Passport Seva Kendra, Naupada, Thane East', city: 'Thane', distance: 12.3 },
        { id: 3, name: 'PSK Navi Mumbai', address: 'Passport Seva Kendra, Sector 19, Vashi', city: 'Navi Mumbai', distance: 18.5 },
        { id: 4, name: 'PSK Mumbai — Dadar', address: 'Passport Seva Kendra, Senapati Bapat Marg', city: 'Mumbai', distance: 8.7 },
        { id: 5, name: 'PSK Pune', address: 'Passport Seva Kendra, Mundhwa', city: 'Pune', distance: 150.0 }
    ];
    res.json({ locations });
});

// Book appointment
app.post('/api/appointments/book', authenticateToken, async (req, res) => {
    try {
        const { applicationId, pskLocation, appointmentDate, appointmentTime } = req.body;

        if (!applicationId || !pskLocation || !appointmentDate || !appointmentTime) {
            return res.status(400).json({ error: 'All appointment fields are required' });
        }

        // Verify application belongs to user
        const { data: app } = await supabase
            .from('applications')
            .select('id')
            .eq('id', applicationId)
            .eq('user_id', req.user.id)
            .single();

        if (!app) {
            return res.status(404).json({ error: 'Application not found' });
        }

        // Remove existing appointment for this application
        await supabase
            .from('appointments')
            .delete()
            .eq('application_id', applicationId);

        // Create appointment
        const { data: appointment, error } = await supabase
            .from('appointments')
            .insert([{
                application_id: applicationId,
                user_id: req.user.id,
                psk_location: pskLocation,
                appointment_date: appointmentDate,
                appointment_time: appointmentTime
            }])
            .select()
            .single();

        if (error) throw error;

        // Update application status to submitted
        await supabase
            .from('applications')
            .update({ status: 'submitted' })
            .eq('id', applicationId)
            .eq('user_id', req.user.id);

        res.status(201).json({ appointment });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// ROUTES — SEED DEMO USER
// ============================================
app.post('/api/seed', async (req, res) => {
    try {
        const DEMO_EMAIL = 'hire-me@anshumat.org';
        const DEMO_PASSWORD = 'HireMe@2025!';

        // Check if demo user already exists
        const { data: existing } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', DEMO_EMAIL)
            .single();

        let userId;

        if (existing) {
            userId = existing.id;
            // Update password in case it changed
            const passwordHash = await bcrypt.hash(DEMO_PASSWORD, BCRYPT_ROUNDS);
            await supabase
                .from('profiles')
                .update({ password_hash: passwordHash })
                .eq('id', userId);
        } else {
            // Create demo user
            const passwordHash = await bcrypt.hash(DEMO_PASSWORD, BCRYPT_ROUNDS);
            const { data: profile, error } = await supabase
                .from('profiles')
                .insert([{
                    email: DEMO_EMAIL,
                    password_hash: passwordHash,
                    full_name: 'Demo Reviewer',
                    dob: '1995-06-15',
                    city: 'Mumbai',
                    gender: 'male'
                }])
                .select()
                .single();

            if (error) throw error;
            userId = profile.id;
        }

        // Clean up existing demo data
        await supabase.from('appointments').delete().eq('user_id', userId);
        await supabase.from('documents').delete().eq('user_id', userId);
        await supabase.from('applications').delete().eq('user_id', userId);

        // Create a submitted application with full form data
        const { data: submittedApp } = await supabase
            .from('applications')
            .insert([{
                user_id: userId,
                status: 'submitted',
                current_step: 5,
                form_data: {
                    firstName: 'Demo',
                    lastName: 'Reviewer',
                    dob: '1995-06-15',
                    gender: 'male',
                    placeOfBirth: 'Mumbai',
                    nationality: 'indian',
                    fatherName: 'Rajesh Kumar',
                    fatherDob: '1965-03-10',
                    motherName: 'Sunita Devi',
                    motherDob: '1968-07-22',
                    currentAddress: '42, Hill Road, Bandra West, Mumbai 400050',
                    permanentAddress: '42, Hill Road, Bandra West, Mumbai 400050',
                    sameAddress: true,
                    city: 'Mumbai',
                    pincode: '400050',
                    passportType: 'fresh',
                    purpose: 'tourism',
                    country: 'Japan'
                }
            }])
            .select()
            .single();

        // Create appointment for submitted app
        if (submittedApp) {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 7);
            const dateStr = futureDate.toISOString().split('T')[0];

            await supabase
                .from('appointments')
                .insert([{
                    application_id: submittedApp.id,
                    user_id: userId,
                    psk_location: 'PSK Mumbai — Andheri East',
                    appointment_date: dateStr,
                    appointment_time: '10:00 AM'
                }]);
        }

        // Create a draft application (in-progress)
        await supabase
            .from('applications')
            .insert([{
                user_id: userId,
                status: 'draft',
                current_step: 2,
                form_data: {
                    firstName: 'Test',
                    lastName: 'Applicant',
                    dob: '2000-01-15',
                    gender: 'female',
                    placeOfBirth: 'Delhi',
                    nationality: 'indian'
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
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// ERROR HANDLING
// ============================================
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
        }
        return res.status(400).json({ error: err.message });
    }
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}/api`);
    console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🌱 Seed demo user: POST http://localhost:${PORT}/api/seed`);
});
