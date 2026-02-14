const express = require('express');
const router = express.Router();
const User = require('../models/User');

// @desc    Register a user or handle Google login
// @route   POST /api/auth/google
router.post('/google', async (req, res) => {
    const { email, name, googleId } = req.body;

    try {
        let user = await User.findOne({ email });

        if (user) {
            // Update googleId if it's the first time linking
            if (!user.googleId) user.googleId = googleId;
            user.name = name;
            await user.save();
        } else {
            const role = (email === 'suryaselvam.219@gmail.com') ? 'Faculty' : 'Student';
            user = await User.create({
                name,
                email,
                googleId,
                role
            });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        });
    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(500).json({ message: 'Server error during Google authentication' });
    }
});

// @desc    Basic login with specific credentials
// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user or create if it's a special one
        let user = await User.findOne({ email });

        // Logic for specialized logins provided by user
        const credentials = {
            'suryaselvam.219@gmail.com': { pass: 'SuryaKarthi', role: 'Faculty', name: 'Surya Kumar' },
            'karthiselvam.2730@gmail.com': { pass: 'KarthiSurya', role: 'Student', name: 'Kathi Selvam' }
        };

        if (credentials[email] && password === credentials[email].pass) {
            if (!user) {
                user = await User.create({
                    email,
                    name: credentials[email].name,
                    role: credentials[email].role,
                    password: password
                });
            } else {
                // Ensure the role is updated in case it was created differently before
                user.role = credentials[email].role;
                await user.save();
            }
            return res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            });
        }

        // Standard student fallback (if user exists in Student model but not User model)
        if (user && user.password === password) {
            return res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            });
        }

        res.status(401).json({ message: 'Invalid email or password' });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
