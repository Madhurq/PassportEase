const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');
const { generateToken, authenticateToken, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

const BCRYPT_ROUNDS = 12;

const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validatePassword = (password) => {
    if (password.length < 8) {
        return 'Password must be at least 8 characters';
    }
    return null;
};

router.post('/register', async (req, res) => {
    try {
        const { email, password, fullName, dob, city, gender } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        const passwordError = validatePassword(password);
        if (passwordError) {
            return res.status(400).json({ error: passwordError });
        }

        // Check if user exists
        const { data: existingUser } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', email.toLowerCase().trim())
            .single();

        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
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

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        const { data: user, error: findError } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', email.toLowerCase().trim())
            .single();

        if (findError || !user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = generateToken(user);
        const refreshToken = jwt.sign(
            { id: user.id, email: user.email, type: 'refresh' },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        const { password_hash, ...safeUser } = user;

        res.json({ token, refreshToken, user: safeUser });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ error: 'Refresh token is required' });
        }

        const decoded = jwt.verify(refreshToken, JWT_SECRET);

        if (decoded.type !== 'refresh') {
            return res.status(401).json({ error: 'Invalid refresh token' });
        }

        const { data: user, error } = await supabase
            .from('profiles')
            .select('id, email, full_name, dob, city, gender')
            .eq('id', decoded.id)
            .single();

        if (error || !user) {
            return res.status(401).json({ error: 'User not found' });
        }

        const newToken = generateToken(user);
        const newRefreshToken = jwt.sign(
            { id: user.id, email: user.email, type: 'refresh' },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({ token: newToken, refreshToken: newRefreshToken });
    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
});

router.get('/me', authenticateToken, async (req, res) => {
    try {
        console.log('Fetching user with id:', req.user.id);
        const { data: user, error } = await supabase
            .from('profiles')
            .select('id, email, full_name, dob, city, gender, created_at')
            .eq('id', req.user.id)
            .single();

        console.log('User query result:', { user, error });

        if (error || !user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user profile' });
    }
});

module.exports = router;
