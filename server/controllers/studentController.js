const Student = require('../models/Student');

// @desc    Add a new student
// @route   POST /api/students
// @desc    Add or Update a student
// @route   POST /api/students
const addStudent = async (req, res) => {
    try {
        const {
            name, email, registerNo, department, attendance, completedSemesters,
            sem1Marks, sem2Marks, sem3Marks, sem4Marks, sem5Marks,
            sem6, sem7, sem8, cgpa, isAboveAverage, avgClassMark, backlogs,
            annualIncome, isPWD, academicParticipation, sportsInterest, sportsField,
            isTeamMemberOrSubstitute, hasTalents, specialLabParticipation,
            specialLabName, eventParticipation, eventWinner, placementTraining,
            placementTrainingAttendance, isInterestedInNIP, isNotInterestedInPlacement,
            placementPercentage, avgMockScore,
            internshipStatus, isPaidInternship, stipendAmount, stressLevel,
            depressionSigns
        } = req.body;

        // Check if student exists by registerNo (more reliable for students)
        let student = await Student.findOne({ registerNo });

        const studentData = {
            name, email, registerNo, department, attendance, completedSemesters,
            sem1Marks, sem2Marks, sem3Marks, sem4Marks, sem5Marks,
            sem6, sem7, sem8, cgpa, isAboveAverage, avgClassMark, backlogs,
            annualIncome, isPWD, academicParticipation, sportsInterest, sportsField,
            isTeamMemberOrSubstitute, hasTalents, specialLabParticipation,
            specialLabName, eventParticipation, eventWinner, placementTraining,
            placementTrainingAttendance, isInterestedInNIP, isNotInterestedInPlacement,
            placementPercentage, avgMockScore,
            internshipStatus, isPaidInternship, stipendAmount, stressLevel,
            depressionSigns
        };

        if (student) {
            Object.assign(student, studentData);
            const updatedStudent = await student.save();
            return res.json(updatedStudent);
        }

        student = new Student({
            ...studentData,
            riskStatus: 'Not Predicted'
        });

        const createdStudent = await student.save();
        res.status(201).json(createdStudent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getStudents = async (req, res) => {
    try {
        const students = await Student.find().sort({ createdAt: -1 });
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single student by ID
// @route   GET /api/students/:id
const getStudentById = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (student) {
            res.json(student);
        } else {
            res.status(404).json({ message: 'Student not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a student
// @route   PUT /api/students/:id
const updateStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (student) {
            Object.assign(student, req.body);
            const updatedStudent = await student.save();
            res.json(updatedStudent);
        } else {
            res.status(404).json({ message: 'Student not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a student
// @route   DELETE /api/students/:id
const deleteStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (student) {
            await student.deleteOne();
            res.json({ message: 'Student removed' });
        } else {
            res.status(404).json({ message: 'Student not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    addStudent,
    getStudents,
    getStudentById,
    updateStudent,
    deleteStudent
};
