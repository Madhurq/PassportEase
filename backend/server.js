require('dotenv').config();

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('ERROR: Missing required environment variables. Check .env file.');
    console.error('Required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET');
    process.exit(1);
}

if (!process.env.JWT_SECRET) {
    console.error('ERROR: JWT_SECRET is required. Generate with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
    process.exit(1);
}

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Middlewares
const errorHandler = require('./middleware/errorHandler');

// Route implementations
const authRoutes = require('./routes/authRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const documentRoutes = require('./routes/documentRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const pskRoutes = require('./routes/pskRoutes');
const seedRoutes = require('./routes/seedRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// 1. Security & Standard Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// 2. Global Rate Limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});

const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // Limit each IP to 20 login/register requests per hour
    message: 'Too many authentication attempts from this IP, please try again after an hour'
});

app.use('/api/', apiLimiter);

// 3. Mount Modular Routes
// Auth routes (login, register, refresh, me)
app.use('/api/auth', authLimiter, authRoutes);

// Application CRUD
app.use('/api/applications', applicationRoutes);

// Document uploads
app.use('/api/documents', documentRoutes);

// Appointment booking (POST /api/appointments)
app.use('/api/appointments', appointmentRoutes);

// PSK locations and slots (GET /api/psk/locations, GET /api/psk/slots/:location)
app.use('/api/psk', pskRoutes);

// Seed endpoint for demo
app.use('/api/seed', seedRoutes);

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Final Error Handling Middleware
app.use(errorHandler);

// 4. Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}/api`);
    console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🌱 Seed demo user: POST http://localhost:${PORT}/api/seed`);
});
