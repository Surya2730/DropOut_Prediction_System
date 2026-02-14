import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { User, GraduationCap, Mail, Save, Clock, ClipboardList, CheckCircle } from 'lucide-react';

const AddStudent = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        registerNo: '',
        department: '',
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
        isAboveAverage: false,
        avgClassMark: '',
        backlogs: '',
        annualIncome: '',
        isPWD: false,
        academicParticipation: false,
        sportsInterest: false,
        sportsField: '',
        isTeamMemberOrSubstitute: 'None',
        hasTalents: false,
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
        stressLevel: '1',
        depressionSigns: false
    });
    const [message, setMessage] = useState('');
    const [type, setType] = useState('success');

    useEffect(() => {
        if (isEditMode) {
            fetchStudent();
        }
    }, [id]);

    const fetchStudent = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/students/${id}`);
            const data = res.data;
            setFormData({
                ...data,
                completedSemesters: data.completedSemesters?.toString() || '0',
                stressLevel: data.stressLevel?.toString() || '1'
            });
        } catch (err) {
            setMessage('Error fetching student details');
            setType('error');
        }
    };

    const onChange = (e) => {
        const { name, value, type: inputType, checked } = e.target;

        // Handle mutual exclusivity for placement interest
        if (name === 'isInterestedInNIP' && checked) {
            setFormData(prev => ({ ...prev, isInterestedInNIP: true, isNotInterestedInPlacement: false }));
        } else if (name === 'isNotInterestedInPlacement' && checked) {
            setFormData(prev => ({ ...prev, isNotInterestedInPlacement: true, isInterestedInNIP: false }));
        } else {
            setFormData({
                ...formData,
                [name]: inputType === 'checkbox' ? checked : value
            });
        }
    };

    const calculateCGPA = (e) => {
        e.preventDefault();
        const numSems = parseInt(formData.completedSemesters);
        if (numSems === 0) {
            setMessage('Please enter number of completed semesters first');
            setType('error');
            return;
        }

        let totalMarks = 0;
        let count = 0;

        for (let i = 1; i <= numSems; i++) {
            const fieldName = i <= 5 ? `sem${i}Marks` : `sem${i}`;
            const val = parseFloat(formData[fieldName]);
            if (!isNaN(val)) {
                totalMarks += val;
                count++;
            }
        }

        if (count > 0) {
            const avg = totalMarks / count;
            const calculatedCGPA = (avg / 10).toFixed(2);
            setFormData(prev => ({ ...prev, cgpa: calculatedCGPA }));
            setMessage(`Calculated CGPA: ${calculatedCGPA} based on ${count} semesters.`);
            setType('success');
        } else {
            setMessage('Please enter marks for the completed semesters to calculate');
            setType('error');
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            const studentData = {
                ...formData,
                attendance: Number(formData.attendance),
                completedSemesters: Number(formData.completedSemesters),
                sem1Marks: Number(formData.sem1Marks),
                sem2Marks: Number(formData.sem2Marks),
                sem3Marks: Number(formData.sem3Marks),
                sem4Marks: Number(formData.sem4Marks),
                sem5Marks: Number(formData.sem5Marks),
                sem6: Number(formData.sem6),
                sem7: Number(formData.sem7),
                sem8: Number(formData.sem8),
                cgpa: Number(formData.cgpa),
                avgClassMark: Number(formData.avgClassMark),
                backlogs: Number(formData.backlogs),
                annualIncome: Number(formData.annualIncome),
                placementTrainingAttendance: Number(formData.placementTrainingAttendance),
                placementPercentage: Number(formData.placementPercentage),
                avgMockScore: Number(formData.avgMockScore),
                stipendAmount: Number(formData.stipendAmount),
                stressLevel: Number(formData.stressLevel)
            };

            if (isEditMode) {
                await axios.put(`http://localhost:5000/api/students/${id}`, studentData);
                setMessage('Student Record Updated Successfully!');
            } else {
                await axios.post('http://localhost:5000/api/students', studentData);
                setMessage('Student Record Saved Successfully!');
            }
            setType('success');

            if (isEditMode) {
                setTimeout(() => navigate('/student-details'), 2000);
            } else {
                // Reset form
                setFormData({
                    name: '', email: '', registerNo: '', department: '', attendance: '',
                    completedSemesters: '0',
                    sem1Marks: '', sem2Marks: '', sem3Marks: '', sem4Marks: '', sem5Marks: '',
                    sem6: '', sem7: '', sem8: '', cgpa: '', isAboveAverage: false, avgClassMark: '', backlogs: '',
                    annualIncome: '', isPWD: false, academicParticipation: false,
                    sportsInterest: false, sportsField: '', isTeamMemberOrSubstitute: 'None', hasTalents: false,
                    specialLabParticipation: false, specialLabName: '', eventParticipation: false, eventWinner: false,
                    placementTraining: false, placementTrainingAttendance: '',
                    isInterestedInNIP: false, isNotInterestedInPlacement: false,
                    placementPercentage: '', avgMockScore: '',
                    internshipStatus: false, isPaidInternship: false, stipendAmount: '',
                    stressLevel: '1', depressionSigns: false
                });
            }
        } catch (err) {
            setMessage(err.response?.data?.message || 'Error processing student record');
            setType('error');
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '12px',
        borderRadius: '8px',
        background: '#1e293b',
        color: 'white',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        marginTop: '8px'
    };

    const checkboxGroupStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px',
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.05)'
    };

    const selectStyle = {
        ...inputStyle,
        background: '#1e293b',
        color: 'white',
        cursor: 'pointer'
    };

    const completedSems = parseInt(formData.completedSemesters) || 0;

    return (
        <div style={{ paddingBottom: '60px', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '12px', fontWeight: '800', background: 'linear-gradient(to right, #60a5fa, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {isEditMode ? 'Update Student Details' : 'Student details'}
                </h1>
            </div>

            {message && (
                <div className="glass animate-fade" style={{
                    padding: '16px',
                    marginBottom: '32px',
                    borderRadius: '12px',
                    textAlign: 'center',
                    background: type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: type === 'success' ? '#4ade80' : '#f87171',
                    border: `1px solid ${type === 'success' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                }}>
                    {message}
                </div>
            )}

            <form onSubmit={onSubmit} className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                {/* 1. Primary Identification */}
                <div className="card glass">
                    <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.25rem' }}>
                        <User size={22} color="var(--primary)" />
                        Student Identity
                    </h3>
                    <div className="form-grid">
                        <div className="input-group">
                            <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Full Name</label>
                            <input type="text" name="name" value={formData.name} onChange={onChange} required placeholder="Student Name" style={inputStyle} />
                        </div>
                        <div className="input-group">
                            <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Official Email</label>
                            <input type="email" name="email" value={formData.email} onChange={onChange} required placeholder="email@college.edu" style={inputStyle} />
                        </div>
                        <div className="input-group">
                            <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Registration Number</label>
                            <input type="text" name="registerNo" value={formData.registerNo} onChange={onChange} required placeholder="REG123456" style={inputStyle} />
                        </div>
                        <div className="input-group">
                            <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Department</label>
                            <input type="text" name="department" value={formData.department} onChange={onChange} required placeholder="e.g. CSE, ECE" style={inputStyle} />
                        </div>
                    </div>
                </div>

                {/* 2. Professional Pathways (Moved Higher) */}
                <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                    <div className="card glass" style={{ borderColor: 'rgba(96, 165, 250, 0.3)' }}>
                        <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <CheckCircle size={20} color="#60a5fa" />
                            Placement Interest & Status
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                {!formData.isNotInterestedInPlacement && (
                                    <div style={checkboxGroupStyle} className="animate-fade">
                                        <input type="checkbox" name="isInterestedInNIP" id="isInterested" checked={formData.isInterestedInNIP} onChange={onChange} />
                                        <label htmlFor="isInterested" style={{ fontSize: '0.85rem' }}>Interested in placement</label>
                                    </div>
                                )}
                                {!formData.isInterestedInNIP && (
                                    <div style={checkboxGroupStyle} className="animate-fade">
                                        <input type="checkbox" name="isNotInterestedInPlacement" id="isNotInterested" checked={formData.isNotInterestedInPlacement} onChange={onChange} />
                                        <label htmlFor="isNotInterested" style={{ fontSize: '0.85rem' }}>Not interested in placement</label>
                                    </div>
                                )}
                            </div>

                            {!formData.isNotInterestedInPlacement && (
                                <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {formData.isInterestedInNIP && (
                                        <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            <div className="input-group">
                                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Placement Percentage (%)</label>
                                                <input type="number" name="placementPercentage" value={formData.placementPercentage} onChange={onChange} placeholder="0-100" style={inputStyle} />
                                            </div>
                                            <div className="input-group">
                                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Avg Mock Score</label>
                                                <input type="number" name="avgMockScore" value={formData.avgMockScore} onChange={onChange} placeholder="Score" style={inputStyle} />
                                            </div>
                                        </div>
                                    )}

                                    <div style={checkboxGroupStyle}>
                                        <input type="checkbox" name="placementTraining" id="placementTraining" checked={formData.placementTraining} onChange={onChange} />
                                        <label htmlFor="placementTraining" style={{ fontSize: '0.85rem' }}>Attends Placement Training?</label>
                                    </div>

                                    <input
                                        type="number"
                                        name="placementTrainingAttendance"
                                        value={formData.placementTrainingAttendance}
                                        onChange={onChange}
                                        placeholder="Training Attendance (%)"
                                        style={inputStyle}
                                        disabled={!formData.placementTraining}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="card glass">
                        <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <ClipboardList size={20} color="var(--primary)" />
                            Internships
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={checkboxGroupStyle}>
                                <input type="checkbox" name="internshipStatus" checked={formData.internshipStatus} onChange={onChange} />
                                <label style={{ fontSize: '0.85rem' }}>Engaged in Internship?</label>
                            </div>
                            <div style={checkboxGroupStyle}>
                                <input type="checkbox" name="isPaidInternship" checked={formData.isPaidInternship} onChange={onChange} disabled={!formData.internshipStatus} />
                                <label style={{ fontSize: '0.85rem' }}>Is Paid with Stipend?</label>
                            </div>
                            <input
                                type="number"
                                name="stipendAmount"
                                value={formData.stipendAmount}
                                onChange={onChange}
                                placeholder="Monthly Stipend (₹)"
                                style={inputStyle}
                                disabled={!formData.isPaidInternship}
                            />
                        </div>
                    </div>
                </div>

                {/* 3. Academic Performance Dashboard */}
                <div className="card glass">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.25rem' }}>
                            <GraduationCap size={22} color="var(--primary)" />
                            Academic Performance
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Semesters Completed:</label>
                            <select
                                name="completedSemesters"
                                value={formData.completedSemesters}
                                onChange={onChange}
                                style={{ ...selectStyle, width: '90px', marginTop: 0, padding: '8px' }}
                            >
                                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                                    <option key={n} value={n} style={{ background: '#1e293b', color: 'white' }}>{n}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {completedSems > 0 && (
                        <div className="animate-fade" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                            {Array.from({ length: completedSems }, (_, i) => i + 1).map(sem => (
                                <div className="input-group" key={sem}>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sem {sem} (%)</label>
                                    <input
                                        type="number"
                                        name={sem <= 5 ? `sem${sem}Marks` : `sem${sem}`}
                                        value={sem <= 5 ? formData[`sem${sem}Marks`] : formData[`sem${sem}`]}
                                        onChange={onChange}
                                        placeholder="0-100"
                                        style={inputStyle}
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="form-grid">
                        <div className="input-group">
                            <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Current CGPA (10 pt Scale)</label>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                                <input type="number" step="0.01" name="cgpa" value={formData.cgpa} onChange={onChange} required placeholder="8.50" style={{ ...inputStyle, flex: 1 }} />
                                <button
                                    onClick={calculateCGPA}
                                    className="btn-secondary"
                                    style={{
                                        marginTop: '8px',
                                        padding: '12px 16px',
                                        borderRadius: '8px',
                                        background: 'rgba(96, 165, 250, 0.1)',
                                        color: '#60a5fa',
                                        border: '1px solid rgba(96, 165, 250, 0.2)',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    Generate CGPA
                                </button>
                            </div>
                        </div>
                        <div className="input-group">
                            <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Active Backlogs</label>
                            <input type="number" name="backlogs" value={formData.backlogs} onChange={onChange} required placeholder="0" style={inputStyle} />
                        </div>
                        <div className="input-group">
                            <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Attendance (%)</label>
                            <input type="number" name="attendance" value={formData.attendance} onChange={onChange} required placeholder="85" style={inputStyle} />
                        </div>
                        <div className="input-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={checkboxGroupStyle}>
                                <input type="checkbox" name="isAboveAverage" id="isAboveAverage" checked={formData.isAboveAverage} onChange={onChange} style={{ width: '18px', height: '18px' }} />
                                <label htmlFor="isAboveAverage" style={{ fontSize: '0.9rem', margin: 0 }}>Above Average Performer?</label>
                            </div>
                            {formData.isAboveAverage && (
                                <input
                                    type="number"
                                    name="avgClassMark"
                                    value={formData.avgClassMark}
                                    onChange={onChange}
                                    placeholder="Average Class Mark"
                                    style={inputStyle}
                                    className="animate-fade"
                                />
                            )}
                        </div>
                    </div>
                </div>

                <div className="form-grid" style={{ gridTemplateColumns: '1.2fr 0.8fr' }}>
                    {/* 4. Financial & Engagement */}
                    <div className="card glass">
                        <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Mail size={20} color="var(--primary)" />
                            Profile Factors
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div className="input-group">
                                <label style={{ fontSize: '0.85rem' }}>Annual Income (₹)</label>
                                <input type="number" name="annualIncome" value={formData.annualIncome} onChange={onChange} placeholder="500000" style={inputStyle} />
                            </div>
                            <div style={checkboxGroupStyle}>
                                <input type="checkbox" name="isPWD" checked={formData.isPWD} onChange={onChange} />
                                <label style={{ fontSize: '0.85rem' }}>PWD / Differently Abled?</label>
                            </div>
                            <div style={checkboxGroupStyle}>
                                <input type="checkbox" name="academicParticipation" checked={formData.academicParticipation} onChange={onChange} />
                                <label style={{ fontSize: '0.85rem' }}>Active Academic Participation?</label>
                            </div>
                        </div>
                    </div>

                    {/* 5. Technical / Special Labs */}
                    <div className="card glass">
                        <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Save size={20} color="var(--primary)" />
                            Special Research Labs
                        </h3>
                        <div style={checkboxGroupStyle}>
                            <input type="checkbox" name="specialLabParticipation" checked={formData.specialLabParticipation} onChange={onChange} />
                            <label style={{ fontSize: '0.85rem' }}>Member of Special Lab?</label>
                        </div>
                        <div className="input-group" style={{ marginTop: '16px' }}>
                            <label style={{ fontSize: '0.85rem' }}>Lab Name (AI, Blockchain, etc.)</label>
                            <input
                                type="text"
                                name="specialLabName"
                                value={formData.specialLabName}
                                onChange={onChange}
                                placeholder="Enter Lab Name"
                                style={{
                                    ...inputStyle,
                                    opacity: formData.specialLabParticipation ? 1 : 0.5,
                                    pointerEvents: formData.specialLabParticipation ? 'auto' : 'none'
                                }}
                                disabled={!formData.specialLabParticipation}
                            />
                        </div>
                    </div>
                </div>

                {/* 6. Extracurricular Detailed */}
                <div className="card glass">
                    <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.25rem' }}>
                        <Clock size={22} color="var(--primary)" />
                        Extracurriculars & Achievements
                    </h3>
                    <div className="form-grid">
                        <div className="input-group">
                            <label style={{ fontSize: '0.9rem' }}>Primary Sports Field</label>
                            <input type="text" name="sportsField" value={formData.sportsField} onChange={onChange} placeholder="Cricket, Football, etc." style={inputStyle} />
                        </div>
                        <div className="input-group">
                            <label style={{ fontSize: '0.9rem' }}>College Team Status</label>
                            <select
                                name="isTeamMemberOrSubstitute"
                                value={formData.isTeamMemberOrSubstitute}
                                onChange={onChange}
                                style={{ ...selectStyle }}
                            >
                                <option value="None" style={{ background: '#1e293b' }}>None</option>
                                <option value="Team Member" style={{ background: '#1e293b' }}>Official Team Member</option>
                                <option value="Substitute" style={{ background: '#1e293b' }}>Substitute Player</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center' }}>
                            <div style={checkboxGroupStyle}>
                                <input type="checkbox" name="eventParticipation" checked={formData.eventParticipation} onChange={onChange} />
                                <label style={{ fontSize: '0.85rem' }}>Participated in Hackathons?</label>
                            </div>
                            <div style={checkboxGroupStyle}>
                                <input type="checkbox" name="eventWinner" checked={formData.eventWinner} onChange={onChange} />
                                <label style={{ fontSize: '0.85rem' }}>Won State/National Events?</label>
                            </div>
                        </div>
                        <div style={checkboxGroupStyle}>
                            <input type="checkbox" name="hasTalents" checked={formData.hasTalents} onChange={onChange} />
                            <label style={{ fontSize: '0.85rem' }}>Other Talents (Art/Music)?</label>
                        </div>
                    </div>
                </div>

                {/* 7. Clinical Observations */}
                <div className="card glass" style={{ borderColor: 'rgba(248, 113, 113, 0.2)' }}>
                    <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', color: '#f87171' }}>
                        <User size={22} color="#f87171" />
                        Psychological & Mental Health Observation
                    </h3>
                    <div className="form-grid">
                        <div className="input-group">
                            <label style={{ fontSize: '0.9rem' }}>Observed Stress Level (Scale 1-5)</label>
                            <select name="stressLevel" value={formData.stressLevel} onChange={onChange} style={{ ...selectStyle }}>
                                <option value="1" style={{ background: '#1e293b' }}>1 – Very Low (Calm)</option>
                                <option value="2" style={{ background: '#1e293b' }}>2 – Low (Occasional)</option>
                                <option value="3" style={{ background: '#1e293b' }}>3 – Moderate (Normal)</option>
                                <option value="4" style={{ background: '#1e293b' }}>4 – High (Frequent)</option>
                                <option value="5" style={{ background: '#1e293b' }}>5 – Very High (Critical)</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{ ...checkboxGroupStyle, width: '100%', borderColor: 'rgba(248, 113, 113, 0.2)' }}>
                                <input type="checkbox" name="depressionSigns" checked={formData.depressionSigns} onChange={onChange} style={{ cursor: 'pointer' }} />
                                <label style={{ fontSize: '0.9rem', color: '#f87171' }}>Severe signs of Stress/Depression observed?</label>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '32px' }}>
                    <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '18px 60px', borderRadius: '14px', fontSize: '1.1rem', fontWeight: '700', boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.5)', display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
                        <Save size={24} />
                        {isEditMode ? 'Update Consolidated Record' : 'Consolidate Student Data'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddStudent;
