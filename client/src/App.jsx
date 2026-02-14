import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Home from './pages/Home';
import AddStudent from './pages/AddStudent';
import StudentDetails from './pages/StudentDetails';
import Predict from './pages/Predict';
import './index.css';

const ProtectedRoute = ({ children, facultyOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (facultyOnly && user.role !== 'Faculty') return <Navigate to="/" />;

  return <Layout>{children}</Layout>;
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
                <Home />
              </ProtectedRoute>
            } />

            <Route path="/add-student" element={
              <ProtectedRoute facultyOnly>
                <AddStudent />
              </ProtectedRoute>
            } />

            <Route path="/edit-student/:id" element={
              <ProtectedRoute facultyOnly>
                <AddStudent />
              </ProtectedRoute>
            } />

            <Route path="/student-details" element={
              <ProtectedRoute facultyOnly>
                <StudentDetails />
              </ProtectedRoute>
            } />

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
