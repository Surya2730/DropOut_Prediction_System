import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { LogIn, Mail, Lock } from 'lucide-react';

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

            const res = await axios.post('http://localhost:5000/api/auth/google', {
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
            const res = await axios.post('http://localhost:5000/api/auth/login', formData);
            login(res.data);
            setFormData({ email: '', password: '' }); // Clear form
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="auth-page">
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
                        overflow: 'hidden',
                        padding: '8px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <img
                            src="/BannariAmman_logo.png"
                            alt="College Logo"
                            style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                        />
                    </div>
                    <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Welcome Back</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Sign in to continue to Dropout Prediction System</p>
                </div>

                {error && <div style={{ color: '#ef4444', marginBottom: '16px', fontSize: '0.875rem' }}>{error}</div>}

                <form onSubmit={handleTraditionalLogin} autoComplete="off">
                    <div className="input-group">
                        <label>Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                style={{ paddingLeft: '40px' }}
                                type="email"
                                placeholder="name@college.edu"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                autoComplete="off"
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
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                autoComplete="new-password"
                                required
                            />
                        </div>
                    </div>
                    <button type="submit" className="btn-primary">
                        Sign In
                    </button>
                </form>

                <div className="divider">OR</div>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={(err) => {
                            console.error('Google OAuth Error:', err);
                            setError('Google Login Failed: Check your Client ID and Authorized Origins');
                        }}
                        useOneTap
                        theme="filled_blue"
                        shape="pill"
                    />
                </div>
            </div>
        </div>
    );
};

export default Login;
