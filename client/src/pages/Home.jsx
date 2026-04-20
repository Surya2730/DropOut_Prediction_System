import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Users,
    AlertTriangle,
    CheckCircle,
    TrendingUp,
    BarChart3,
    Search,
    PieChart as PieChartIcon,
    UserPlus
} from 'lucide-react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

const Home = () => {
    const { user } = useAuth();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const isFaculty = user?.role === 'Faculty';

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                // Return all students for faculty to compute overall stats
                const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/students`);
                setStudents(res.data);
            } catch (err) {
                console.error('Error fetching students', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, [user]);

    const highRiskCount = students.filter(s => s.riskStatus === 'High Risk').length;
    const lowRiskCount = students.filter(s => s.riskStatus === 'Low Risk').length;
    const notPredictedCount = students.filter(s => s.riskStatus === 'Not Predicted').length;

    // Data for Overall Distribution (Pie Chart)
    const pieData = [
        { name: 'High Risk', value: highRiskCount, color: '#f87171' },
        { name: 'Low Risk', value: lowRiskCount, color: '#4ade80' },
        { name: 'Unanalyzed', value: notPredictedCount, color: '#94a3b8' }
    ].filter(d => d.value > 0);

    // Data for Department-wise (Bar Chart)
    const deptStats = students.reduce((acc, student) => {
        const dept = student.department || 'Unknown';
        if (!acc[dept]) acc[dept] = { department: dept, highRisk: 0, lowRisk: 0 };
        if (student.riskStatus === 'High Risk') acc[dept].highRisk++;
        if (student.riskStatus === 'Low Risk') acc[dept].lowRisk++;
        return acc;
    }, {});

    const barData = Object.values(deptStats);

    // Data for Department-wise (Pie Chart) - Total students per department
    const deptPieData = Object.values(deptStats).map(d => ({
        name: d.department,
        value: d.highRisk + d.lowRisk,
        highRisk: d.highRisk,
        lowRisk: d.lowRisk
    })).filter(d => d.value > 0);

    const COLORS = ['#818cf8', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#f472b6'];

    if (loading) return <div className="animate-pulse" style={{ textAlign: 'center', padding: '100px', color: 'var(--text-muted)' }}>Analyzing institutional data...</div>;

    return (
        <div className="animate-fade">
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontWeight: '800', marginBottom: '8px' }}>
                    {isFaculty ? 'Student Dropout Prediction Analytics' : 'Student Progress'}
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                    Real-time dropout risk assessment and demographic trends.
                </p>
            </div>

            <div className="stats-grid" style={{ marginBottom: '32px' }}>
                <div className="card glass stat-card" onClick={() => isFaculty && navigate('/student-details')} style={{ cursor: isFaculty ? 'pointer' : 'default', padding: 'clamp(16px, 4vw, 28px)' }}>
                    <Users size={24} color="var(--primary)" style={{ marginBottom: '12px' }} />
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Total Students</p>
                    <p className="stat-value">{students.length}</p>
                </div>
                <div className="card glass stat-card" onClick={() => isFaculty && navigate('/student-details?risk=High Risk')} style={{ cursor: isFaculty ? 'pointer' : 'default', padding: 'clamp(16px, 4vw, 28px)' }}>
                    <AlertTriangle size={24} color="#f87171" style={{ marginBottom: '12px' }} />
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Critical Risk Students</p>
                    <p className="stat-value" style={{ color: '#f87171' }}>{highRiskCount}</p>
                </div>
                <div className="card glass stat-card" onClick={() => isFaculty && navigate('/student-details?risk=Low Risk')} style={{ cursor: isFaculty ? 'pointer' : 'default', padding: 'clamp(16px, 4vw, 28px)' }}>
                    <CheckCircle size={24} color="#4ade80" style={{ marginBottom: '12px' }} />
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Stable Students</p>
                    <p className="stat-value" style={{ color: '#4ade80' }}>{lowRiskCount}</p>
                </div>
                <div className="card glass stat-card" onClick={() => isFaculty && navigate('/student-details?risk=Not Predicted')} style={{ cursor: isFaculty ? 'pointer' : 'default', padding: 'clamp(16px, 4vw, 28px)' }}>
                    <Search size={24} color="var(--primary)" style={{ marginBottom: '12px' }} />
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Unpredicted Students</p>
                    <p className="stat-value">{notPredictedCount}</p>
                </div>
                {isFaculty && (
                    <div
                        className="card glass stat-card"
                        onClick={() => navigate('/faculty/manage-students')}
                        style={{ cursor: 'pointer' }}
                    >
                        <UserPlus size={24} color="var(--primary)" style={{ marginBottom: '12px' }} />
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Manage Students</p>
                        <p className="stat-value">Add Accounts</p>
                    </div>
                )}
            </div>

            <div className="form-grid" style={{ gap: '32px' }}>
                {/* Overall Distribution Chart */}
                <div className="card glass" style={{ minHeight: 'clamp(300px, 50vh, 400px)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                        <PieChartIcon size={20} color="var(--primary)" />
                        <h3 style={{ fontSize: '1.25rem' }}>Overall Risk Profile</h3>
                    </div>
                    <div style={{ flex: 1, minHeight: '200px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ background: '#ffffff', border: '1px solid var(--glass-border)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    itemStyle={{ color: 'var(--text-main)' }}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Departmental Analytics Pie Chart */}
                <div className="card glass" style={{ minHeight: 'clamp(300px, 50vh, 400px)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                        <PieChartIcon size={20} color="var(--primary)" />
                        <h3 style={{ fontSize: '1.25rem' }}>Departmental Distribution</h3>
                    </div>
                    <div style={{ flex: 1, minHeight: '200px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={deptPieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {deptPieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value, name, props) => [
                                        `Total: ${value} Students\nHigh Risk: ${props.payload.highRisk}\nLow Risk: ${props.payload.lowRisk}`,
                                        name
                                    ]}
                                    contentStyle={{ background: '#ffffff', border: '1px solid var(--glass-border)', borderRadius: '8px', whiteSpace: 'pre-line', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    itemStyle={{ color: 'var(--text-main)' }}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
