import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
    Users,
    AlertTriangle,
    CheckCircle,
    TrendingUp,
    BarChart3,
    PieChart as PieChartIcon
} from 'lucide-react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

const Home = () => {
    const { user } = useAuth();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    const isFaculty = user?.role === 'Faculty';

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                // Return all students for faculty to compute overall stats
                const res = await axios.get(`http://localhost:5000/api/students`);
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

    if (loading) return <div className="animate-pulse" style={{ textAlign: 'center', padding: '100px', color: 'var(--text-muted)' }}>Analyzing institutional data...</div>;

    return (
        <div className="animate-fade">
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '8px' }}>
                    {isFaculty ? 'Institutional Analytics' : 'Student Progress'}
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                    {isFaculty
                        ? 'Real-time dropout risk assessment and demographic trends.'
                        : 'Review your personalized academic risk analysis.'}
                </p>
            </div>

            <div className="stats-grid" style={{ marginBottom: '32px' }}>
                <div className="card glass stat-card">
                    <Users size={24} color="var(--primary)" style={{ marginBottom: '12px' }} />
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Total Database</p>
                    <p className="stat-value">{students.length}</p>
                </div>
                <div className="card glass stat-card">
                    <AlertTriangle size={24} color="#f87171" style={{ marginBottom: '12px' }} />
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Critical Risk</p>
                    <p className="stat-value" style={{ color: '#f87171' }}>{highRiskCount}</p>
                </div>
                <div className="card glass stat-card">
                    <CheckCircle size={24} color="#4ade80" style={{ marginBottom: '12px' }} />
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Stable Students</p>
                    <p className="stat-value" style={{ color: '#4ade80' }}>{lowRiskCount}</p>
                </div>
                <div className="card glass stat-card">
                    <TrendingUp size={24} color="#60a5fa" style={{ marginBottom: '12px' }} />
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Risk Index</p>
                    <p className="stat-value" style={{ color: '#60a5fa' }}>
                        {students.length ? Math.round((highRiskCount / students.length) * 100) : 0}%
                    </p>
                </div>
            </div>

            <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>
                {/* Overall Distribution Chart */}
                <div className="card glass" style={{ height: '450px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                        <PieChartIcon size={20} color="var(--primary)" />
                        <h3 style={{ fontSize: '1.25rem' }}>Overall Risk Profile</h3>
                    </div>
                    <div style={{ flex: 1 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={120}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ background: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Departmental Analytics Bar Chart */}
                <div className="card glass" style={{ height: '450px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                        <BarChart3 size={20} color="var(--primary)" />
                        <h3 style={{ fontSize: '1.25rem' }}>Departmental Risk Breakdown</h3>
                    </div>
                    <div style={{ flex: 1 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="department" stroke="#94a3b8" fontSize={12} />
                                <YAxis stroke="#94a3b8" fontSize={12} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ background: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                                />
                                <Legend />
                                <Bar dataKey="highRisk" name="High Risk" fill="#f87171" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="lowRisk" name="Low Risk" fill="#4ade80" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
