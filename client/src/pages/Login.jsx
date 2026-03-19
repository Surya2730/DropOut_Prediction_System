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
        console.log('Google Login Success:', credentialResponse);
        try {
            const decoded = jwtDecode(credentialResponse.credential);
            const { email, name, sub: googleId } = decoded;

            const res = axios.post(`${API}/api/auth/google`, {
                email,
                name,
                googleId
            });

            login(res.data);
            setFormData({ email: '', password: '' }); // Clear form
            navigate('/');
        } catch (err) {
            setError('Google Login failed: Server connection issue');
            console.error('Frontend Google Auth Error:', err);
        }
    };

    const handleTraditionalLogin = async (e) => {
        e.preventDefault();
        try {
            const res = axios.post(`${API}/api/auth/login`, formData);
            login(res.data);
            setFormData({ email: '', password: '' }); // Clear form
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="auth-page">
            <div style={{
                display: 'flex',
                gap: '40px',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                maxWidth: '1000px',
                padding: '20px',
                flexWrap: 'wrap'
            }}>
                {/* Login Form */}
                <div className="auth-card glass animate-fade" style={{ flex: '1', minWidth: '380px', maxWidth: '440px' }}>
                    <div style={{ marginBottom: '32px', textAlign: 'center' }}>
                        <div style={{
                            width: '80px', height: '80px', background: 'white', borderRadius: '20px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
                            padding: '8px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            <img src="/BannariAmman_logo.png" alt="College Logo" style={{ width: '100%', height: 'auto', objectFit: 'contain' }} />
                        </div>
                        <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Welcome Back</h2>
                        <p style={{ color: 'var(--text-muted)' }}>Sign in to continue to Dropout Prediction System</p>
                    </div>

                    {error && <div style={{ color: '#ef4444', marginBottom: '16px', fontSize: '0.875rem', fontWeight: '600' }}>{error}</div>}

                    <form onSubmit={handleTraditionalLogin} autoComplete="new-password">
                        {/* Hidden dummy fields to defeat browser autofill */}
                        <div style={{ display: 'none' }}>
                            <input type="email" name="fakeusernameremembered" autoComplete="username" />
                            <input type="password" name="fakepasswordremembered" autoComplete="current-password" />
                        </div>

                        <div className="input-group">
                            <label>Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    style={{ paddingLeft: '40px' }}
                                    type="email"
                                    name="login_email_no_autofill"
                                    placeholder="name@college.edu"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    autoComplete="new-password"
                                    required
                                />
                            </div>
                        </div>
                        <div className="input-group">
                            <label>Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    style={{ paddingLeft: '40px' }}
                                    type="password"
                                    name="login_password_no_autofill"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    autoComplete="new-password"
                                    required
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn-primary">Sign In</button>
                    </form>

                    <div className="divider">OR</div>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError('Google Login Failed')} useOneTap theme="filled_blue" shape="pill" />
                    </div>
                </div>

                {/* Demo Credentials Panel */}
                <div className="glass animate-fade" style={{ flex: '1', minWidth: '320px', maxWidth: '400px', padding: '32px', borderRadius: '24px', animationDelay: '0.1s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                        <div style={{ padding: '8px', background: 'rgba(99,102,241,0.1)', borderRadius: '10px' }}><LogIn size={20} color="var(--primary)" /></div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Demo Credentials</h3>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: '1.5' }}>
                        Click any role below to instantly fill the login form for testing evaluation.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[
                            { role: 'Student', email: 'student1@gmail.com', pass: 'student1123', color: 'var(--success)' },
                            { role: 'Faculty', email: 'faculty@gmail.com', pass: 'Faculty123', color: 'var(--info)' },
                            { role: 'Academic Coord', email: 'academic@coordinator.com', pass: 'Academic123', color: 'var(--warning)' },
                            { role: 'Lab Coord', email: 'lab@coordinator.com', pass: 'Lab123', color: 'var(--accent)' },
                            { role: 'Placement Coord', email: 'placement@coordinator.com', pass: 'Placement123', color: 'var(--primary)' }
                        ].map((cred, i) => (
                            <div
                                key={i}
                                onClick={() => setFormData({ email: cred.email, password: cred.pass })}
                                style={{
                                    padding: '12px 16px',
                                    background: '#f8fafc',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                                onMouseOver={e => { e.currentTarget.style.borderColor = cred.color; e.currentTarget.style.background = 'rgba(99, 102, 241, 0.08)'; }}
                                onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.background = '#f8fafc'; }}
                            >
                                <div>
                                    <div style={{ fontSize: '0.75rem', fontWeight: '800', color: cred.color, textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.05em' }}>{cred.role}</div>
                                    <div style={{ fontSize: '0.85rem', fontFamily: 'monospace', color: 'var(--text-main)' }}>{cred.email}</div>
                                </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '4px 8px', borderRadius: '6px' }}>
                                    Auto-fill
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
