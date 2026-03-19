import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
    CheckCircle,
    XCircle,
    Eye,
    Search,
    User,
    FileText,
    ExternalLink,
    ShieldCheck,
    UserCheck,
    AlertCircle,
    ArrowRight,
    Lock
} from 'lucide-react';

const Verification = () => {
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

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/students?role=${user?.role || 'Student'}`);
                const filtered = res.data.filter(s => {
                    if (vType === 'academic') return s.academicVerification === 'Pending';
                    if (vType === 'lab') return s.labVerification === 'Pending';
                    if (vType === 'placement') {
                        // Stricter filtering for Placement Coordinator
                        return s.placementVerification === 'Pending' && s.isInterestedInNIP === true;
                    }
                    return true;
                });
                setStudents(filtered);
            } catch (err) {
                console.error('Error fetching students', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, [vType, user?.role]);

    const handleVerify = async (id, status) => {
        if (status === 'Rejected' && !remark) {
            alert('Please provide a reason for rejection in the remark field.');
            return;
        }

        try {
            await axios.patch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/students/${id}/verify`, {
                type: vType,
                status: status,
                remark: remark
            });
            setStudents(students.filter(s => s._id !== id));
            setSelectedStudent(null);
            setRemark('');
        } catch (err) {
            console.error('Error verifying student', err);
            alert('Security clearance failed. Sync error.');
        }
    };

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.registerNo.includes(searchTerm)
    );

    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
            <div className="animate-spin" style={{ width: '50px', height: '50px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', marginBottom: '24px' }}></div>
            <p className="text-gradient" style={{ fontWeight: '600' }}>Accessing Verification Vault...</p>
        </div>
    );

    return (
        <div className="animate-fade" style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                        <ShieldCheck size={20} color="var(--primary)" />
                        <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--primary)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Administrative Gateway</span>
                    </div>
                    <h1 className="text-gradient" style={{ fontSize: '3rem', fontWeight: '900', letterSpacing: '-0.04em' }}>
                        Pending Verifications
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '8px' }}>Reviewing {vType.toUpperCase()} institutional data integrity.</p>
                </div>

                <div className="glass" style={{ padding: '16px 24px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>PENDING QUEUE</p>
                        <p style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--primary)' }}>{students.length} Students</p>
                    </div>
                    <UserCheck size={32} color="var(--primary)" style={{ opacity: 0.5 }} />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: selectedStudent ? '400px 1fr' : '1fr', gap: '32px', alignItems: 'start' }}>

                {/* Search and List */}
                <div className="glass" style={{ padding: '24px', borderRadius: '28px', border: '1px solid var(--glass-border)' }}>
                    <div style={{ position: 'relative', marginBottom: '24px' }}>
                        <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                        <input
                            type="text"
                            placeholder="Identify student by name or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                padding: '16px 16px 16px 48px',
                                width: '100%',
                                background: '#f8fafc',
                                border: '1.5px solid var(--glass-border)',
                                borderRadius: '16px',
                                color: 'var(--text-main)',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '650px', overflowY: 'auto', paddingRight: '8px' }}>
                        {filteredStudents.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                                <AlertCircle size={40} style={{ marginBottom: '16px', opacity: 0.2, margin: '0 auto 16px' }} />
                                <p style={{ fontWeight: '600' }}>No pending clearance found.</p>
                            </div>
                        ) : (
                            filteredStudents.map(student => (
                                <div
                                    key={student._id}
                                    onClick={() => setSelectedStudent(student)}
                                    className="animate-fade"
                                    style={{
                                        padding: '20px',
                                        borderRadius: '20px',
                                        cursor: 'pointer',
                                        background: selectedStudent?._id === student._id ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                                        border: '1px solid',
                                        borderColor: selectedStudent?._id === student._id ? 'rgba(99, 102, 241, 0.3)' : 'var(--glass-border)',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
                                    <div>
                                        <p style={{ fontWeight: '800', fontSize: '1rem', color: selectedStudent?._id === student._id ? 'var(--text-main)' : 'var(--text-main)' }}>{student.name}</p>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: '600' }}>{student.registerNo} • {student.department}</p>
                                    </div>
                                    <div style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '10px',
                                        background: selectedStudent?._id === student._id ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: selectedStudent?._id === student._id ? 'var(--text-main)' : 'var(--text-muted)',
                                        transition: 'all 0.3s'
                                    }}>
                                        <ArrowRight size={16} />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Detailed View Modal (Glass Style) */}
                {selectedStudent ? (
                    <div className="glass animate-fade" style={{ padding: '48px', borderRadius: '32px', alignSelf: 'start', position: 'relative', overflow: 'hidden' }}>
                        {/* Decorative background flare */}
                        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: 'radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)', opacity: 0.1, pointerEvents: 'none' }}></div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', position: 'relative' }}>
                            <div>
                                <h2 style={{ fontSize: '2.25rem', fontWeight: '900', marginBottom: '8px' }}>{selectedStudent.name}</h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: '600' }}>Reviewing profile for {vType} clearance</p>
                            </div>
                            <button
                                onClick={() => { setSelectedStudent(null); setRemark(''); }}
                                style={{
                                    width: '40px', height: '40px',
                                    borderRadius: '12px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--glass-border)',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.1rem', fontWeight: '700',
                                    transition: 'all 0.2s',
                                    flexShrink: 0
                                }}
                                onMouseOver={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; }}
                                onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Role Based Fields */}
                        <div style={{ marginBottom: '40px' }}>
                            {vType === 'academic' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                        <div className="glass-dark" style={{ padding: '24px', borderRadius: '20px' }}>
                                            <h4 style={{ color: 'var(--primary)', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '16px' }}>Academic & Personal</h4>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                <p style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Email:</span> <span>{selectedStudent.email}</span></p>
                                                <p style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Attendance:</span> <span>{selectedStudent.attendance}%</span></p>
                                                <p style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>CGPA:</span> <span>{selectedStudent.cgpa}</span></p>
                                                <p style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Semesters Done:</span> <span>{selectedStudent.completedSemesters}</span></p>
                                                <p style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Backlogs:</span> <span>{selectedStudent.backlogs}</span></p>
                                                <p style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Annual Income:</span> <span>₹{selectedStudent.annualIncome?.toLocaleString()}</span></p>
                                                {selectedStudent.hasUnpaidFees && (
                                                    <p style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--error)' }}>Pending Fees:</span> <span style={{ color: 'var(--error)', fontWeight: '700' }}>₹{selectedStudent.unpaidAmount?.toLocaleString()}</span></p>
                                                )}
                                                {!selectedStudent.hasUnpaidFees && (
                                                    <p style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Pending Fees:</span> <span style={{ color: 'var(--success)' }}>None</span></p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="glass-dark" style={{ padding: '24px', borderRadius: '20px' }}>
                                            <h4 style={{ color: 'var(--accent)', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '16px' }}>Activities & Sports</h4>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                <p style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Academic Events:</span> <span>{selectedStudent.academicParticipation ? 'Active' : 'None'}</span></p>
                                                <p style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Sports Interest:</span> <span>{selectedStudent.sportsInterest ? 'Interested' : 'No'}</span></p>
                                                {selectedStudent.sportsInterest && (
                                                    <>
                                                        <p style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Field:</span> <span>{selectedStudent.sportsField}</span></p>
                                                        <p style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Status:</span> <span>{selectedStudent.isTeamMemberOrSubstitute}</span></p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Income Certificate – visible only after full verification */}
                                    <div className="glass-dark" style={{ padding: '20px 24px', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <FileText size={18} color="var(--primary)" />
                                            <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>Income Certificate</span>
                                        </div>
                                        {selectedStudent.incomeCertificate ? (
                                            <a
                                                href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${selectedStudent.incomeCertificate}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: '6px',
                                                    color: 'var(--primary)', fontWeight: '700', fontSize: '0.85rem',
                                                    textDecoration: 'none', padding: '8px 16px', borderRadius: '10px',
                                                    background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)'
                                                }}
                                            >
                                                <ExternalLink size={14} /> View Certificate
                                            </a>
                                        ) : (
                                            <div style={{
                                                display: 'flex', alignItems: 'center', gap: '6px',
                                                color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.8rem',
                                                padding: '8px 16px', borderRadius: '10px',
                                                background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)'
                                            }}>
                                                <FileText size={13} /> Not uploaded yet
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {vType === 'lab' && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                    <div className="glass-dark" style={{ padding: '24px', borderRadius: '20px' }}>
                                        <h4 style={{ color: 'var(--primary)', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '16px' }}>Identity Details</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            <p style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Roll No:</span> <span>{selectedStudent.registerNo}</span></p>
                                            <p style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Department:</span> <span>{selectedStudent.department}</span></p>
                                            <p style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Year:</span> <span>{selectedStudent.year || '1st Year'}</span></p>
                                        </div>
                                    </div>
                                    <div className="glass-dark" style={{ padding: '24px', borderRadius: '20px' }}>
                                        <h4 style={{ color: 'var(--accent)', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '16px' }}>Special Lab Engagement</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            <p style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Active Member:</span> <span>{selectedStudent.specialLabParticipation ? 'Yes' : 'No'}</span></p>
                                            {selectedStudent.specialLabParticipation && (
                                                <p style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Lab Name:</span> <span>{selectedStudent.specialLabName}</span></p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {vType === 'placement' && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                    <div className="glass-dark" style={{ padding: '24px', borderRadius: '20px' }}>
                                        <h4 style={{ color: 'var(--primary)', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '16px' }}>Recruitment Status</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            <p style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Placement Interest:</span> <span>{selectedStudent.isInterestedInNIP ? 'Yes' : 'No'}</span></p>
                                            <p style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Placement %:</span> <span>{selectedStudent.placementPercentage}%</span></p>
                                        </div>
                                    </div>
                                    <div className="glass-dark" style={{ padding: '24px', borderRadius: '20px' }}>
                                        <h4 style={{ color: 'var(--accent)', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '16px' }}>Training & Activities</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            <p style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Attends Regularly:</span> <span>{selectedStudent.placementTraining ? 'Yes' : 'No'}</span></p>
                                            <p style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Training Attendance:</span> <span>{selectedStudent.placementTrainingAttendance}%</span></p>
                                            <p style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Mock Exam Score:</span> <span>{selectedStudent.avgMockScore}</span></p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Rejection Remark Input */}
                        <div style={{ marginBottom: '40px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.05em' }}>Verification Remarks / Rejection Reason</label>
                            <textarea
                                value={remark}
                                onChange={(e) => setRemark(e.target.value)}
                                placeholder="State the reason for rejection or add verification notes here..."
                                style={{
                                    width: '100%',
                                    minHeight: '120px',
                                    background: '#f8fafc',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '16px',
                                    padding: '20px',
                                    color: 'var(--text-main)',
                                    outline: 'none',
                                    fontSize: '0.95rem',
                                    transition: 'all 0.3s'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '16px' }}>
                            <button
                                onClick={() => handleVerify(selectedStudent._id, 'Rejected')}
                                className="glass"
                                style={{
                                    flex: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px',
                                    padding: '16px',
                                    borderRadius: '16px',
                                    color: 'var(--error)',
                                    borderColor: 'rgba(239, 68, 68, 0.2)',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    background: 'rgba(239, 68, 68, 0.05)'
                                }}
                            >
                                <XCircle size={20} /> Reject Report
                            </button>
                            <button
                                onClick={() => handleVerify(selectedStudent._id, 'Verified')}
                                className="btn-primary"
                                style={{
                                    flex: 1.5,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px',
                                    padding: '16px',
                                    borderRadius: '16px',
                                    fontWeight: '700',
                                    background: 'linear-gradient(to right, #10b981, #059669)',
                                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
                                }}
                            >
                                <CheckCircle size={20} /> Approve Clearance
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="glass animate-fade" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px', borderRadius: '32px', border: '1px dashed var(--glass-border)', background: 'rgba(255,255,255,0.01)' }}>
                        <div style={{ width: '100px', height: '100px', borderRadius: '30px', background: 'rgba(99, 102, 241, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px' }}>
                            <Search size={48} color="var(--primary)" style={{ opacity: 0.3 }} />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '12px' }}>Select Student for Audit</h3>
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', maxWidth: '300px' }}>Choose a profile from the sidebar queue to begin deep verification processes.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Verification;
