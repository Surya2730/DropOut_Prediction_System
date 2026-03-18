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
        // Find existing user
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check hardcoded credentials for system users
        const credentials = {
            'faculty@gmail.com': { pass: 'Faculty123', role: 'Faculty', name: 'Surya Kumar' },
            'student1@gmail.com': { pass: 'student1123', role: 'Student', name: 'Student One' },
            'student2@gmail.com': { pass: 'student2123', role: 'Student', name: 'Student Two' },
            'student3@gmail.com': { pass: 'student3123', role: 'Student', name: 'Student Three' },
            'student4@gmail.com': { pass: 'student4123', role: 'Student', name: 'Student Four' },
            'student5@gmail.com': { pass: 'student5123', role: 'Student', name: 'Student Five' },
            'academic@coordinator.com': { pass: 'Academic123', role: 'AcademicCoordinator', name: 'Academic Coordinator' },
            'lab@coordinator.com': { pass: 'Lab123', role: 'LabCoordinator', name: 'Lab Coordinator' },
            'placement@coordinator.com': { pass: 'Placement123', role: 'PlacementCoordinator', name: 'Placement Coordinator' }
        };

        // Check if it's a hardcoded credential user
        if (credentials[email] && password === credentials[email].pass) {
            // Update user info if needed
            user.role = credentials[email].role;
            
            // Only overwrite name for non-students, OR if name is missing
            if (user.role === 'Student') {
                const Student = require('../models/Student');
                const studentProfile = await Student.findOne({ email });
                if (studentProfile && studentProfile.name) {
                    user.name = studentProfile.name;
                } else if (!user.name) {
                    user.name = credentials[email].name;
                }
            } else {
                user.name = credentials[email].name;
            }
            
            user.password = password;
            await user.save();

            return res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            });
        }

        // For regular users (including faculty-created students), check password
        if (user.password === password) {
            // Ensure student name is up-to-date
            if (user.role === 'Student') {
                const Student = require('../models/Student');
                const studentProfile = await Student.findOne({ email });
                if (studentProfile && studentProfile.name && studentProfile.name !== user.name) {
                    user.name = studentProfile.name;
                    await user.save();
                }
            }

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

// @desc    Create a new student account (Faculty only)
// @route   POST /api/auth/create-student
router.post('/create-student', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Create new student user
        const user = await User.create({
            name,
            email,
            password, // Note: In production, hash the password
            role: 'Student'
        });

        // Also create a basic Student record so they appear in Added Students page
        const Student = require('../models/Student');
        const existingStudent = await Student.findOne({ email });
        if (!existingStudent) {
            await Student.create({
                name,
                email,
                registerNo: `TEMP-${Date.now()}`, // Temporary register number, will be updated by student
                department: 'Not Set', // Will be filled by student later
                year: '1st Year', // Default
                attendance: 0, // Will be filled by student later
                cgpa: 0, // Will be filled by student later
                backlogs: 0, // Will be filled by student later
                riskStatus: 'Not Predicted'
            });
        }

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            message: 'Student account created successfully'
        });
    } catch (error) {
        console.error('Create Student Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Update user details
// @route   PUT /api/auth/update-user/:id
router.put('/update-user/:id', async (req, res) => {
    const { name, email } = req.body;

    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if email is already taken by another user
        if (email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'Email already in use' });
            }
        }

        user.name = name;
        user.email = email;
        await user.save();

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            message: 'User updated successfully'
        });
    } catch (error) {
        console.error('Update User Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Delete user account by ID
// @route   DELETE /api/auth/delete-user/:id
router.delete('/delete-user/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await user.deleteOne();
        res.json({ message: 'User account deleted successfully' });
    } catch (error) {
        console.error('Delete User Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Delete user account by email (useful when student and user IDs differ)
// @route   DELETE /api/auth/delete-user-by-email/:email
router.delete('/delete-user-by-email/:email', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await user.deleteOne();
        res.json({ message: 'User account deleted successfully' });
    } catch (error) {
        console.error('Delete User By Email Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Migrate existing student users to have Student records
// @route   POST /api/auth/migrate-students
router.post('/migrate-students', async (req, res) => {
    try {
        const Student = require('../models/Student');
        
        // Find all users with role 'Student'
        const studentUsers = await User.find({ role: 'Student' });
        let migratedCount = 0;
        
        for (const user of studentUsers) {
            // Check if Student record already exists
            const existingStudent = await Student.findOne({ email: user.email });
            
            if (!existingStudent) {
                // Create Student record for this user
                await Student.create({
                    name: user.name,
                    email: user.email,
                    registerNo: `TEMP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Unique temporary register number
                    department: 'Not Set',
                    year: '1st Year',
                    attendance: 0,
                    cgpa: 0,
                    backlogs: 0,
                    riskStatus: 'Not Predicted'
                });
                migratedCount++;
            }
        }
        
        res.json({ 
            message: `Migration completed. ${migratedCount} student records created.`,
            totalStudents: studentUsers.length,
            migrated: migratedCount
        });
    } catch (error) {
        console.error('Migration Error:', error);
        res.status(500).json({ message: 'Migration failed', error: error.message });
    }
});

module.exports = router;
