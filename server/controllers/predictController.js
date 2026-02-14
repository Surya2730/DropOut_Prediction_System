const axios = require('axios');
const Student = require('../models/Student');

// @desc    Predict dropout risk
// @route   POST /api/predict
// @access  Public
const predictDropout = async (req, res) => {
    const {
        _id, email, attendance, sem1Marks, sem2Marks, sem3Marks, sem4Marks, sem5Marks,
        sem6, sem7, sem8, cgpa,
        isAboveAverage, backlogs, annualIncome, isPWD, academicParticipation,
        sportsInterest, sportsField, isTeamMemberOrSubstitute, hasTalents,
        specialLabParticipation, specialLabName, eventParticipation, eventWinner,
        placementTraining, placementTrainingAttendance, isInterestedInNIP,
        internshipStatus, isPaidInternship, stipendAmount, stressLevel,
        depressionSigns
    } = req.body;

    try {
        let riskResult = "Unknown";

        const mlData = {
            attendance, sem1Marks, sem2Marks, sem3Marks, sem4Marks, sem5Marks,
            sem6, sem7, sem8, cgpa,
            isAboveAverage, backlogs, annualIncome, isPWD, academicParticipation,
            sportsInterest, sportsField, isTeamMemberOrSubstitute, hasTalents,
            specialLabParticipation, specialLabName, eventParticipation, eventWinner,
            placementTraining, placementTrainingAttendance, isInterestedInNIP,
            internshipStatus, isPaidInternship, stipendAmount, stressLevel,
            depressionSigns
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
