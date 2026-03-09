const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
    addStudent,
    getStudents,
    getStudentById,
    updateStudent,
    deleteStudent,
    verifyStudent,
    updateStudentProfile
} = require('../controllers/studentController');

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|pdf/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: Images or PDFs Only!');
        }
    }
});

router.post('/', addStudent);
router.get('/', getStudents);
router.get('/:id', getStudentById);
router.put('/:id', updateStudent);
router.delete('/:id', deleteStudent);

// New Routes
router.patch('/profile', updateStudentProfile);
router.patch('/:id/verify', verifyStudent);
router.post('/upload-certificate', upload.single('certificate'), (req, res) => {
    if (req.file) {
        res.json({ filePath: `/uploads/${req.file.filename}` });
    } else {
        res.status(400).json({ message: 'File upload failed' });
    }
});

module.exports = router;
