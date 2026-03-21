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

    // ✅ GOOGLE LOGIN
    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const decoded = jwtDecode(credentialResponse.credential);
            const { email, name, sub: googleId } = decoded;

            const res = await axios.post(`${API}/api/auth/google`, {
                email,
                name,
                googleId
            });

            console.log("GOOGLE RESPONSE:", res.data);

            if (res.data) {
                login(res.data);
                setFormData({ email: '', password: '' });
                navigate('/');
            } else {
                setError("Invalid Google login response");
            }

        } catch (err) {
            console.error("Google Login Error:", err);
            setError('Google Login failed');
        }
    };

    // ✅ NORMAL LOGIN
    const handleTraditionalLogin = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post(`${API}/api/auth/login`, formData);

            console.log("LOGIN RESPONSE:", res.data);

            if (res.data) {
                login(res.data);
                setFormData({ email: '', password: '' });
                navigate('/');
            } else {
                setError("Invalid response from server");
            }

        } catch (err) {
            console.error("Login Error:", err);
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

                {/* LOGIN FORM */}
                <div className="auth-card glass animate-fade" style={{ flex: '1', minWidth: '380px', maxWidth: '440px' }}>
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
                                    style={{ paddingLeft: '35px' }}
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
                                    style={{ paddingLeft: '35px' }}
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn-primary">
                            Sign In
                        </button>
                    </form>

                    <div className="divider">OR</div>

                    {/* ✅ GOOGLE LOGIN (FIXED) */}
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => setError('Google Login Failed')}
                            theme="filled_blue"
                            shape="pill"
                        />
                    </div>
                </div>

                {/* DEMO PANEL */}
                <div style={{ padding: '20px' }}>
                    <h3>Demo Credentials</h3>

                    {[
                        { email: 'student1@gmail.com', password: 'student1123' },
                        { email: 'faculty@gmail.com', password: 'Faculty123' }
                    ].map((cred, i) => (
                        <div
                            key={i}
                            onClick={() => setFormData(cred)}
                            style={{ cursor: 'pointer', margin: '10px 0' }}
                        >
                            {cred.email}
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default Login;