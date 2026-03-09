const mongoose = require('mongoose');

const studentSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    registerNo: {
        type: String,
        required: true,
        unique: true,
    },
    department: {
        type: String,
        required: true,
    },
    year: {
        type: String,
        default: '1st Year'
    },
    // Academic Details
    attendance: { type: Number, required: true },
    completedSemesters: { type: Number, default: 0 },
    sem1Marks: { type: Number, default: 0 },
    sem2Marks: { type: Number, default: 0 },
    sem3Marks: { type: Number, default: 0 },
    sem4Marks: { type: Number, default: 0 },
    sem5Marks: { type: Number, default: 0 },
    sem6: { type: Number, default: 0 },
    sem7: { type: Number, default: 0 },
    sem8: { type: Number, default: 0 },
    cgpa: { type: Number, required: true },
    isAboveAverage: { type: Boolean, default: false },
    avgClassMark: { type: Number, default: 0 },
    backlogs: { type: Number, required: true },

    // Socio-Economic Details
    annualIncome: { type: Number, default: 0 },
    isPWD: { type: Boolean, default: false },
    hasUnpaidFees: { type: Boolean, default: false },
    unpaidAmount: { type: Number, default: 0 },

    // Academic Engagement
    academicParticipation: { type: Boolean, default: false },

    // Sports & Extra-Curricular
    sportsInterest: { type: Boolean, default: false },
    sportsField: { type: String, default: '' },
    isTeamMemberOrSubstitute: {
        type: String,
        enum: ['None', 'Team Member', 'Substitute'],
        default: 'None'
    },
    hasTalents: { type: Boolean, default: false },

    // Technical & Skill Development
    specialLabParticipation: { type: Boolean, default: false },
    specialLabName: { type: String, default: '' },

    // Events & Achievements
    eventParticipation: { type: Boolean, default: false },
    eventWinner: { type: Boolean, default: false },

    // Placement Preparation
    placementTraining: { type: Boolean, default: false },
    placementTrainingAttendance: { type: Number, default: 0 },
    isInterestedInNIP: { type: Boolean, default: false },
    isNotInterestedInPlacement: { type: Boolean, default: false },
    placementPercentage: { type: Number, default: 0 },
    avgMockScore: { type: Number, default: 0 },

    // Internship Details
    internshipStatus: { type: Boolean, default: false },
    isPaidInternship: { type: Boolean, default: false },
    stipendAmount: { type: Number, default: 0 },

    // Mental Health & Well-Being
    stressLevel: { type: Number, min: 1, max: 5, default: 1 },
    depressionSigns: { type: Boolean, default: false },

    // Verification Details
    academicVerification: {
        type: String,
        enum: ['Pending', 'Verified', 'Rejected'],
        default: 'Pending'
    },
    labVerification: {
        type: String,
        enum: ['Pending', 'Verified', 'Rejected', 'N/A'],
        default: 'Pending'
    },
    placementVerification: {
        type: String,
        enum: ['Pending', 'Verified', 'Rejected', 'N/A'],
        default: 'Pending'
    },
    academicRemark: { type: String, default: '' },
    labRemark: { type: String, default: '' },
    placementRemark: { type: String, default: '' },
    incomeCertificate: {
        type: String,
        default: ''
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    riskStatus: {
        type: String,
        enum: ['Low Risk', 'High Risk', 'Not Predicted'],
        default: 'Not Predicted',
    },
}, {
    timestamps: true,
});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
