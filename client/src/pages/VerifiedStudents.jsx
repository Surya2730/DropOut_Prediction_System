import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
    CheckCircle,
    XCircle,
    Search,
    User,
    FileText,
    ExternalLink,
    ShieldCheck,
    History,
    RefreshCw,
    UserX,
    UserCheck,
    MoreHorizontal
} from 'lucide-react';

const VerifiedStudents = () => {
    const { user } = useAuth();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [remark, setRemark] = useState('');

    const getVerificationType = () => {
        if (user?.role === 'AcademicCoordinator') return 'academic';
        if (user?.role === 'LabCoordinator') return 'lab';
        if (user?.role === 'PlacementCoordinator') return 'placement';
        return 'all';
    };

    const vType = getVerificationType();

    const fetchVerifiedStudents = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`http://localhost:5000/api/students?role=${user?.role || 'Student'}`);
            // Filter students who are ALREADY verified or rejected by this coordinator
            const filtered = res.data.filter(s => {
                const currentStatus =
                    vType === 'academic' ? s.academicVerification :
                        vType === 'lab' ? s.labVerification :
                            vType === 'placement' ? s.placementVerification : null;

                return currentStatus !== 'Pending' && currentStatus !== 'N/A' && currentStatus !== null;
            });
            setStudents(filtered);
        } catch (err) {
            console.error('Error fetching students', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVerifiedStudents();
    }, [vType]);

    const handleReverify = async (id, status) => {
        try {
            await axios.patch(`http://localhost:5000/api/students/${id}/verify`, {
                type: vType,
                status: status,
                remark: remark
            });
            // Update local state instead of refetching for smoothness
            setStudents(students.map(s => {
                if (s._id === id) {
                    const updated = { ...s };
                    if (vType === 'academic') updated.academicVerification = status;
                    if (vType === 'lab') updated.labVerification = status;
                    if (vType === 'placement') updated.placementVerification = status;
                    return updated;
                }
                return s;
            }));
            if (selectedStudent?._id === id) {
                const updatedSel = { ...selectedStudent };
                if (vType === 'academic') {
                    updatedSel.academicVerification = status;
                    updatedSel.academicRemark = remark;
                }
                if (vType === 'lab') {
                    updatedSel.labVerification = status;
                    updatedSel.labRemark = remark;
                }
                if (vType === 'placement') {
                    updatedSel.placementVerification = status;
                    updatedSel.placementRemark = remark;
                }
                setSelectedStudent(updatedSel);
            }
        } catch (err) {
            console.error('Error updating status', err);
        }
    };

    const filteredStudents = students
        .filter(s =>
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.registerNo.includes(searchTerm)
        )
        .sort((a, b) => {
            // 1. Department wise (Alphabetical / Ascending)
            const deptA = a.department || '';
            const deptB = b.department || '';
            const deptCompare = deptA.localeCompare(deptB);
            if (deptCompare !== 0) return deptCompare;

            // 2. Year wise descending (e.g., '4th Year' before '1st Year')
            const yearA = a.year || '';
            const yearB = b.year || '';
            const yearCompare = yearB.localeCompare(yearA);
            if (yearCompare !== 0) return yearCompare;

            // 3. Roll number ascending
            const regA = a.registerNo || '';
            const regB = b.registerNo || '';
            return regA.localeCompare(regB);
        });

    // Group students by department and year
    const groupedStudents = filteredStudents.reduce((groups, student) => {
        const dept = student.department || 'Not Set';
        const year = student.year || 'Not Set';
        if (!groups[dept]) {
            groups[dept] = {};
        }
        if (!groups[dept][year]) {
            groups[dept][year] = [];
        }
        groups[dept][year].push(student);
        return groups;
    }, {});

    const getStatusStyle = (status) => {
        if (status === 'Verified') return { color: 'var(--success)', bg: 'rgba(16, 185, 129, 0.1)' };
        if (status === 'Rejected') return { color: 'var(--error)', bg: 'rgba(239, 68, 68, 0.1)' };
        return { color: 'var(--text-muted)', bg: 'rgba(255, 255, 255, 0.05)' };
    };

    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
            <div className="animate-spin" style={{ width: '50px', height: '50px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', marginBottom: '24px' }}></div>
            <p className="text-gradient" style={{ fontWeight: '600' }}>Retrieving Verification History...</p>
        </div>
    );

    return (
        <div className="animate-fade" style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                        <History size={20} color="var(--primary)" />
                        <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--primary)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Archival Access</span>
                    </div>
                    <h1 className="text-gradient" style={{ fontSize: '3rem', fontWeight: '900', letterSpacing: '-0.04em' }}>
                        Verified Students
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '8px' }}>Auditing history of processed student clearances.</p>
                </div>

                <button onClick={fetchVerifiedStudents} className="glass" style={{ padding: '12px 24px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)', fontWeight: '700', cursor: 'pointer' }}>
                    <RefreshCw size={18} /> Refresh Records
                </button>
            </div>

            <div className="glass" style={{ borderRadius: '28px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                <div style={{ padding: '32px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: '400px' }}>
                        <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                        <input
                            type="text"
                            placeholder="Identify archived record..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                padding: '14px 14px 14px 48px',
                                width: '100%',
                                background: 'rgba(15, 23, 42, 0.4)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '14px',
                                color: 'white',
                                outline: 'none'
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--success)' }}></div>
                            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>Verified: {students.filter(s => (vType === 'academic' ? s.academicVerification : vType === 'lab' ? s.labVerification : s.placementVerification) === 'Verified').length}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--error)' }}></div>
                            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>Rejected: {students.filter(s => (vType === 'academic' ? s.academicVerification : vType === 'lab' ? s.labVerification : s.placementVerification) === 'Rejected').length}</span>
                        </div>
                    </div>
                </div>

                <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={{ padding: '24px' }}>STUDENT IDENTITY</th>
                                <th>DEPARTMENT</th>
                                <th>ACADEMIC CGPA</th>
                                <th>CURRENT STATUS</th>
                                <th style={{ textAlign: 'center' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.keys(groupedStudents).length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '100px', color: 'var(--text-muted)' }}>
                                        <History size={48} style={{ marginBottom: '16px', opacity: 0.1, margin: '0 auto 16px' }} />
                                        <p style={{ fontWeight: '600', fontSize: '1.1rem' }}>No historical records found for this sector.</p>
                                    </td>
                                </tr>
                            ) : Object.keys(groupedStudents).sort().map(dept => (
                                <React.Fragment key={dept}>
                                    <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                                        <td colSpan="5" style={{ padding: '16px 24px', fontWeight: '700', color: 'var(--primary)', fontSize: '1.1rem', borderTop: '2px solid rgba(255,255,255,0.1)' }}>
                                            {dept}
                                        </td>
                                    </tr>
                                    {Object.keys(groupedStudents[dept]).sort((a, b) => b.localeCompare(a)).map(year => (
                                        <React.Fragment key={year}>
                                            <tr style={{ background: 'rgba(255,255,255,0.01)' }}>
                                                <td colSpan="5" style={{ padding: '12px 24px 8px 48px', fontWeight: '600', color: 'var(--text)', fontSize: '0.95rem' }}>
                                                    {year}
                                                </td>
                                            </tr>
                                            {groupedStudents[dept][year].map(student => {
                                                const status = vType === 'academic' ? student.academicVerification : vType === 'lab' ? student.labVerification : student.placementVerification;
                                                const style = getStatusStyle(status);
                                                return (
                                                    <tr key={student._id} style={{ transition: 'background 0.2s', cursor: 'default' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                                                        <td style={{ padding: '24px' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                                                    <User size={20} />
                                                                </div>
                                                                <div>
                                                                    <p style={{ fontWeight: '800' }}>{student.name}</p>
                                                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{student.registerNo}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td><span style={{ fontWeight: '700', fontSize: '0.85rem' }}>{student.department}</span></td>
                                                        <td style={{ fontWeight: '800', color: 'var(--primary)' }}>{student.cgpa}</td>
                                                        <td>
                                                            <div style={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '8px',
                                                                padding: '6px 14px',
                                                                borderRadius: '10px',
                                                                fontSize: '0.75rem',
                                                                fontWeight: '800',
                                                                background: style.bg,
                                                                color: style.color,
                                                                border: `1px solid ${style.color}33`
                                                            }}>
                                                                {status === 'Verified' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                                                {status.toUpperCase()}
                                                            </div>
                                                        </td>
                                                        <td style={{ textAlign: 'center' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                                                                <button
                                                                    onClick={() => handleReverify(student._id, status === 'Verified' ? 'Rejected' : 'Verified')}
                                                                    style={{
                                                                        padding: '8px 16px',
                                                                        borderRadius: '10px',
                                                                        background: 'rgba(255, 255, 255, 0.03)',
                                                                        border: '1px solid var(--glass-border)',
                                                                        color: 'var(--text-main)',
                                                                        fontSize: '0.8rem',
                                                                        fontWeight: '700',
                                                                        cursor: 'pointer',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '6px',
                                                                        transition: 'all 0.2s'
                                                                    }}
                                                                    onMouseOver={(e) => e.currentTarget.style.background = 'var(--primary-glow)'}
                                                                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
                                                                >
                                                                    <RefreshCw size={14} /> Toggle Status
                                                                </button>
                                                                <button
                                                                    onClick={() => setSelectedStudent(student)}
                                                                    style={{
                                                                        padding: '8px',
                                                                        borderRadius: '10px',
                                                                        background: 'rgba(255,255,255,0.03)',
                                                                        border: '1px solid var(--glass-border)',
                                                                        color: 'var(--text-muted)',
                                                                        cursor: 'pointer'
                                                                    }}
                                                                >
                                                                    <MoreHorizontal size={18} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </React.Fragment>
                                    ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Simple Modal for Details (Optional) */}
            {selectedStudent && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setSelectedStudent(null)}>
                    <div className="glass" style={{ width: '100%', maxWidth: '600px', padding: '48px', borderRadius: '32px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                            <div>
                                <h2 style={{ fontSize: '2rem', fontWeight: '900' }}>{selectedStudent.name}</h2>
                                <p style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Full Institutional Audit Record</p>
                            </div>
                            <button onClick={() => { setSelectedStudent(null); setRemark(''); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><XCircle size={24} /></button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                            <div className="glass-dark" style={{ padding: '20px', borderRadius: '20px' }}>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>REGISTER ID</p>
                                <p style={{ fontWeight: '800' }}>{selectedStudent.registerNo}</p>
                            </div>
                            <div className="glass-dark" style={{ padding: '20px', borderRadius: '20px' }}>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>DEPARTMENT</p>
                                <p style={{ fontWeight: '800' }}>{selectedStudent.department}</p>
                            </div>
                            {vType === 'lab' && (
                                <div className="glass-dark" style={{ padding: '20px', borderRadius: '20px' }}>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>ACADEMIC YEAR</p>
                                    <p style={{ fontWeight: '800' }}>{selectedStudent.year || '1st Year'}</p>
                                </div>
                            )}
                            <div className="glass-dark" style={{ padding: '20px', borderRadius: '20px' }}>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>ATTENDANCE</p>
                                <p style={{ fontWeight: '800' }}>{selectedStudent.attendance}%</p>
                            </div>
                            <div className="glass-dark" style={{ padding: '20px', borderRadius: '20px' }}>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>CGPA</p>
                                <p style={{ fontWeight: '800' }}>{selectedStudent.cgpa}</p>
                            </div>
                        </div>

                        {/* Remark Section */}
                        <div style={{ marginBottom: '40px' }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>Verification Remark</label>
                            <textarea
                                value={remark || (vType === 'academic' ? selectedStudent.academicRemark : vType === 'lab' ? selectedStudent.labRemark : selectedStudent.placementRemark) || ''}
                                onChange={(e) => setRemark(e.target.value)}
                                placeholder="Update remark for this student..."
                                style={{
                                    width: '100%',
                                    minHeight: '100px',
                                    background: 'rgba(15, 23, 42, 0.4)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '16px',
                                    padding: '16px',
                                    color: 'white',
                                    outline: 'none',
                                    fontSize: '0.9rem'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '16px' }}>
                            {selectedStudent.incomeCertificate && (
                                <a href={`http://localhost:5000${selectedStudent.incomeCertificate}`} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', textDecoration: 'none' }}>
                                    <FileText size={18} /> View Certificate
                                </a>
                            )}
                            <button onClick={() => setSelectedStudent(null)} className="glass" style={{ flex: 1, padding: '14px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>Close Record</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VerifiedStudents;
