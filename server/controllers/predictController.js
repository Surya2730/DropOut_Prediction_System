const axios = require('axios');
const Student = require('../models/Student');

// @desc    Predict dropout risk
// @route   POST /api/predict
// @access  Public
const predictDropout = async (req, res) => {
    const studentData = req.body;

    console.log('Prediction request received for student:', studentData.name, studentData.registerNo);
    console.log('Student verification status:', {
        academic: studentData.academicVerification,
        lab: studentData.labVerification,
        placement: studentData.placementVerification,
        isVerified: studentData.isVerified
    });

    // Check if student is fully verified
    if (!studentData.isVerified) {
        return res.status(400).json({
            message: 'Student must be fully verified by all coordinators before prediction',
            riskStatus: 'Not Verified'
        });
    }

    const {
        _id, email, attendance, completedSemesters, sem1Marks, sem2Marks, sem3Marks, sem4Marks, sem5Marks,
        sem6, sem7, sem8, cgpa,
        isAboveAverage, backlogs, annualIncome, isPWD, academicParticipation,
        sportsInterest, sportsField, isTeamMemberOrSubstitute, hasTalents,
        specialLabParticipation, specialLabName, eventParticipation, eventWinner,
        placementTraining, placementTrainingAttendance, isNotInterestedInPlacement,
        internshipStatus, isPaidInternship, stipendAmount, stressLevel,
        depressionSigns, hasUnpaidFees
    } = studentData;

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

        console.log('Sending data to ML service:', mlData);

        // --- Stricter Heuristic Risk Scoring Logic ---
        let riskScore = 0;
        const safeCgpa = parseFloat(cgpa) || 10;
        const safeAttendance = parseFloat(attendance) || 100;
        const safeBacklogs = parseInt(backlogs) || 0;

        // Critical Risk Factors (High Weight)
        if (safeCgpa < 4.5) riskScore += 5;      // Very low CGPA
        else if (safeCgpa < 5.5) riskScore += 4; // Low CGPA
        else if (safeCgpa < 6.5) riskScore += 2; // Below average CGPA

        if (safeAttendance < 50) riskScore += 5;  // Very low attendance
        else if (safeAttendance < 65) riskScore += 4; // Low attendance
        else if (safeAttendance < 75) riskScore += 2; // Below standard attendance

        if (safeBacklogs > 5) riskScore += 5;     // Many backlogs
        else if (safeBacklogs > 3) riskScore += 4; // Several backlogs
        else if (safeBacklogs > 1) riskScore += 2; // Some backlogs

        // Mental & Social Factors
        if (depressionSigns) riskScore += 3;      // Depression indicator
        if (parseInt(stressLevel) >= 4) riskScore += 2; // High stress
        if (parseInt(stressLevel) === 5) riskScore += 1; // Extreme stress

        // Placement Concerns
        if (isNotInterestedInPlacement) riskScore += 2;
        if (!placementTraining) riskScore += 1;

        // Financial Concerns
        if (annualIncome < 50000) riskScore += 1; // Very low income
        if (hasUnpaidFees) riskScore += 2;        // Unpaid fees

        // Protective Factors (Reduce Risk)
        if (specialLabParticipation) riskScore -= 2;   // Lab participation
        if (internshipStatus) riskScore -= 2;         // Internship experience
        if (academicParticipation) riskScore -= 1;    // Academic engagement
        if (eventWinner) riskScore -= 1;              // Event winners
        if (isPaidInternship) riskScore -= 1;         // Paid internship

        // Stricter threshold: need >= 6 points for high risk
        const isHighRiskByHeuristic = riskScore >= 6;
        // --------------------------------

        try {
            console.log('Attempting ML service prediction...');
            const response = await axios.post('http://localhost:5001/predict', mlData, {
                timeout: 10000 // 10 second timeout
            });
            const prediction = response.data.dropout_risk;
            console.log('ML service prediction result:', prediction);

            if (prediction === 1 || isHighRiskByHeuristic) {
                riskResult = "High Risk";
            } else {
                riskResult = "Low Risk";
            }

            console.log('Final risk result:', riskResult);

            // Update the student record in the database
            if (_id) {
                await Student.findByIdAndUpdate(_id, { riskStatus: riskResult });
                console.log('Updated student risk status in database');
            } else if (email) {
                await Student.findOneAndUpdate({ email }, { riskStatus: riskResult });
                console.log('Updated student risk status in database by email');
            }

        } catch (mlError) {
            console.error("ML Service Error:", mlError.message);
            console.log('Falling back to heuristic analysis...');

            // Fallback to heuristic result if ML service is down
            riskResult = isHighRiskByHeuristic ? "High Risk" : "Low Risk";
            console.log('Heuristic risk result:', riskResult);

            if (_id) {
                await Student.findByIdAndUpdate(_id, { riskStatus: riskResult });
            } else if (email) {
                await Student.findOneAndUpdate({ email }, { riskStatus: riskResult });
            }

            return res.json({
                riskStatus: riskResult,
                message: "Prediction based on heuristic analysis (ML Service Unavailable)",
                heuristicScore: riskScore,
                threshold: 6
            });
        }

        res.json({
            riskStatus: riskResult,
            message: "Prediction completed successfully",
            heuristicScore: riskScore,
            threshold: 6
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    predictDropout,
};
