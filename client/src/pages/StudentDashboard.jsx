import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
    Save,
    Upload,
    CheckCircle,
    Clock,
    AlertCircle,
    FileText,
    User,
    GraduationCap,
    HeartPulse,
    Trophy,
    ChevronRight,
    ChevronLeft,
    TrendingUp,
    Briefcase,
    Activity,
    Landmark,
    ShieldCheck,
    AlertTriangle
} from 'lucide-react';

const StudentDashboard = () => {
    const { user, updateUser } = useAuth();
    const [step, setStep] = useState(1);
    const [studentData, setStudentData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        registerNo: '',
        department: '',
        year: '1st Year',
        attendance: '',
        completedSemesters: '0',
        sem1Marks: '',
        sem2Marks: '',
        sem3Marks: '',
        sem4Marks: '',
        sem5Marks: '',
        sem6: '',
        sem7: '',
        sem8: '',
        cgpa: '',
        backlogs: '',
        annualIncome: '',
        isPWD: false,
        academicParticipation: false,
        sportsInterest: false,
        sportsField: '',
        isTeamMemberOrSubstitute: 'None',
        specialLabParticipation: false,
        specialLabName: '',
        eventParticipation: false,
        eventWinner: false,
        placementTraining: false,
        placementTrainingAttendance: '',
        isInterestedInNIP: false,
        isNotInterestedInPlacement: false,
        placementPercentage: '',
        avgMockScore: '',
        internshipStatus: false,
        isPaidInternship: false,
        stipendAmount: '',
        stressLevel: '3',
        depressionSigns: false,
        incomeCertificate: '',
        academicRemark: '',
        labRemark: '',
        placementRemark: ''
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState(null);
    const [file, setFile] = useState(null);

    useEffect(() => {
        if (!user || !user.email) {
            setLoading(false);
            return;
        }
        const fetchProfile = async () => {
            try {
                const allRes = await axios.get('http://localhost:5000/api/students');
                if (allRes.data && Array.isArray(allRes.data)) {
                    const myProfile = allRes.data.find(s => s.email === user.email);
                    if (myProfile) {
                        setStudentData(prev => ({
                            ...prev,
                            ...myProfile,
                            completedSemesters: myProfile.completedSemesters?.toString() || '0',
                            stressLevel: myProfile.stressLevel?.toString() || '3',
                            year: myProfile.year || '1st Year'
                        }));
                    }
                }
            } catch (err) {
                console.error('Error fetching profile', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [user?.email]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setStudentData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setSaving(true);
        setStatus({ type: 'info', message: 'Syncing profile with high-security database...' });

        try {
            let certificatePath = studentData.incomeCertificate;

            if (file) {
                const formData = new FormData();
                formData.append('certificate', file);
                const uploadRes = await axios.post('http://localhost:5000/api/students/upload-certificate', formData);
                certificatePath = uploadRes.data.filePath;
            }

            const res = await axios.patch('http://localhost:5000/api/students/profile', {
                ...studentData,
                incomeCertificate: certificatePath,
                academicVerification: studentData.academicVerification === 'Rejected' ? 'Pending' : (studentData.academicVerification || 'Pending'),
                labVerification: studentData.specialLabParticipation ? (studentData.labVerification === 'Rejected' ? 'Pending' : (studentData.labVerification || 'Pending')) : 'N/A',
                placementVerification: !studentData.isInterestedInNIP ? 'N/A' : (studentData.placementVerification === 'Rejected' ? 'Pending' : (studentData.placementVerification || 'Pending')),
                isVerified: false
            });

            // update local state with server response
            setStudentData(prev => ({ ...prev, ...res.data }));
            // live-update the sidebar name using returned name (guaranteed fresh)
            if (res.data.name) {
                updateUser({ name: res.data.name });
            } else if (studentData.name) {
                // fallback if server didn't echo name
                updateUser({ name: studentData.name });
            }

            setStatus({ type: 'success', message: 'Profile Consolidated! Your data is now being reviewed by coordinators.' });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            setStatus({ type: 'error', message: err.response?.data?.message || 'Error saving profile' });
        } finally {
            setSaving(false);
        }
    };

    const nextStep = () => setStep(s => Math.min(s + 1, 4));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
            <div className="animate-spin" style={{ width: '50px', height: '50px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', marginBottom: '24px', boxShadow: '0 0 15px var(--primary-glow)' }}></div>
            <p className="text-gradient" style={{ fontWeight: '600', fontSize: '1.2rem' }}>Initializing Premium Workspace...</p>
        </div>
    );

    const inputStyle = {
        background: '#f8fafc',
        border: '1.5px solid var(--glass-border)',
        borderRadius: '12px',
        padding: '14px',
        color: 'var(--text-main)',
        width: '100%',
        marginTop: '8px',
        transition: 'all 0.3s ease'
    };

    console.log('StudentDashboard Render:', { user, studentData, loading });

    const getVerificationColor = (status) => {
        if (!status) return 'var(--text-muted)';
        if (status === 'Verified') return 'var(--success)';
        if (status === 'Rejected') return 'var(--error)';
        return 'var(--text-muted)';
    };

    const riskStatus = studentData?.riskStatus || 'Not Predicted';

    // Lock Logic:
    // If ANY coordinator rejects, you ONLY edit their fields. All other fields are locked.
    // If a coordinator is Verified, their fields are locked.
    const hasAnyRejection = studentData?.academicVerification === 'Rejected' || studentData?.labVerification === 'Rejected' || studentData?.placementVerification === 'Rejected';

    const isAcademicLocked = studentData?.academicVerification === 'Verified' || (hasAnyRejection && studentData?.academicVerification !== 'Rejected');
    const isLabLocked = studentData?.labVerification === 'Verified' || (hasAnyRejection && studentData?.labVerification !== 'Rejected');
    const isPlacementLocked = studentData?.placementVerification === 'Verified' || (hasAnyRejection && studentData?.placementVerification !== 'Rejected');

    // Helper for input styles mapping
    const getLockedStyle = (isLocked, baseStyle = inputStyle) => isLocked ? { ...baseStyle, opacity: 0.6, pointerEvents: 'none', background: 'rgba(15, 23, 42, 0.08)' } : baseStyle;

    return (
        <div className="animate-fade" style={{ maxWidth: '1300px', margin: '0 auto', padding: '10px' }}>
            {/* Elegant Header Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '48px', position: 'relative' }}>
                <div style={{ zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                            <ShieldCheck size={24} color="var(--primary)" />
                        </div>
                        <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--primary)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Secure Workspace</span>
                    </div>
                    <h1 className="text-gradient" style={{ fontSize: '3.5rem', fontWeight: '900', letterSpacing: '-0.04em', lineHeight: '1' }}>
                        Student Central
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', marginTop: '12px', maxWidth: '500px' }}>
                        Welcome {user?.name || 'Student'}. Year: {studentData?.year || '1st Year'}
                    </p>
                </div>

                <div className="glass" style={{ padding: '24px', borderRadius: '24px', textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '240px' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        {/* Always show Academic */}
                        <div title={`Academic: ${studentData?.academicVerification}`} style={{
                            width: '14px',
                            height: '14px',
                            borderRadius: '50%',
                            background: getVerificationColor(studentData?.academicVerification),
                            boxShadow: studentData?.academicVerification && studentData?.academicVerification !== 'Pending' ? `0 0 8px ${getVerificationColor(studentData?.academicVerification)}` : 'none',
                            border: '2px solid rgba(0,0,0,0.2)'
                        }}></div>

                        {/* Lab Dot - Only if participation is true and status is not N/A */}
                        {studentData?.specialLabParticipation && studentData?.labVerification !== 'N/A' && (
                            <div title={`Lab: ${studentData?.labVerification}`} style={{
                                width: '14px',
                                height: '14px',
                                borderRadius: '50%',
                                background: getVerificationColor(studentData?.labVerification),
                                boxShadow: studentData?.labVerification && studentData?.labVerification !== 'Pending' ? `0 0 8px ${getVerificationColor(studentData?.labVerification)}` : 'none',
                                border: '2px solid rgba(0,0,0,0.2)'
                            }}></div>
                        )}

                        {/* Placement Dot - Only if interested and status is not N/A */}
                        {studentData?.isInterestedInNIP && studentData?.placementVerification !== 'N/A' && (
                            <div title={`Placement: ${studentData?.placementVerification}`} style={{
                                width: '14px',
                                height: '14px',
                                borderRadius: '50%',
                                background: getVerificationColor(studentData?.placementVerification),
                                boxShadow: studentData?.placementVerification && studentData?.placementVerification !== 'Pending' ? `0 0 8px ${getVerificationColor(studentData?.placementVerification)}` : 'none',
                                border: '2px solid rgba(0,0,0,0.2)'
                            }}></div>
                        )}
                    </div>
                    <div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Security Status</p>
                        <p style={{
                            fontSize: '1rem',
                            fontWeight: '800',
                            color: studentData.isVerified ? 'var(--success)' : 'var(--warning)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            gap: '6px'
                        }}>
                            {studentData.isVerified ? <CheckCircle size={18} /> : <Clock size={18} />}
                            {studentData.isVerified ? 'FULLY VERIFIED' : 'PENDING REVIEW'}
                        </p>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '40px', alignItems: 'start' }}>

                {/* Main Interaction Area */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

                    {/* Designer Stepper */}
                    <div className="glass" style={{
                        padding: '12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        borderRadius: '24px',
                        background: 'rgba(99, 102, 241, 0.05)',
                        border: '1px solid var(--glass-border)'
                    }}>
                        {[
                            { id: 1, label: 'Identity', icon: <User size={20} /> },
                            { id: 2, label: 'Academic', icon: <GraduationCap size={20} /> },
                            { id: 3, label: 'Career', icon: <Briefcase size={20} /> },
                            { id: 4, label: 'Financial', icon: <Landmark size={20} /> }
                        ].map((s) => (
                            <div
                                key={s.id}
                                onClick={() => setStep(s.id)}
                                style={{
                                    flex: 1,
                                    padding: '16px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '12px',
                                    cursor: 'pointer',
                                    borderRadius: '20px',
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    background: step === s.id ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                                    color: step >= s.id ? 'var(--text-main)' : 'var(--text-muted)'
                                }}
                            >
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '16px',
                                    background: step === s.id ? 'var(--primary)' : step > s.id ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-secondary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: step === s.id ? '#ffffff' : step > s.id ? 'var(--success)' : 'inherit',
                                    boxShadow: step === s.id ? '0 0 20px var(--primary-glow)' : 'none',
                                    border: step === s.id ? 'none' : '1px solid var(--glass-border)'
                                }}>
                                    {step > s.id ? <CheckCircle size={24} /> : s.icon}
                                </div>
                                <span style={{ fontWeight: '700', fontSize: '0.85rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{s.label}</span>
                                {step === s.id && <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--primary)', marginTop: '4px' }}></div>}
                            </div>
                        ))}
                    </div>

                    {/* Content Component with Premium Feel */}
                    <div className="glass" style={{ padding: '54px', borderRadius: '32px', position: 'relative', overflow: 'hidden' }}>
                        {/* Decorative Background Element */}
                        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: 'radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)', opacity: 0.1, pointerEvents: 'none' }}></div>

                        {step === 1 && (
                            <div className="animate-fade">
                                <h3 style={{ fontSize: '2rem', marginBottom: '40px', fontWeight: '800' }}>Identity Verification</h3>
                                <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                                    <div className="input-group">
                                        <label style={{ fontWeight: '600' }}>Full Name</label>
                                        <input type="text" name="name" value={studentData.name || ''} onChange={handleChange} required placeholder="Enter your full name..."
                                            disabled={isAcademicLocked} style={getLockedStyle(isAcademicLocked)} />
                                    </div>
                                    <div className="input-group">
                                        <label style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Personalized Mailbox</label>
                                        <input type="text" value={studentData.email} disabled style={{ ...inputStyle, background: 'rgba(15, 23, 42, 0.06)', opacity: 0.7, cursor: 'not-allowed' }} />
                                    </div>
                                    <div className="input-group">
                                        <label style={{ fontWeight: '600' }}>Institutional Register ID</label>
                                        <input type="text" name="registerNo" value={studentData.registerNo} onChange={handleChange} required placeholder="Enter Unique ID..."
                                            disabled={isAcademicLocked} style={getLockedStyle(isAcademicLocked)} />
                                    </div>
                                    <div className="input-group">
                                        <label style={{ fontWeight: '600' }}>Academic Department</label>
                                        <select name="department" value={studentData.department} onChange={handleChange} required
                                            disabled={isAcademicLocked} style={getLockedStyle(isAcademicLocked)}>
                                            <option value="">Choose your specific stream...</option>
                                            <option value="CSE">Computer Science & Engineering</option>
                                            <option value="IT">Information Technology</option>
                                            <option value="ECE">Electronics & Communication</option>
                                            <option value="EEE">Electrical & Electronics</option>
                                            <option value="MECH">Mechanical Engineering</option>
                                            <option value="CIVIL">Civil Engineering</option>
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label style={{ fontWeight: '600' }}>Current Academic Year</label>
                                        <select name="year" value={studentData.year} onChange={handleChange} required
                                            disabled={isAcademicLocked} style={getLockedStyle(isAcademicLocked)}>
                                            <option value="1st Year">1st Year</option>
                                            <option value="2nd Year">2nd Year</option>
                                            <option value="3rd Year">3rd Year</option>
                                            <option value="4th Year">4th Year</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="animate-fade">
                                <h3 style={{ fontSize: '2rem', marginBottom: '40px', fontWeight: '800' }}>Performance Matrix</h3>

                                {/* 1. Semesters Completed - asked first */}
                                <div style={{ marginBottom: '32px' }}>
                                    <label style={{ fontWeight: '700', fontSize: '1rem', display: 'block', marginBottom: '8px' }}>How many semesters have you completed?</label>
                                    <select name="completedSemesters" value={studentData.completedSemesters} onChange={handleChange}
                                        disabled={isAcademicLocked} style={getLockedStyle(isAcademicLocked)}>
                                        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(n => <option key={n} value={n}>{n} {n === 1 ? 'Semester' : 'Semesters'}</option>)}
                                    </select>
                                </div>

                                {/* 2. Dynamic semester marks */}
                                {parseInt(studentData.completedSemesters) > 0 && (
                                    <div style={{ marginBottom: '32px' }}>
                                        <label style={{ fontWeight: '700', fontSize: '1rem', display: 'block', marginBottom: '16px' }}>Semester Marks (out of 100)</label>
                                        <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                            {Array.from({ length: parseInt(studentData.completedSemesters) }, (_, i) => {
                                                const semNum = i + 1;
                                                const fieldName = semNum <= 5 ? `sem${semNum}Marks` : `sem${semNum}`;
                                                return (
                                                    <div className="input-group" key={semNum}>
                                                        <label style={{ fontWeight: '600', fontSize: '0.9rem' }}>Semester {semNum} Marks</label>
                                                        <input
                                                            type="number"
                                                            name={fieldName}
                                                            value={studentData[fieldName] || ''}
                                                            onChange={handleChange}
                                                            placeholder="e.g. 78"
                                                            min="0" max="100"
                                                            disabled={isAcademicLocked}
                                                            style={getLockedStyle(isAcademicLocked)}
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* 3. Core academic metrics */}
                                <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px' }}>
                                    <div className="input-group">
                                        <label style={{ fontWeight: '600' }}>Attendance (%)</label>
                                        <input type="number" name="attendance" value={studentData.attendance} onChange={handleChange} required placeholder="85" disabled={isAcademicLocked} style={getLockedStyle(isAcademicLocked)} />
                                    </div>
                                    <div className="input-group">
                                        <label style={{ fontWeight: '600' }}>Cumulative GPA</label>
                                        <input type="number" step="0.01" name="cgpa" value={studentData.cgpa} onChange={handleChange} required placeholder="8.50" disabled={isAcademicLocked} style={getLockedStyle(isAcademicLocked)} />
                                    </div>
                                    <div className="input-group">
                                        <label style={{ fontWeight: '600' }}>Current Backlogs</label>
                                        <input type="number" name="backlogs" value={studentData.backlogs} onChange={handleChange} required placeholder="0" disabled={isAcademicLocked} style={getLockedStyle(isAcademicLocked)} />
                                    </div>
                                </div>

                                {/* 4. Extra activities */}
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '24px' }}>
                                    <label className="glass" style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: isAcademicLocked ? 'not-allowed' : 'pointer', padding: '16px 24px', borderRadius: '16px', flex: '1', border: studentData.academicParticipation ? '1px solid var(--primary)' : '1px solid var(--glass-border)', opacity: isAcademicLocked ? 0.6 : 1, pointerEvents: isAcademicLocked ? 'none' : 'auto' }}>
                                        <input type="checkbox" name="academicParticipation" checked={studentData.academicParticipation} onChange={handleChange} disabled={isAcademicLocked} style={{ width: '20px', height: '20px' }} />
                                        <span style={{ fontWeight: '600' }}>Symposium Participation</span>
                                    </label>
                                    <label className="glass" style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: isLabLocked ? 'not-allowed' : 'pointer', padding: '16px 24px', borderRadius: '16px', flex: '1', border: studentData.specialLabParticipation ? '1px solid var(--primary)' : '1px solid var(--glass-border)', opacity: isLabLocked ? 0.6 : 1, pointerEvents: isLabLocked ? 'none' : 'auto' }}>
                                        <input type="checkbox" name="specialLabParticipation" checked={studentData.specialLabParticipation} onChange={handleChange} disabled={isLabLocked} style={{ width: '20px', height: '20px' }} />
                                        <span style={{ fontWeight: '600' }}>In Special Lab?</span>
                                    </label>
                                </div>

                                {/* 5. Special lab name - shown only if in special lab */}
                                {studentData.specialLabParticipation && (
                                    <div className="animate-fade" style={{ marginTop: '8px' }}>
                                        <label style={{ fontWeight: '600', display: 'block', marginBottom: '8px' }}>Special Lab Name</label>
                                        <input
                                            type="text"
                                            name="specialLabName"
                                            value={studentData.specialLabName || ''}
                                            onChange={handleChange}
                                            placeholder="e.g. AI Research Lab, Robotics Lab..."
                                            required
                                            disabled={isLabLocked}
                                            style={getLockedStyle(isLabLocked)}
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {step === 3 && (
                            <div className="animate-fade">
                                <h3 style={{ fontSize: '2rem', marginBottom: '40px', fontWeight: '800' }}>Career Aspiration</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '40px' }}>

                                    {/* Placement Goal Card */}
                                    <div className="glass" style={{ background: 'rgba(99, 102, 241, 0.05)', padding: '32px', borderRadius: '24px' }}>
                                        <h4 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <Briefcase size={22} color="var(--primary)" /> Placement Goal
                                        </h4>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', cursor: isPlacementLocked ? 'not-allowed' : 'pointer', opacity: isPlacementLocked ? 0.6 : 1, pointerEvents: isPlacementLocked ? 'none' : 'auto' }}>
                                            <input type="checkbox" name="isInterestedInNIP" checked={studentData.isInterestedInNIP} onChange={handleChange} disabled={isPlacementLocked} style={{ width: '18px', height: '18px' }} />
                                            <span style={{ fontSize: '0.95rem', fontWeight: '600' }}>Interested in Campus Recruitment</span>
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: isPlacementLocked ? 'not-allowed' : 'pointer', opacity: isPlacementLocked ? 0.6 : 1, pointerEvents: isPlacementLocked ? 'none' : 'auto' }}>
                                            <input type="checkbox" name="placementTraining" checked={studentData.placementTraining} onChange={handleChange} disabled={isPlacementLocked} style={{ width: '18px', height: '18px' }} />
                                            <span style={{ fontSize: '0.95rem', fontWeight: '500' }}>Active Training Participation</span>
                                        </label>

                                        {/* Conditional placement stats */}
                                        {studentData.isInterestedInNIP && (
                                            <div className="animate-fade" style={{ marginTop: '28px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                                                <div>
                                                    <label style={{ fontWeight: '600', fontSize: '0.9rem', display: 'block', marginBottom: '6px' }}>Placement Attendance (%)</label>
                                                    <input
                                                        type="number"
                                                        name="placementPercentage"
                                                        value={studentData.placementPercentage || ''}
                                                        onChange={handleChange}
                                                        placeholder="e.g. 80"
                                                        min="0" max="100"
                                                        disabled={isPlacementLocked}
                                                        style={getLockedStyle(isPlacementLocked)}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ fontWeight: '600', fontSize: '0.9rem', display: 'block', marginBottom: '6px' }}>Mock Test Score</label>
                                                    <input
                                                        type="number"
                                                        name="avgMockScore"
                                                        value={studentData.avgMockScore || ''}
                                                        onChange={handleChange}
                                                        placeholder="e.g. 75"
                                                        min="0" max="100"
                                                        disabled={isPlacementLocked}
                                                        style={getLockedStyle(isPlacementLocked)}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ fontWeight: '600', fontSize: '0.9rem', display: 'block', marginBottom: '6px' }}>Training Attendance (%)</label>
                                                    <input
                                                        type="number"
                                                        name="placementTrainingAttendance"
                                                        value={studentData.placementTrainingAttendance || ''}
                                                        onChange={handleChange}
                                                        placeholder="e.g. 70"
                                                        min="0" max="100"
                                                        disabled={isPlacementLocked}
                                                        style={getLockedStyle(isPlacementLocked)}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Engagement Card */}
                                    <div className="glass" style={{ background: 'rgba(192, 132, 252, 0.05)', padding: '32px', borderRadius: '24px' }}>
                                        <h4 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <Activity size={22} color="var(--accent)" /> Engagement
                                        </h4>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', cursor: isAcademicLocked ? 'not-allowed' : 'pointer', opacity: isAcademicLocked ? 0.6 : 1, pointerEvents: isAcademicLocked ? 'none' : 'auto' }}>
                                            <input type="checkbox" name="sportsInterest" checked={studentData.sportsInterest} onChange={handleChange} disabled={isAcademicLocked} style={{ width: '18px', height: '18px' }} />
                                            <span style={{ fontSize: '0.95rem', fontWeight: '500' }}>Varsity Sports Team</span>
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: isAcademicLocked ? 'not-allowed' : 'pointer', opacity: isAcademicLocked ? 0.6 : 1, pointerEvents: isAcademicLocked ? 'none' : 'auto' }}>
                                            <input type="checkbox" name="eventWinner" checked={studentData.eventWinner} onChange={handleChange} disabled={isAcademicLocked} style={{ width: '18px', height: '18px' }} />
                                            <span style={{ fontSize: '0.95rem', fontWeight: '500' }}>Award Winning Excellence</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '20px', display: 'block' }}>Stress Management Index</label>
                                    <div className="glass" style={{ padding: '24px', borderRadius: '20px' }}>
                                        <input type="range" name="stressLevel" min="1" max="5" value={studentData.stressLevel} onChange={handleChange} disabled={isAcademicLocked} style={{
                                            width: '100%',
                                            height: '6px',
                                            borderRadius: '5px',
                                            accentColor: 'var(--primary)',
                                            cursor: isAcademicLocked ? 'not-allowed' : 'pointer',
                                            opacity: isAcademicLocked ? 0.6 : 1,
                                            pointerEvents: isAcademicLocked ? 'none' : 'auto'
                                        }} />
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '20px', fontWeight: '600' }}>
                                            <span style={{ color: 'var(--success)' }}>Optimal Balance</span>
                                            <span style={{ color: 'var(--warning)' }}>Moderate Pressure</span>
                                            <span style={{ color: 'var(--error)' }}>High Resilience Required</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}


                        {step === 4 && (
                            <div className="animate-fade">
                                <h3 style={{ fontSize: '2rem', marginBottom: '40px', fontWeight: '800' }}>Socio-Financial Profile</h3>
                                <div className="input-group" style={{ marginBottom: '24px' }}>
                                    <label style={{ fontWeight: '600' }}>Gross Annual Family Income (₹)</label>
                                    <input type="number" name="annualIncome" value={studentData.annualIncome} onChange={handleChange} placeholder="5,00,000" disabled={isAcademicLocked} style={getLockedStyle(isAcademicLocked)} />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '40px', alignItems: 'center' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: isAcademicLocked ? 'not-allowed' : 'pointer', opacity: isAcademicLocked ? 0.6 : 1, pointerEvents: isAcademicLocked ? 'none' : 'auto' }}>
                                        <input type="checkbox" name="hasUnpaidFees" checked={studentData.hasUnpaidFees} onChange={handleChange} disabled={isAcademicLocked} style={{ width: '18px', height: '18px' }} />
                                        <span style={{ fontSize: '1rem', fontWeight: '600' }}>Institutional Fee Pendency?</span>
                                    </label>

                                    {studentData.hasUnpaidFees && (
                                        <div className="input-group animate-collapse" style={{ marginBottom: 0 }}>
                                            <label style={{ fontWeight: '600' }}>Total Outstanding Due Amount (₹)</label>
                                            <input
                                                type="number"
                                                name="unpaidAmount"
                                                value={studentData.unpaidAmount || ''}
                                                onChange={handleChange}
                                                placeholder="e.g. 50000"
                                                disabled={isAcademicLocked}
                                                style={getLockedStyle(isAcademicLocked)}
                                                required
                                            />
                                        </div>
                                    )}
                                </div>

                                <div style={{
                                    background: 'rgba(99, 102, 241, 0.03)',
                                    border: '2px dashed rgba(99, 102, 241, 0.3)',
                                    borderRadius: '28px',
                                    padding: '60px 40px',
                                    textAlign: 'center',
                                    transition: 'all 0.3s ease',
                                    cursor: file ? 'default' : 'pointer'
                                }} onMouseOver={(e) => !file && (e.currentTarget.style.background = 'rgba(99, 102, 241, 0.06)')} onMouseOut={(e) => !file && (e.currentTarget.style.background = 'rgba(99, 102, 241, 0.03)')}>
                                    <div style={{
                                        width: '80px',
                                        height: '80px',
                                        borderRadius: '24px',
                                        background: 'rgba(99, 102, 241, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 24px'
                                    }}>
                                        <Upload size={32} color="var(--primary)" />
                                    </div>
                                    <h4 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>{file ? 'File Selected' : 'Authenticate Financial Info'}</h4>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '32px' }}>Upload legal income certificate for institutional assistance.<br />(PDF / JPEG / PNG • Max 10MB)</p>

                                    <input type="file" onChange={handleFileChange} id="certificate-upload" disabled={isAcademicLocked} style={{ display: 'none' }} />
                                    <label htmlFor="certificate-upload" className="btn-primary" style={{ display: 'inline-flex', padding: '14px 40px', width: 'auto', cursor: isAcademicLocked ? 'not-allowed' : 'pointer', opacity: isAcademicLocked ? 0.6 : 1, pointerEvents: isAcademicLocked ? 'none' : 'auto' }}>
                                        {file ? 'Change selected file' : 'Select Certificate'}
                                    </label>

                                    {file && (
                                        <div className="animate-fade" style={{ marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--success)', fontWeight: '600' }}>
                                            <CheckCircle size={18} /> {file.name}
                                        </div>
                                    )}

                                    {studentData.incomeCertificate && !file && (
                                        <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: 'rgba(16, 185, 129, 0.1)', padding: '10px 20px', borderRadius: '12px', color: 'var(--success)' }}>
                                            <FileText size={18} />
                                            <span style={{ fontWeight: '600' }}>{studentData.incomeCertificate.split('/').pop()} Already Uploaded</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div style={{ marginTop: '60px', paddingTop: '40px', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <button
                                onClick={prevStep}
                                className="nav-link"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    opacity: step === 1 ? 0 : 1,
                                    pointerEvents: step === 1 ? 'none' : 'auto',
                                    padding: '12px 24px',
                                    borderRadius: '14px',
                                    background: 'var(--bg-secondary)',
                                    marginBottom: 0
                                }}
                            >
                                <ChevronLeft size={20} /> Identity Step
                            </button>

                            <div style={{ display: 'flex', gap: '16px' }}>
                                {step < 4 ? (
                                    <button onClick={nextStep} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '16px 40px', borderRadius: '16px', width: 'auto' }}>
                                        Next Matrix <ChevronRight size={20} />
                                    </button>
                                ) : (
                                    <button onClick={handleSubmit} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '16px 60px', borderRadius: '16px', width: 'auto', background: studentData.isVerified ? 'rgba(16, 185, 129, 0.2)' : 'linear-gradient(to right, var(--primary), var(--accent))', color: studentData.isVerified ? 'var(--success)' : '#ffffff', cursor: studentData.isVerified ? 'not-allowed' : 'pointer' }} disabled={saving || studentData.isVerified}>
                                        {saving ? 'Syncing...' : studentData.isVerified ? <><CheckCircle size={20} /> Identity Verified</> : <><Save size={20} /> Consolidate Profile</>}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tracking & Insights Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

                    {/* AI Prediction Hub */}
                    <div className="glass" style={{
                        padding: '32px',
                        borderRadius: '32px',
                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(192, 132, 252, 0) 100%)',
                        border: '1px solid rgba(99, 102, 241, 0.15)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.1)' }}>
                                <TrendingUp size={22} color="var(--primary)" />
                            </div>
                            <h4 style={{ fontSize: '1.2rem', fontWeight: '800' }}>AI Forecast Hub</h4>
                        </div>

                        <div style={{ textAlign: 'center', padding: '32px 0' }}>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '12px', fontWeight: '800', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Current Risk Index</p>
                            <h2 style={{
                                fontSize: '3rem',
                                fontWeight: '950',
                                color: riskStatus === 'High Risk' ? 'var(--error)' : riskStatus === 'Low Risk' ? 'var(--success)' : 'var(--text-muted)',
                                textShadow: riskStatus !== 'Not Predicted' ? `0 0 20px ${riskStatus === 'High Risk' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)'}` : 'none'
                            }}>
                                {riskStatus === 'Not Predicted' ? 'ANALYZING...' : riskStatus.toUpperCase()}
                            </h2>
                        </div>

                        <div className="glass-dark" style={{ padding: '20px', borderRadius: '20px', marginTop: '10px' }}>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6', textAlign: 'center' }}>
                                {riskStatus === 'Not Predicted'
                                    ? "Consolidate your academic matrix and career aspirations to trigger deep-learning dropout analysis."
                                    : "Prediction synthesized using behavioral patterns, financial socio-factors, and real-time academic integrity."}
                            </p>
                        </div>
                    </div>

                    {/* Verifier Chain Progress */}
                    <div className="glass" style={{ padding: '32px', borderRadius: '32px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
                            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(16, 102, 241, 0.1)' }}>
                                <HeartPulse size={22} color="var(--info)" />
                            </div>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Institutional Review</h4>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {[
                                { label: 'Academic Approval', status: studentData?.academicVerification || 'Pending', remark: studentData?.academicRemark, icon: <GraduationCap size={18} /> },
                                ...(studentData?.specialLabParticipation && studentData?.labVerification !== 'N/A' ? [{ label: 'Special Lab Approval', status: studentData?.labVerification || 'Pending', remark: studentData?.labRemark, icon: <Activity size={18} /> }] : []),
                                ...(studentData?.isInterestedInNIP && studentData?.placementVerification !== 'N/A' ? [{ label: 'Placement Team Approval', status: studentData?.placementVerification || 'Pending', remark: studentData?.placementRemark, icon: <Briefcase size={18} /> }] : [])
                            ].map((v, i) => (
                                <div key={i} className="glass-dark" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px 20px', borderRadius: '18px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ color: 'var(--text-muted)' }}>{v.icon}</div>
                                            <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>{v.label}</span>
                                        </div>
                                        <div style={{
                                            padding: '6px 14px',
                                            borderRadius: '12px',
                                            fontSize: '0.75rem',
                                            fontWeight: '800',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            background: v.status === 'Verified' ? 'rgba(16, 185, 129, 0.1)' : v.status === 'Rejected' ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-secondary)',
                                            color: getVerificationColor(v.status),
                                            border: `1px solid ${getVerificationColor(v.status)}33`
                                        }}>
                                            {v.status}
                                        </div>
                                    </div>
                                    {v.status === 'Rejected' && v.remark && (
                                        <div style={{
                                            padding: '10px 14px',
                                            borderRadius: '10px',
                                            background: 'rgba(239, 68, 68, 0.05)',
                                            border: '1px solid rgba(239, 68, 68, 0.1)',
                                            fontSize: '0.75rem',
                                            color: '#f87171',
                                            fontWeight: '600'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', textTransform: 'uppercase', fontSize: '0.65rem', opacity: 0.7 }}>
                                                <AlertCircle size={10} /> Coordinator Remark
                                            </div>
                                            {v.remark}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {status && (
                        <div className="glass animate-fade" style={{
                            padding: '24px',
                            borderRadius: '24px',
                            fontSize: '0.95rem',
                            fontWeight: '600',
                            textAlign: 'center',
                            background: status.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : status.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                            color: status.type === 'success' ? 'var(--success)' : status.type === 'error' ? 'var(--error)' : 'var(--primary)',
                            border: '1px solid currentColor',
                            boxShadow: `0 0 20px ${status.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'transparent'}`
                        }}>
                            {status.message}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
