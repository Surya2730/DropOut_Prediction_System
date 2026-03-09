import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { User, GraduationCap, Mail, Save, Clock, ClipboardList, CheckCircle, BrainCircuit, ChevronLeft } from 'lucide-react';

const EditStudent = () => {
    const { id } = useParams();
    const navigate = useNavigate();

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
        depressionSigns: false,
        password: '' // Add password field
    });
    const [message, setMessage] = useState('');
    const [type, setType] = useState('success');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchStudent();
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
        setFormData({
            ...formData,
            [name]: inputType === 'checkbox' ? checked : value
        });
        setHasChanged(true);
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const studentData = {
                ...formData,
                riskStatus: hasChanged ? 'Not Predicted' : formData.riskStatus
            };

            const res = await axios.put(`http://localhost:5000/api/students/${id}`, studentData);
            setSavedStudentId(res.data._id);
            setMessage('Student Record Updated Successfully!');
            setType('success');
            setHasChanged(false);

            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Failed to update student');
            setType('error');
        } finally {
            setLoading(false);
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

    return (
        <div style={{ paddingBottom: '60px', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                <button onClick={() => navigate('/student-details')} className="btn-secondary" style={{ padding: '8px' }}>
                    <ChevronLeft size={24} />
                </button>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', background: 'linear-gradient(to right, #60a5fa, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Edit Student Profile
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

            <form onSubmit={onSubmit} className="card glass" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', padding: '40px' }}>
                <div className="input-group">
                    <label>Full Name</label>
                    <input type="text" name="name" value={formData.name} onChange={onChange} style={inputStyle} />
                </div>
                <div className="input-group">
                    <label>Email</label>
                    <input type="email" name="email" value={formData.email} onChange={onChange} style={inputStyle} />
                </div>
                <div className="input-group">
                    <label>Password (leave blank to keep current)</label>
                    <input type="password" name="password" value={formData.password} onChange={onChange} style={inputStyle} placeholder="Enter new password" />
                </div>
                <div className="input-group">
                    <label>Registration Number</label>
                    <input type="text" name="registerNo" value={formData.registerNo} onChange={onChange} style={inputStyle} />
                </div>
                <div className="input-group">
                    <label>Department</label>
                    <input type="text" name="department" value={formData.department} onChange={onChange} style={inputStyle} />
                </div>
                <div className="input-group">
                    <label>CGPA</label>
                    <input type="number" step="0.01" name="cgpa" value={formData.cgpa} onChange={onChange} style={inputStyle} />
                </div>
                <div className="input-group">
                    <label>Attendance (%)</label>
                    <input type="number" name="attendance" value={formData.attendance} onChange={onChange} style={inputStyle} />
                </div>

                <div style={{ gridColumn: '1 / -1', textAlign: 'center', marginTop: '32px' }}>
                    <button type="submit" className="btn-primary" style={{ padding: '14px 60px' }} disabled={loading}>
                        <Save size={20} style={{ marginRight: '8px' }} /> {loading ? 'Updating...' : 'Update Record'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditStudent;
