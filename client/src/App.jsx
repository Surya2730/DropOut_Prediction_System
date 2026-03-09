import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Home from './pages/Home';
import StudentDetails from './pages/StudentDetails';
import EditStudent from './pages/EditStudent';
import Predict from './pages/Predict';
import StudentDashboard from './pages/StudentDashboard';
import Verification from './pages/Verification';
import AddedStudents from './pages/AddedStudents';
import ManageStudents from './pages/ManageStudents.jsx';
import VerifiedStudents from './pages/VerifiedStudents';

const ProtectedRoute = ({ children, facultyOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" />;

  const isCoordinator = ['AcademicCoordinator', 'LabCoordinator', 'PlacementCoordinator'].includes(user.role);

  if (facultyOnly && user.role !== 'Faculty' && !isCoordinator) return <Navigate to="/" />;

  return <Layout>{children}</Layout>;
};

const DashboardSelector = () => {
  const { user } = useAuth();
  return user?.role === 'Student' ? <StudentDashboard /> : <Home />;
};

function App() {
  const googleClientId = '309989016010-b57s7e7hokenc9d1o7t46njgf1j85u5o.apps.googleusercontent.com';

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/" element={
              <ProtectedRoute>
                <DashboardSelector />
              </ProtectedRoute>
            } />

            <Route path="/faculty/verification" element={
              <ProtectedRoute facultyOnly>
                <Verification />
              </ProtectedRoute>
            } />

            <Route path="/faculty/manage-students" element={
              <ProtectedRoute facultyOnly>
                <ManageStudents />
              </ProtectedRoute>
            } />

            <Route path="/faculty/added-students" element={
              <ProtectedRoute facultyOnly>
                <AddedStudents />
              </ProtectedRoute>
            } />

            <Route path="/faculty/verified-students" element={
              <ProtectedRoute facultyOnly>
                <VerifiedStudents />
              </ProtectedRoute>
            } />

            <Route path="/student-details" element={<ProtectedRoute facultyOnly><StudentDetails /></ProtectedRoute>} />
            <Route path="/edit-student/:id" element={<ProtectedRoute facultyOnly><EditStudent /></ProtectedRoute>} />

            <Route path="/predict" element={
              <ProtectedRoute facultyOnly>
                <Predict />
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
