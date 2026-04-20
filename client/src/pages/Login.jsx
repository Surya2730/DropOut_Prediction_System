import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { LogIn, Mail, Lock } from 'lucide-react';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
console.log("API URL:", API);

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const decoded = jwtDecode(credentialResponse.credential);
            const { email, name, sub: googleId } = decoded;

            const res = await axios.post(`${API}/api/auth/google`, {
                email,
                name,
                googleId
            });

            if (res.data) {
                login(res.data);
                setFormData({ email: '', password: '' });
                navigate('/');
            } else {
                setError("Invalid Google login response");
            }
        } catch (err) {
            console.error(err);
            setError('Google Login failed');
        }
    };

    const handleTraditionalLogin = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post(`${API}/api/auth/login`, formData);

            if (res.data) {
                login(res.data);
                setFormData({ email: '', password: '' });
                navigate('/');
            } else {
                setError("Invalid response from server");
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card glass animate-fade">
                    <div style={{ marginBottom: '32px', textAlign: 'center' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            background: 'white',
                            borderRadius: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px',
                            padding: '8px',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
                        }}>
                            <img src="/BannariAmman_logo.png" alt="Logo" style={{ width: '100%' }} />
                        </div>

                        <h2>Welcome Back</h2>
                        <p>Sign in to continue</p>
                    </div>

                    {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

                    <form onSubmit={handleTraditionalLogin}>
                        <div className="input-group">
                            <label>Email</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    style={{ paddingLeft: '35px', width: '100%', boxSizing: 'border-box' }}
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                    style={{ paddingLeft: '35px', width: '100%', boxSizing: 'border-box' }}
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn-primary" style={{ width: '100%', boxSizing: 'border-box' }}>
                            Sign In
                        </button>
                    </form>

                    <div className="divider">OR</div>

                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => setError('Google Login Failed')}
                            theme="filled_blue"
                            shape="pill"
                        />
                    </div>
                </div>

                {/* ✅ UPDATED DEMO PANEL */}
                <div className="glass animate-fade demo-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                        <div style={{ padding: '8px', background: 'rgba(99,102,241,0.1)', borderRadius: '10px' }}>
                            <LogIn size={20} color="var(--primary)" />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                            Demo Credentials
                        </h3>
                    </div>

                    <p style={{ fontSize: '0.85rem', marginBottom: '20px' }}>
                        Click to auto-fill login details
                    </p>

                    {[
                        { role: 'Student', email: 'student1@gmail.com', pass: 'student1123', color: '#22c55e' },
                        { role: 'Faculty', email: 'faculty@gmail.com', pass: 'Faculty123', color: '#3b82f6' },
                        { role: 'Academic Coordinator', email: 'academic@coordinator.com', pass: 'Academic123', color: '#f59e0b' },
                        { role: 'Lab Coordinator', email: 'lab@coordinator.com', pass: 'Lab123', color: '#a855f7' },
                        { role: 'Placement Coordinator', email: 'placement@coordinator.com', pass: 'Placement123', color: '#6366f1' }
                    ].map((cred, i) => (
                        <div
                            key={i}
                            onClick={() => setFormData({ email: cred.email, password: cred.pass })}
                            style={{
                                padding: '14px',
                                marginBottom: '10px',
                                borderRadius: '12px',
                                border: '1px solid #e5e7eb',
                                cursor: 'pointer'
                            }}
                        >
                            <strong style={{ color: cred.color }}>{cred.role}</strong>
                            <div style={{ fontSize: '0.85rem' }}>{cred.email}</div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default Login;