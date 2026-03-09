import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Users, UserCheck, AlertTriangle, CheckCircle, Edit, Trash2, Search, RefreshCw, SortAsc, SortDesc } from 'lucide-react';

const AddedStudents = () => {
    const { user } = useAuth();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingStudent, setEditingStudent] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', email: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('registerNo'); // 'registerNo', 'name', 'department'
    const [sortOrder, setSortOrder] = useState('asc'); // 'asc', 'desc'

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/students?role=${user?.role || 'Faculty'}`);
            setStudents(res.data);
        } catch (err) {
            console.error('Error fetching students', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (student) => {
        setEditingStudent(student);
        setEditForm({ name: student.name, email: student.email });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            // Update student data
            await axios.put(`http://localhost:5000/api/students/${editingStudent._id}`, {
                ...editingStudent,
                name: editForm.name,
                email: editForm.email
            });

            // Update user data if name or email changed
            if (editForm.name !== editingStudent.name || editForm.email !== editingStudent.email) {
                await axios.put(`http://localhost:5000/api/auth/update-user/${editingStudent._id}`, {
                    name: editForm.name,
                    email: editForm.email
                });
            }

            setEditingStudent(null);
            fetchStudents(); // Refresh the list
        } catch (err) {
            console.error('Error updating student', err);
            alert('Failed to update student');
        }
    };

    const handleDelete = async (student) => {
        if (!student || !student._id) {
            alert('Invalid student data. Cannot delete.');
            return;
        }

        if (window.confirm('Are you sure you want to delete this student? This will remove their account and they will no longer be able to login.')) {
            try {
                // Delete student (and linked user) from backend
                await axios.delete(`http://localhost:5000/api/students/${student._id}`);

                fetchStudents(); // Refresh the list
            } catch (err) {
                console.error('Error deleting student', err);
                const msg = err.response?.data?.message || 'Failed to delete student';
                alert(msg);
            }
        }
    };

    // Filter students based on search term
    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.registerNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.year.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleMigrateStudents = async () => {
        if (window.confirm('This will create student records for any existing student users who don\'t have them. Continue?')) {
            try {
                const response = await axios.post('http://localhost:5000/api/auth/migrate-students');
                alert(response.data.message);
                fetchStudents(); // Refresh the list
            } catch (err) {
                console.error('Migration error:', err);
                alert('Migration failed. Please try again.');
            }
        }
    };

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    // Filter and sort students
    const filteredAndSortedStudents = filteredStudents
        .sort((a, b) => {
            let aValue, bValue;

            switch (sortBy) {
                case 'registerNo':
                    aValue = a.registerNo || '';
                    bValue = b.registerNo || '';
                    break;
                case 'name':
                    aValue = a.name || '';
                    bValue = b.name || '';
                    break;
                case 'department':
                    aValue = a.department || '';
                    bValue = b.department || '';
                    break;
                default:
                    return 0;
            }

            if (sortOrder === 'asc') {
                return aValue.localeCompare(bValue);
            } else {
                return bValue.localeCompare(aValue);
            }
        });

    // Group students by department and year
    const groupedStudents = filteredAndSortedStudents.reduce((groups, student) => {
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

    if (loading) return <div style={{ textAlign: 'center', padding: '100px', color: 'var(--text)' }}>Loading added students...</div>;

    return (
        <div className="animate-fade">
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '8px' }}>
                    Added Students
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                    View all students added to the system with their risk status.
                </p>
            </div>

            <div className="stats-grid" style={{ marginBottom: '32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div className="card glass stat-card">
                    <Users size={24} color="var(--primary)" style={{ marginBottom: '12px' }} />
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Total Added Students</p>
                    <p className="stat-value">{students.length}</p>
                </div>
                <div className="card glass stat-card">
                    <AlertTriangle size={24} color="#f87171" style={{ marginBottom: '12px' }} />
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>High Risk</p>
                    <p className="stat-value" style={{ color: '#f87171' }}>{students.filter(s => s.riskStatus === 'High Risk').length}</p>
                </div>
                <div className="card glass stat-card">
                    <CheckCircle size={24} color="#4ade80" style={{ marginBottom: '12px' }} />
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Low Risk</p>
                    <p className="stat-value" style={{ color: '#4ade80' }}>{students.filter(s => s.riskStatus === 'Low Risk').length}</p>
                </div>
                <div className="card glass stat-card">
                    <UserCheck size={24} color="var(--primary)" style={{ marginBottom: '12px' }} />
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Not Predicted</p>
                    <p className="stat-value">{students.filter(s => s.riskStatus === 'Not Predicted').length}</p>
                </div>
            </div>

            {/* Search Bar */}
            <div className="card glass" style={{ marginBottom: '24px', padding: '20px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
                        <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search students by name, email, register number, department, or year..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 12px 12px 40px',
                                border: '1px solid var(--border)',
                                borderRadius: '8px',
                                background: 'var(--bg-secondary)',
                                color: 'var(--text)',
                                fontSize: '1rem'
                            }}
                        />
                    </div>
                    <button
                        onClick={handleMigrateStudents}
                        style={{
                            padding: '12px 20px',
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                            background: 'var(--primary)',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '0.9rem',
                            whiteSpace: 'nowrap'
                        }}
                        title="Migrate existing student users to student records"
                    >
                        <RefreshCw size={16} />
                        Migrate Students
                    </button>
                </div>
                {searchTerm && (
                    <p style={{ marginTop: '8px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        Showing {filteredAndSortedStudents.length} of {students.length} students
                    </p>
                )}
            </div>

            <div className="card glass">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                    <Users size={20} color="var(--primary)" />
                    <h3 style={{ fontSize: '1.25rem' }}>Student List ({filteredAndSortedStudents.length})</h3>
                </div>

                {/* Sorting Controls */}
                <div style={{ marginBottom: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => handleSort('registerNo')}
                        style={{
                            padding: '8px 16px',
                            border: '1px solid var(--border)',
                            borderRadius: '6px',
                            background: sortBy === 'registerNo' ? 'var(--primary)' : 'var(--bg-secondary)',
                            color: sortBy === 'registerNo' ? 'white' : 'var(--text)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '0.875rem'
                        }}
                    >
                        Roll Number
                        {sortBy === 'registerNo' && (
                            sortOrder === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />
                        )}
                    </button>
                    <button
                        onClick={() => handleSort('name')}
                        style={{
                            padding: '8px 16px',
                            border: '1px solid var(--border)',
                            borderRadius: '6px',
                            background: sortBy === 'name' ? 'var(--primary)' : 'var(--bg-secondary)',
                            color: sortBy === 'name' ? 'white' : 'var(--text)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '0.875rem'
                        }}
                    >
                        Name
                        {sortBy === 'name' && (
                            sortOrder === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />
                        )}
                    </button>
                    <button
                        onClick={() => handleSort('department')}
                        style={{
                            padding: '8px 16px',
                            border: '1px solid var(--border)',
                            borderRadius: '6px',
                            background: sortBy === 'department' ? 'var(--primary)' : 'var(--bg-secondary)',
                            color: sortBy === 'department' ? 'white' : 'var(--text)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '0.875rem'
                        }}
                    >
                        Department
                        {sortBy === 'department' && (
                            sortOrder === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />
                        )}
                    </button>
                </div>

                {filteredAndSortedStudents.length === 0 ? (
                    <p style={{ color: 'var(--text)', textAlign: 'center', padding: '40px' }}>
                        {searchTerm ? 'No students found matching your search.' : 'No students added yet. Go to Manage Students to add student accounts.'}
                    </p>
                ) : (
                    <div style={{ display: 'grid', gap: '24px' }}>
                        {Object.keys(groupedStudents).sort().map(dept => (
                            <div key={dept}>
                                <h4 style={{
                                    fontSize: '1.1rem',
                                    fontWeight: '600',
                                    color: 'var(--primary)',
                                    marginBottom: '12px',
                                    paddingBottom: '8px',
                                    borderBottom: '2px solid var(--border)'
                                }}>
                                    {dept}
                                </h4>
                                {Object.keys(groupedStudents[dept]).sort((a, b) => b.localeCompare(a)).map(year => (
                                    <div key={year} style={{ marginBottom: '16px' }}>
                                        <h5 style={{
                                            fontSize: '0.95rem',
                                            fontWeight: '500',
                                            color: 'var(--text)',
                                            marginBottom: '8px',
                                            paddingLeft: '16px',
                                            borderLeft: '3px solid var(--primary)'
                                        }}>
                                            {year} ({groupedStudents[dept][year].length} students)
                                        </h5>
                                        <div style={{ display: 'grid', gap: '12px', paddingLeft: '16px' }}>
                                            {groupedStudents[dept][year].map((student) => (
                                                <div
                                                    key={student._id}
                                                    style={{
                                                        padding: '16px',
                                                        border: '1px solid var(--border)',
                                                        borderRadius: '8px',
                                                        background: 'var(--bg-secondary)',
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center'
                                                    }}
                                                >
                                                    <div style={{ flex: 1 }}>
                                                        <p style={{ fontWeight: '600', margin: '0' }}>{student.name}</p>
                                                        <p style={{ color: 'var(--text-muted)', margin: '4px 0' }}>{student.email}</p>
                                                        <p style={{ color: 'var(--text-muted)', margin: '0', fontSize: '0.875rem' }}>
                                                            {student.registerNo} | {student.department} | {student.year}
                                                        </p>
                                                    </div>
                                                    <div style={{
                                                        padding: '4px 12px',
                                                        borderRadius: '20px',
                                                        background: student.riskStatus === 'High Risk' ? '#fee2e2' : student.riskStatus === 'Low Risk' ? '#d1fae5' : '#e2e8f0',
                                                        color: student.riskStatus === 'High Risk' ? '#991b1b' : student.riskStatus === 'Low Risk' ? '#065f46' : '#475569',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '600',
                                                        marginRight: '16px'
                                                    }}>
                                                        {student.riskStatus || 'Not Predicted'}
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button
                                                            onClick={() => handleEdit(student)}
                                                            style={{
                                                                padding: '8px',
                                                                border: 'none',
                                                                borderRadius: '6px',
                                                                background: 'var(--primary)',
                                                                color: 'white',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center'
                                                            }}
                                                            title="Edit Student"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(student)}
                                                            style={{
                                                                padding: '8px',
                                                                border: 'none',
                                                                borderRadius: '6px',
                                                                background: '#ef4444',
                                                                color: 'white',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center'
                                                            }}
                                                            title="Delete Student"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Edit Student Modal */}
            {editingStudent && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div className="card glass" style={{
                        width: '90%',
                        maxWidth: '500px',
                        padding: '24px'
                    }}>
                        <h3 style={{ marginBottom: '20px', fontSize: '1.5rem' }}>Edit Student</h3>
                        <form onSubmit={handleEditSubmit}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Name</label>
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '1px solid var(--border)',
                                        borderRadius: '8px',
                                        background: 'var(--bg-secondary)',
                                        color: 'var(--text)'
                                    }}
                                />
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Email</label>
                                <input
                                    type="email"
                                    value={editForm.email}
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '1px solid var(--border)',
                                        borderRadius: '8px',
                                        background: 'var(--bg-secondary)',
                                        color: 'var(--text)'
                                    }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={() => setEditingStudent(null)}
                                    style={{
                                        padding: '10px 20px',
                                        border: '1px solid var(--border)',
                                        borderRadius: '6px',
                                        background: 'transparent',
                                        color: 'var(--text)',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    style={{ padding: '10px 20px' }}
                                >
                                    Update Student
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddedStudents;