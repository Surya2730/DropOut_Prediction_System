const Student = require('../models/Student');

// @desc    Add a new student
// @route   POST /api/students
// @desc    Add or Update a student
// @route   POST /api/students
const addStudent = async (req, res) => {
    try {
        const {
            name, email, registerNo, department, year, attendance, completedSemesters,
            sem1Marks, sem2Marks, sem3Marks, sem4Marks, sem5Marks,
            sem6, sem7, sem8, cgpa, isAboveAverage, avgClassMark, backlogs,
            annualIncome, hasUnpaidFees, unpaidAmount, isPWD, academicParticipation, sportsInterest, sportsField,
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
            name, email, registerNo, department, year, attendance, completedSemesters,
            sem1Marks, sem2Marks, sem3Marks, sem4Marks, sem5Marks,
            sem6, sem7, sem8, cgpa, isAboveAverage, avgClassMark, backlogs,
            annualIncome, hasUnpaidFees, unpaidAmount, isPWD, academicParticipation, sportsInterest, sportsField,
            isTeamMemberOrSubstitute, hasTalents, specialLabParticipation,
            specialLabName, eventParticipation, eventWinner, placementTraining,
            placementTrainingAttendance, isInterestedInNIP, isNotInterestedInPlacement,
            placementPercentage, avgMockScore,
            internshipStatus, isPaidInternship, stipendAmount, stressLevel,
            depressionSigns
        };

        if (student) {
            // Check if any critical data changed that would require re-verification
            const dataChanged = (
                student.attendance !== attendance ||
                student.cgpa !== cgpa ||
                student.backlogs !== backlogs ||
                student.specialLabParticipation !== specialLabParticipation ||
                student.placementTraining !== placementTraining ||
                student.placementTrainingAttendance !== placementTrainingAttendance ||
                student.isNotInterestedInPlacement !== isNotInterestedInPlacement ||
                student.internshipStatus !== internshipStatus
            );

            Object.assign(student, studentData);

            // If critical data changed, reset verification status
            if (dataChanged && student.isVerified) {
                console.log('Student data changed, resetting verification status');
                student.academicVerification = 'Pending';
                student.labVerification = 'Pending';
                student.placementVerification = 'Pending';
                student.isVerified = false;
                student.riskStatus = 'Not Predicted'; // Reset risk status too
            }

            const updatedStudent = await student.save();
            return res.json(updatedStudent);
        }

        // mark optional verifications as N/A if the student never participates
        if (!studentData.specialLabParticipation) {
            studentData.labVerification = 'N/A';
        }
        if (!studentData.isInterestedInNIP) {
            studentData.placementVerification = 'N/A';
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

// Check if student has all required placement details
const hasPlacementDetails = (student) => {
    return student.placementTraining && 
           student.placementTrainingAttendance > 0 && 
           (student.isInterestedInNIP || !student.isNotInterestedInPlacement) &&
           student.placementPercentage > 0;
};

const getStudents = async (req, res) => {
    try {
        const { role, requireVerified } = req.query;
        let students = await Student.find().sort({ createdAt: -1 });

        // Filter based on role
        if (role === 'PlacementCoordinator') {
            // Hide students who haven't provided placement details
            students = students.filter(student => hasPlacementDetails(student));
        } else if (role === 'Faculty') {
            // Faculty can only see fully verified students
            if (requireVerified === 'true') {
                students = students.filter(student => student.isVerified === true);
            }
        }

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
            // Detect email change so we can update auth User record as well
            const oldEmail = student.email;
            const newEmail = req.body.email;

            // Check if any critical data changed that would require re-verification
            const dataChanged = (
                student.attendance !== req.body.attendance ||
                student.cgpa !== req.body.cgpa ||
                student.backlogs !== req.body.backlogs ||
                student.specialLabParticipation !== req.body.specialLabParticipation ||
                student.placementTraining !== req.body.placementTraining ||
                student.placementTrainingAttendance !== req.body.placementTrainingAttendance ||
                student.isNotInterestedInPlacement !== req.body.isNotInterestedInPlacement ||
                student.internshipStatus !== req.body.internshipStatus
            );

            Object.assign(student, req.body);

            // Synchronize user email and password if changed
            if (newEmail && newEmail !== oldEmail) {
                try {
                    const User = require('../models/User');
                    // Check if new email is already taken by another user
                    const existingUser = await User.findOne({ email: newEmail });
                    if (existingUser) {
                        return res.status(400).json({ message: 'Email already in use by another user' });
                    }
                    const user = await User.findOne({ email: oldEmail });
                    if (user) {
                        user.email = newEmail;
                        if (req.body.password && req.body.password.trim() !== '') {
                            user.password = req.body.password;
                        }
                        await user.save();
                    }
                } catch (err) {
                    console.warn('Could not sync user email during student update:', err.message);
                }
            } else if (req.body.password && req.body.password.trim() !== '') {
                // Update password even if email not changed
                try {
                    const User = require('../models/User');
                    const user = await User.findOne({ email: oldEmail });
                    if (user) {
                        user.password = req.body.password;
                        await user.save();
                    }
                } catch (err) {
                    console.warn('Could not update user password:', err.message);
                }
            }

            // If critical data changed, reset verification status
            if (dataChanged && student.isVerified) {
                console.log('Student data changed, resetting verification status');
                student.academicVerification = 'Pending';
                // don't force pending for N/A items
                student.labVerification = student.specialLabParticipation ? 'Pending' : 'N/A';
                student.placementVerification = student.isInterestedInNIP ? 'Pending' : 'N/A';
                student.isVerified = false;
                student.riskStatus = 'Not Predicted'; // Reset risk status too
            }

            const updatedStudent = await student.save();
            res.json(updatedStudent);
        } else {
            res.status(404).json({ message: 'Student not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Verify a student detail (Coordinator)
// @route   PATCH /api/students/:id/verify
const verifyStudent = async (req, res) => {
    try {
        const { type, status, remark } = req.body; // type: academic, lab, placement; status: Verified, Rejected; remark: string
        const student = await Student.findById(req.params.id);

        if (student) {
            // ensure non-applicable verifications are treated as N/A so academic-only
            // records can become fully verified automatically
            if (!student.specialLabParticipation && student.labVerification === 'Pending') {
                student.labVerification = 'N/A';
            }
            if (student.isNotInterestedInPlacement && student.placementVerification === 'Pending') {
                student.placementVerification = 'N/A';
            }

            if (type === 'academic') {
                student.academicVerification = status;
                student.academicRemark = remark || '';
            } else if (type === 'lab') {
                student.labVerification = status;
                student.labRemark = remark || '';
            } else if (type === 'placement') {
                student.placementVerification = status;
                student.placementRemark = remark || '';
            }

            // re‑check applicability in case verification status was manually updated elsewhere
            const isAcademicCleared = student.academicVerification === 'Verified';
            const isLabCleared = student.labVerification === 'Verified' || student.labVerification === 'N/A';
            const isPlacementCleared = student.placementVerification === 'Verified' || student.placementVerification === 'N/A';

            console.log(`Verification update for ${student.name}:`, {
                academic: student.academicVerification,
                lab: student.labVerification,
                placement: student.placementVerification,
                cleared: { academic: isAcademicCleared, lab: isLabCleared, placement: isPlacementCleared }
            });

            if (isAcademicCleared && isLabCleared && isPlacementCleared) {
                student.isVerified = true;
                console.log(`${student.name} is now FULLY VERIFIED`);
            } else {
                student.isVerified = false;
            }

            const updatedStudent = await student.save();
            res.json(updatedStudent);
        } else {
            res.status(404).json({ message: 'Student not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update student profile (Student self-update)
// @route   PATCH /api/students/profile
const updateStudentProfile = async (req, res) => {
    try {
        const { email, name } = req.body;
        let student = await Student.findOne({ email });

        if (student) {
            // Check if any critical data changed that would require re-verification
            const dataChanged = (
                student.attendance !== req.body.attendance ||
                student.cgpa !== req.body.cgpa ||
                student.backlogs !== req.body.backlogs ||
                student.specialLabParticipation !== req.body.specialLabParticipation ||
                student.placementTraining !== req.body.placementTraining ||
                student.placementTrainingAttendance !== req.body.placementTrainingAttendance ||
                student.isNotInterestedInPlacement !== req.body.isNotInterestedInPlacement ||
                student.internshipStatus !== req.body.internshipStatus
            );

            Object.assign(student, req.body);

            // If critical data changed, reset verification status
            if (dataChanged && student.isVerified) {
                console.log('Student profile data changed, resetting verification status');
                student.academicVerification = 'Pending';
                student.labVerification = student.specialLabParticipation ? 'Pending' : 'N/A';
                student.placementVerification = student.isInterestedInNIP ? 'Pending' : 'N/A';
                student.isVerified = false;
                student.riskStatus = 'Not Predicted'; // Reset risk status too
            }

            const updatedStudent = await student.save();

            // Sync name back to User model so sidebar reflects it
            if (name) {
                const User = require('../models/User');
                await User.findOneAndUpdate({ email }, { name });
            }

            res.json(updatedStudent);
        } else {
            // If doesn't exist, create new
            student = new Student(req.body);
            const createdStudent = await student.save();
            res.status(201).json(createdStudent);
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
// @desc    Delete a student
// @route   DELETE /api/students/:id
const deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || id === 'undefined') {
            return res.status(400).json({ message: 'Invalid student ID' });
        }

        const student = await Student.findById(id);
        if (student) {
            const studentEmail = student.email;

            await student.deleteOne();

            // also remove associated user if present
            if (studentEmail) {
                try {
                    const User = require('../models/User');
                    await User.deleteOne({ email: studentEmail });
                } catch (err) {
                    console.warn('Could not delete linked user for', studentEmail, err.message);
                }
            }

            res.json({ message: 'Student removed' });
        } else {
            res.status(404).json({ message: 'Student not found' });
        }
    } catch (error) {
        console.error('Delete student error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Manually set risk status (Faculty only)
// @route   PATCH /api/students/:id/risk
const setRiskStatus = async (req, res) => {
    try {
        const { riskStatus } = req.body;
        const student = await Student.findById(req.params.id);

        if (student) {
            if (['Low Risk', 'High Risk', 'Not Predicted'].includes(riskStatus)) {
                student.riskStatus = riskStatus;
                const updatedStudent = await student.save();
                res.json(updatedStudent);
            } else {
                res.status(400).json({ message: 'Invalid risk status' });
            }
        } else {
            res.status(404).json({ message: 'Student not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    addStudent,
    getStudents,
    getStudentById,
    updateStudent,
    deleteStudent,
    verifyStudent,
    updateStudentProfile
};
