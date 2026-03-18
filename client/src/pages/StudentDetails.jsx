import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Trash2, Edit, User, GraduationCap, AlertTriangle, CheckCircle, BrainCircuit, FileDown } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

    const handleDownloadPDF = () => {
        if (!filteredStudents || filteredStudents.length === 0) {
            alert('No records to export. Please adjust your filters or add data first.');
            return;
        }

        try {
            console.log('Starting PDF generation...');
            const doc = new jsPDF();
            console.log('jsPDF created');

            // Add Title
            doc.setFontSize(20);
            doc.text(getPageTitle(), 14, 22);
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(getPageDescription(), 14, 30);
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 36);
            console.log('Title added');

            // Prepare Table Data
            const tableBody = filteredStudents.map(student => [
                student.name || 'N/A',
                student.registerNo || 'N/A',
                student.department || 'N/A',
                student.attendance != null ? `${student.attendance}%` : 'N/A',
                student.cgpa != null ? student.cgpa : 'N/A',
                student.riskStatus || 'Not Analyzed'
            ]);
            console.log('Table data prepared:', tableBody);

            // Try autoTable
            try {
                autoTable(doc, {
                    startY: 45,
                    head: [['Name', 'Register No', 'Department', 'Attendance', 'CGPA', 'Risk Status']],
                    body: tableBody,
                    theme: 'striped',
                    headStyles: { fillColor: [99, 102, 241] },
                });
                console.log('Table added successfully');
            } catch (tableError) {
                console.error('autoTable failed:', tableError);
                // Fallback: add text instead
                doc.setFontSize(12);
                doc.text('Student Records:', 14, 50);
                let yPos = 60;
                tableBody.forEach((row, index) => {
                    doc.text(`${index + 1}. ${row.join(' | ')}`, 14, yPos);
                    yPos += 10;
                    if (yPos > 270) {
                        doc.addPage();
                        yPos = 20;
                    }
                });
                console.log('Fallback text added');
            }

            // Try to save the PDF; if blocked, open in new tab
            try {
                doc.save(`${getPageTitle().replace(/\s+/g, '_')}_${new Date().toLocaleDateString()}.pdf`);
                console.log('PDF saved');
            } catch (saveError) {
                console.warn('Direct save failed, opening PDF in new tab:', saveError);
                const pdfDataUri = doc.output('dataurlstring');
                const newWindow = window.open();
                newWindow.document.write(`<iframe src="${pdfDataUri}" style="width:100%; height:100%;" frameborder="0"></iframe>`);
            }
        } catch (err) {
            console.error('PDF export failed:', err);
            alert(`Unable to generate PDF: ${err.message}. Please try again or contact support.`);
        }
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
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
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
                                background: '#f8fafc',
                                border: '1.5px solid var(--glass-border)',
                                color: 'var(--text-main)'
                            }}
                        />
                    </div>
                    <button
                        onClick={handleDownloadPDF}
                        disabled={filteredStudents.length === 0}
                        className="btn-primary"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px 20px',
                            borderRadius: '10px',
                            width: 'auto',
                            boxShadow: 'none',
                            fontSize: '0.9rem'
                        }}
                        title={filteredStudents.length === 0 ? 'No records available to export' : 'Export current list to PDF'}
                    >
                        <FileDown size={18} />
                        Export PDF
                    </button>
                </div>
            </div>

            <div className="card glass" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: 'var(--bg-secondary)' }}>
                        <tr>
                            <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase' }}>Individual Identity</th>
                            <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase' }}>Academic Context</th>
                            <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase' }}>Performance</th>
                            <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase' }}>Analysis Status</th>
                            <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(groupedStudents).length === 0 ? (
                            <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No student records found.</td></tr>
                        ) : Object.keys(groupedStudents).sort().map(dept => (
                            <React.Fragment key={dept}>
                                <tr style={{ background: '#ffffff' }}>
                                    <td colSpan="5" style={{ padding: '16px 24px', fontWeight: '700', color: 'var(--primary)', fontSize: '1.1rem', borderTop: '2px solid rgba(255,255,255,0.1)' }}>
                                        {dept}
                                    </td>
                                </tr>
                                {Object.keys(groupedStudents[dept]).sort((a, b) => b.localeCompare(a)).map(year => (
                                    <React.Fragment key={year}>
                                        <tr style={{ background: 'var(--bg-secondary)' }}>
                                            <td colSpan="5" style={{ padding: '12px 24px 8px 48px', fontWeight: '600', color: 'var(--text)', fontSize: '0.95rem' }}>
                                                {year}
                                            </td>
                                        </tr>
                                        {groupedStudents[dept][year].map(student => (
                                            <tr key={student._id} style={{ borderTop: '1px solid var(--glass-border)', transition: 'background 0.2s' }} className="table-row">
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
                                                            <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{student.name}</div>
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
                                                            student.riskStatus === 'Low Risk' ? 'rgba(34, 197, 94, 0.1)' : 'var(--bg-secondary)',
                                                        color: student.riskStatus === 'High Risk' ? '#f87171' :
                                                            student.riskStatus === 'Low Risk' ? '#4ade80' : 'var(--text-muted)',
                                                        border: `1px solid ${student.riskStatus === 'High Risk' ? 'rgba(239, 68, 68, 0.2)' :
                                                            student.riskStatus === 'Low Risk' ? 'rgba(34, 197, 94, 0.2)' : 'var(--glass-border)'}`
                                                    }}>
                                                        {student.riskStatus || 'Not Analyzed'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '16px 24px' }}>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        {student.riskStatus === 'Not Predicted' && (
                                                            <button
                                                                onClick={() => {
                                                                    if (student.isVerified) {
                                                                        navigate(`/predict?studentId=${student._id}`);
                                                                    } else {
                                                                        alert('Cannot predict: This student has not been cleared by all coordinators (Academic, Lab, and Placement).');
                                                                    }
                                                                }}
                                                                style={{
                                                                    padding: '8px',
                                                                    borderRadius: '8px',
                                                                    background: student.isVerified ? 'rgba(168, 85, 247, 0.1)' : 'rgba(255,255,255,0.05)',
                                                                    color: student.isVerified ? '#a855f7' : 'var(--text-muted)',
                                                                    border: 'none',
                                                                    cursor: student.isVerified ? 'pointer' : 'not-allowed',
                                                                    opacity: student.isVerified ? 1 : 0.5
                                                                }}
                                                                title={student.isVerified ? "Run AI Prediction" : "Pending Coordinator Clearances"}
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
                                    </React.Fragment>
                                ))}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StudentDetails;
