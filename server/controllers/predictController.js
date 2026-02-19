const axios = require('axios');
const Student = require('../models/Student');

// @desc    Predict dropout risk
// @route   POST /api/predict
// @access  Public
const predictDropout = async (req, res) => {
    const {
        _id, email, attendance, completedSemesters, sem1Marks, sem2Marks, sem3Marks, sem4Marks, sem5Marks,
        sem6, sem7, sem8, cgpa,
        isAboveAverage, backlogs, annualIncome, isPWD, academicParticipation,
        sportsInterest, sportsField, isTeamMemberOrSubstitute, hasTalents,
        specialLabParticipation, specialLabName, eventParticipation, eventWinner,
        placementTraining, placementTrainingAttendance, isNotInterestedInPlacement,
        internshipStatus, isPaidInternship, stipendAmount, stressLevel,
        depressionSigns
    } = req.body;

    try {
        let riskResult = "Unknown";

        // Map team member status to numeric
        const getTeamStatus = (status) => {
            switch (status) {
                case 'Team Member': return 1;
                case 'Substitute': return 2;
                default: return 0;
            }
        };

        const mlData = {
            semesters_completed: completedSemesters || 0,
            sem1_marks: sem1Marks || 0,
            sem2_marks: sem2Marks || 0,
            sem3_marks: sem3Marks || 0,
            sem4_marks: sem4Marks || 0,
            sem5_marks: sem5Marks || 0,
            sem6_marks: sem6 || 0,
            sem7_marks: sem7 || 0,
            sem8_marks: sem8 || 0,
            cgpa: cgpa || 0,
            above_average_student: isAboveAverage ? 1 : 0,
            attendance: attendance || 0,
            backlogs: backlogs || 0,
            family_income: annualIncome || 0,
            pwd: isPWD ? 1 : 0,
            participates_academics: academicParticipation ? 1 : 0,
            sports_person: sportsInterest ? 1 : 0,
            college_team: getTeamStatus(isTeamMemberOrSubstitute),
            extracurricular_talent: hasTalents ? 1 : 0,
            special_lab_participation: specialLabParticipation ? 1 : 0,
            event_participation: eventParticipation ? 1 : 0,
            event_winner: eventWinner ? 1 : 0,
            placement_training_attended: placementTraining ? 1 : 0,
            placement_training_attendance: placementTrainingAttendance || 0,
            placement_interest: isNotInterestedInPlacement ? 0 : 1, // 0 if not interested, 1 if interested
            internship_attended: internshipStatus ? 1 : 0,
            internship_type: isPaidInternship ? 1 : 0,
            internship_stipend_amount: stipendAmount || 0,
            stress_level: stressLevel || 1,
            depression_flag: depressionSigns ? 1 : 0
        };

        try {
            const response = await axios.post('http://localhost:5001/predict', mlData);
            const prediction = response.data.dropout_risk;

            if (prediction === 1) {
                riskResult = "High Risk";
            } else {
                riskResult = "Low Risk";
            }

            // Update the student record in the database
            if (_id) {
                await Student.findByIdAndUpdate(_id, { riskStatus: riskResult });
            } else if (email) {
                await Student.findOneAndUpdate({ email }, { riskStatus: riskResult });
            }

        } catch (mlError) {
            console.error("ML Service Error:", mlError.message);
            return res.status(503).json({ message: "Prediction Service Unavailable (Make sure ML API is running on port 5001)" });
        }

        res.json({ riskStatus: riskResult });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    predictDropout,
};
