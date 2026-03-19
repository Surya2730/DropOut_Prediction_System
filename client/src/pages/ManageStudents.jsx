import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Users, Mail, Lock, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ManageStudents = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/auth/create-student`, formData);
            setMessage('Student account created successfully!');
            setFormData({ name: '', email: '', password: '' });
        } catch (error) {
            setMessage(error.response?.data?.message || 'Error creating student account');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="animate-fade">
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '8px' }}>
                    Manage Student Accounts
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                    Create login credentials for students to access the system.
                </p>
            </div>

            <div className="form-grid" style={{ gridTemplateColumns: '1fr', gap: '32px' }}>
                {/* Add Student Form */}
                <div className="card glass">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                        <UserPlus size={20} color="var(--primary)" />
                        <h3 style={{ fontSize: '1.25rem' }}>Add New Student</h3>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
                        <div className="form-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <User size={16} />
                                Student Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="Enter student full name"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px',
                                    background: 'var(--bg-secondary)',
                                    color: 'var(--text)'
                                }}
                            />
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <Mail size={16} />
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="student@example.com"
                                autoComplete="off"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px',
                                    background: 'var(--bg-secondary)',
                                    color: 'var(--text)'
                                }}
                            />
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <Lock size={16} />
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder="Enter a secure password"
                                autoComplete="new-password"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px',
                                    background: 'var(--bg-secondary)',
                                    color: 'var(--text)'
                                }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '12px 24px',
                                background: 'var(--primary)',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontSize: '1rem',
                                fontWeight: '600'
                            }}
                        >
                            {loading ? 'Creating...' : 'Create Student Account'}
                        </button>
                    </form>

                    {message && (
                        <div style={{
                            marginTop: '16px',
                            padding: '12px',
                            borderRadius: '8px',
                            background: message.includes('success') ? '#d1fae5' : '#fee2e2',
                            color: message.includes('success') ? '#065f46' : '#991b1b'
                        }}>
                            {message}
                        </div>
                    )}
                </div>

                {/* View Added Students */}
                <div className="card glass">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                        <Users size={20} color="var(--primary)" />
                        <h3 style={{ fontSize: '1.25rem' }}>View Added Students</h3>
                    </div>

                    <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
                        View all students added to the system, including sample students.
                    </p>

                    <button
                        onClick={() => navigate('/faculty/added-students')}
                        style={{
                            padding: '12px 24px',
                            background: '#3b82f6',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: '600'
                        }}
                    >
                        View Added Students
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ManageStudents;