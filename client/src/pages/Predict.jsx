import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { BrainCircuit, Search, GraduationCap, AlertCircle, CheckCircle2 } from 'lucide-react';

const Predict = () => {
    const [students, setStudents] = useState([]);
    const [selectedId, setSelectedId] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const location = useLocation();

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/students?role=Faculty&requireVerified=true`);
                const sortedStudents = res.data.sort((a, b) => {
                    const deptCompare = a.department.localeCompare(b.department);
                    if (deptCompare !== 0) return deptCompare;
                    return a.registerNo.localeCompare(b.registerNo);
                });
                setStudents(sortedStudents);

                // Check for studentId in URL to auto-trigger prediction
                const params = new URLSearchParams(location.search);
                const studentId = params.get('studentId');
                if (studentId) {
                    setSelectedId(studentId);
                    // We need to wait for state to update, or just use the student object directly
                    const student = sortedStudents.find(s => s._id === studentId);
                    if (student) {
                        runAutoPredict(student);
                    }
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchStudents();
    }, [location.search]);

    const runAutoPredict = async (student) => {
        setLoading(true);
        setError('');
        setResult(null);
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/predict`, student);

            // Check if the response indicates the student is not verified
            if (res.data.riskStatus === 'Not Verified') {
                setError(res.data.message || 'Student must be fully verified before prediction');
                return;
            }

            setResult({
                ...student,
                riskStatus: res.data.riskStatus,
                message: res.data.message,
                heuristicScore: res.data.heuristicScore,
                threshold: res.data.threshold
            });
            // Refresh student list
            const updatedList = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/students?role=Faculty&requireVerified=true`);
            const sortedStudents = updatedList.data.sort((a, b) => {
                const deptCompare = a.department.localeCompare(b.department);
                if (deptCompare !== 0) return deptCompare;
                return a.registerNo.localeCompare(b.registerNo);
            });
            setStudents(sortedStudents);
        } catch (err) {
            // Handle different types of errors
            if (err.response && err.response.status === 400 && err.response.data.riskStatus === 'Not Verified') {
                setError(err.response.data.message || 'Student must be fully verified before prediction');
            } else {
                setError('Prediction failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePredict = async (e) => {
        e.preventDefault();
        if (!selectedId) return setError('Please select a student');

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const student = students.find(s => s._id === selectedId);
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/predict`, student);

            // Check if the response indicates the student is not verified
            if (res.data.riskStatus === 'Not Verified') {
                setError(res.data.message || 'Student must be fully verified before prediction');
                return;
            }

            setResult({
                ...student,
                riskStatus: res.data.riskStatus,
                message: res.data.message,
                heuristicScore: res.data.heuristicScore,
                threshold: res.data.threshold
            });
            // Refresh student list to update riskStatus
            const updatedList = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/students?role=Faculty&requireVerified=true`);
            const sortedStudents = updatedList.data.sort((a, b) => {
                const deptCompare = a.department.localeCompare(b.department);
                if (deptCompare !== 0) return deptCompare;
                return a.registerNo.localeCompare(b.registerNo);
            });
            setStudents(sortedStudents);
        } catch (err) {
            // Handle different types of errors
            if (err.response && err.response.status === 400 && err.response.data.riskStatus === 'Not Verified') {
                setError(err.response.data.message || 'Student must be fully verified before prediction');
            } else {
                setError('Prediction failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '2.25rem', marginBottom: '8px' }}>Risk Analysis</h1>
                <p style={{ color: 'var(--text-muted)' }}>Run AI predictions to identify students who may need academic intervention.</p>
            </div>

            <div className="card glass animate-fade" style={{ maxWidth: '600px', marginBottom: '32px' }}>
                <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Search size={20} color="var(--primary)" />
                    Select Student for Prediction
                </h3>
                <form onSubmit={handlePredict}>
                    <div className="input-group">
                        <select
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: '#f8fafc',
                                border: '1.5px solid var(--glass-border)',
                                borderRadius: '12px',
                                color: 'var(--text-main)',
                                appearance: 'none'
                            }}
                            value={selectedId}
                            onChange={(e) => setSelectedId(e.target.value)}
                        >
                            <option value="">Choose a student...</option>
                            {students.map(s => (
                                <option key={s._id} value={s._id}>{s.name} ({s.registerNo})</option>
                            ))}
                        </select>
                    </div>
                    {error && <p style={{ color: '#f87171', fontSize: '0.875rem', marginBottom: '16px' }}>{error}</p>}
                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                        {loading ? 'Analyzing...' : (
                            <>
                                <BrainCircuit size={20} />
                                Run Prediction
                            </>
                        )}
                    </button>
                </form>
            </div>

            {result && (
                <div className="card glass animate-fade" style={{
                    border: `2px solid ${result.riskStatus === 'High Risk' ? '#f87171' : '#4ade80'}`,
                    padding: '32px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px' }}>
                        <div style={{
                            padding: '16px',
                            background: result.riskStatus === 'High Risk' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                            borderRadius: '16px'
                        }}>
                            {result.riskStatus === 'High Risk' ? (
                                <AlertCircle size={48} color="#f87171" />
                            ) : (
                                <CheckCircle2 size={48} color="#4ade80" />
                            )}
                        </div>
                        <div style={{ flex: 1 }}>
                            <h2 style={{ fontSize: '1.75rem', marginBottom: '4px' }}>{result.name}</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>{result.registerNo}</p>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                <span style={{ fontSize: '1rem', fontWeight: '500' }}>Analysis Result:</span>
                                <span className={`status-badge ${result.riskStatus === 'High Risk' ? 'status-high' : 'status-low'}`} style={{ fontSize: '1rem', padding: '6px 20px' }}>
                                    {result.riskStatus}
                                </span>
                            </div>

                            <div className="form-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', background: 'var(--bg-secondary)', padding: '20px', borderRadius: '12px' }}>
                                <div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>CGPA</p>
                                    <p style={{ fontSize: '1.25rem', fontWeight: '600' }}>{result.cgpa}</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Attendance</p>
                                    <p style={{ fontSize: '1.25rem', fontWeight: '600' }}>{result.attendance}%</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Backlogs</p>
                                    <p style={{ fontSize: '1.25rem', fontWeight: '600' }}>{result.backlogs}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Predict;
