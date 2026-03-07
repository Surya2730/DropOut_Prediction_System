import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Trash2, Edit, User, GraduationCap, AlertTriangle, CheckCircle, BrainCircuit } from 'lucide-react';

const StudentDetails = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    // Get risk filter from URL
    const searchParams = new URLSearchParams(location.search);
    const riskFilter = searchParams.get('risk');

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/students');
            setStudents(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching students:', err);
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this student record?')) {
            try {
                await axios.delete(`http://localhost:5000/api/students/${id}`);
                setStudents(students.filter(s => s._id !== id));
            } catch (err) {
                alert('Error deleting student');
            }
        }
    };

    const handleEdit = (id) => {
        navigate(`/edit-student/${id}`);
    };

    const filteredStudents = students
        .filter(student => {
            // First apply risk filter if present
            if (riskFilter && student.riskStatus !== riskFilter) return false;

            // Then apply search term filter
            return (
                student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.registerNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.department.toLowerCase().includes(searchTerm.toLowerCase())
            );
        })
        .sort((a, b) => {
            const deptCompare = a.department.localeCompare(b.department);
            if (deptCompare !== 0) return deptCompare;
            return a.registerNo.localeCompare(b.registerNo);
        });

    if (loading) return <div className="animate-pulse" style={{ textAlign: 'center', padding: '100px', color: 'var(--text-muted)' }}>Loading records...</div>;

    const getPageTitle = () => {
        if (riskFilter === 'High Risk') return 'Critical Risk Students';
        if (riskFilter === 'Low Risk') return 'Stable Students';
        if (riskFilter === 'Not Predicted') return 'Unpredicted Students';
        return 'Student Details';
    };

    const getPageDescription = () => {
        if (riskFilter === 'High Risk') return 'Prioritized list of students requiring immediate academic intervention.';
        if (riskFilter === 'Low Risk') return 'List of students with consistent academic performance.';
        if (riskFilter === 'Not Predicted') return 'Students who have not yet undergone AI risk assessment.';
        return 'Administrative overview of institutional student records.';
    };

    return (
        <div className="animate-fade" style={{ paddingBottom: '40px' }}>
            <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2.25rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {riskFilter === 'High Risk' && <AlertTriangle size={32} color="#f87171" />}
                        {riskFilter === 'Low Risk' && <CheckCircle size={32} color="#4ade80" />}
                        {riskFilter === 'Not Predicted' && <Search size={32} color="var(--primary)" />}
                        {getPageTitle()}
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>{getPageDescription()}</p>
                </div>
                <div style={{ position: 'relative', width: '300px' }}>
                    <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                    <input
                        type="text"
                        placeholder="Search by Name, Reg No, or Dept..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px 12px 12px 40px',
                            borderRadius: '10px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: 'white'
                        }}
                    />
                </div>
            </div>

            <div className="card glass" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <tr>
                            <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase' }}>Individual Identity</th>
                            <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase' }}>Academic Context</th>
                            <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase' }}>Performance</th>
                            <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase' }}>Analysis Status</th>
                            <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.length === 0 ? (
                            <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No student records found.</td></tr>
                        ) : filteredStudents.map(student => (
                            <tr key={student._id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }} className="table-row">
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontWeight: '700'
                                        }}>
                                            {student.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '600', color: 'white' }}>{student.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '500' }}>{student.registerNo}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{student.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ fontWeight: '500' }}>{student.department}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{student.attendance}% Attendance</div>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ padding: '4px 8px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '6px', color: '#60a5fa', fontSize: '0.85rem', fontWeight: '600' }}>
                                            CGPA {student.cgpa}
                                        </div>
                                        {student.backlogs > 0 && (
                                            <div style={{ padding: '4px 8px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px', color: '#f87171', fontSize: '0.85rem', fontWeight: '600' }}>
                                                {student.backlogs} Backlogs
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <span style={{
                                        padding: '6px 12px',
                                        borderRadius: '20px',
                                        fontSize: '0.8rem',
                                        fontWeight: '700',
                                        background: student.riskStatus === 'High Risk' ? 'rgba(239, 68, 68, 0.1)' :
                                            student.riskStatus === 'Low Risk' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255,255,255,0.05)',
                                        color: student.riskStatus === 'High Risk' ? '#f87171' :
                                            student.riskStatus === 'Low Risk' ? '#4ade80' : 'var(--text-muted)',
                                        border: `1px solid ${student.riskStatus === 'High Risk' ? 'rgba(239, 68, 68, 0.2)' :
                                            student.riskStatus === 'Low Risk' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255,255,255,0.1)'}`
                                    }}>
                                        {student.riskStatus || 'Not Analyzed'}
                                    </span>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {student.riskStatus === 'Not Predicted' && (
                                            <button
                                                onClick={() => navigate(`/predict?studentId=${student._id}`)}
                                                style={{
                                                    padding: '8px',
                                                    borderRadius: '8px',
                                                    background: 'rgba(168, 85, 247, 0.1)',
                                                    color: '#a855f7',
                                                    border: 'none',
                                                    cursor: 'pointer'
                                                }}
                                                title="Run AI Prediction"
                                            >
                                                <BrainCircuit size={18} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleEdit(student._id)}
                                            style={{
                                                padding: '8px',
                                                borderRadius: '8px',
                                                background: 'rgba(96, 165, 250, 0.1)',
                                                color: '#60a5fa',
                                                border: 'none',
                                                cursor: 'pointer'
                                            }}
                                            title="Edit student record"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(student._id)}
                                            style={{
                                                padding: '8px',
                                                borderRadius: '8px',
                                                background: 'rgba(239,68,68,0.1)',
                                                color: '#f87171',
                                                border: 'none',
                                                cursor: 'pointer'
                                            }}
                                            title="Delete student record"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StudentDetails;
