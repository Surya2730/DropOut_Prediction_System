import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    UserPlus,
    LogOut,
    User,
    GraduationCap,
    BrainCircuit,
    AlertTriangle,
    CheckCircle,
    Search,
    Users,
    History,
    ClipboardCheck,
    Menu,
    X
} from 'lucide-react';

const Layout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Close sidebar when route changes
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location]);

    // Prevent scrolling when mobile sidebar is open
    useEffect(() => {
        if (isSidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isSidebarOpen]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isFaculty = user?.role === 'Faculty';

    return (
        <div className="app-layout">
            {/* Mobile Header */}
            <header className="mobile-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', background: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        <img src="/BannariAmman_logo.png" alt="Logo" style={{ width: '80%', height: 'auto' }} />
                    </div>
                    <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>Dropout <span style={{ color: 'var(--primary)' }}>Predict</span></span>
                </div>
                <button 
                    className="menu-toggle"
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    aria-label="Toggle Menu"
                >
                    {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </header>

            {/* Sidebar Overlay */}
            <div 
                className={`sidebar-overlay ${isSidebarOpen ? 'show' : ''}`}
                onClick={() => setIsSidebarOpen(false)}
            />

            <aside className={`sidebar glass ${isSidebarOpen ? 'open' : ''}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', padding: '0 8px' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        background: 'white',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}>
                        <img
                            src="/BannariAmman_logo.png"
                            alt="College Logo"
                            style={{ width: '85%', height: 'auto', objectFit: 'contain' }}
                        />
                    </div>
                    <h3 style={{ fontSize: '1.25rem', lineHeight: '1.2' }}>Dropout<br /><span style={{ color: 'var(--primary)' }}>Predict</span></h3>
                </div>

                <nav style={{ flex: 1 }}>
                    <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </NavLink>

                    {isFaculty && (
                        <>
                            <NavLink to="/student-details" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                <Users size={20} />
                                <span>Student Details</span>
                            </NavLink>
                            <NavLink to="/student-details?risk=High Risk" className={({ isActive }) => `nav-link ${isActive && location.search.includes('High%20Risk') ? 'active' : ''}`}>
                                <AlertTriangle size={20} color="#f87171" />
                                <span>Critical Students</span>
                            </NavLink>
                            <NavLink to="/student-details?risk=Low Risk" className={({ isActive }) => `nav-link ${isActive && location.search.includes('Low%20Risk') ? 'active' : ''}`}>
                                <CheckCircle size={20} color="#4ade80" />
                                <span>Stable Students</span>
                            </NavLink>
                            <NavLink to="/student-details?risk=Not Predicted" className={({ isActive }) => `nav-link ${isActive && location.search.includes('Not%20Predicted') ? 'active' : ''}`}>
                                <Search size={20} color="var(--primary)" />
                                <span>Unpredicted Students</span>
                            </NavLink>
                            <NavLink to="/predict" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                <BrainCircuit size={20} />
                                <span>Prediction</span>
                            </NavLink>
                            <NavLink to="/faculty/manage-students" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                <UserPlus size={20} />
                                <span>Manage Students</span>
                            </NavLink>
                            <NavLink to="/faculty/added-students" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                <Users size={20} />
                                <span>Added Students</span>
                            </NavLink>
                        </>
                    )}

                    {['AcademicCoordinator', 'LabCoordinator', 'PlacementCoordinator'].includes(user?.role) && (
                        <>
                            <NavLink to="/faculty/verification" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                <ClipboardCheck size={20} />
                                <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>Pending Approval</span>
                            </NavLink>
                            <NavLink to="/faculty/verified-students" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                <History size={20} />
                                <span>Verification History</span>
                            </NavLink>
                        </>
                    )}
                </nav>

                <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 8px 20px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--glass-border)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center' }}>
                            <User size={20} />
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                            <p style={{ fontSize: '0.875rem', fontWeight: '600', whiteSpace: 'nowrap', textOverflow: 'ellipsis', textTransform: 'uppercase' }}>{user?.name}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.role}</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="nav-link" style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer' }}>
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            <main className="main-content animate-fade">
                {children}
            </main>
        </div>
    );
};

export default Layout;
