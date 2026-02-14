const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        // Optional because Google users might not have a local password
    },
    googleId: {
        type: String,
    },
    role: {
        type: String,
        enum: ['Faculty', 'Student'],
        default: 'Student',
    }
}, {
    timestamps: true,
});

const User = mongoose.model('User', userSchema);

module.exports = User;
