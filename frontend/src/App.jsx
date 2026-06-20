import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/shared';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import InstallBanner from './components/InstallBanner';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import LandingPage from './pages/LandingPage';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import CitizenDashboard from './pages/CitizenDashboard';
import SubmitComplaint from './pages/SubmitComplaint';
import ComplaintsListPage from './pages/ComplaintsListPage';
import ComplaintDetailPage from './pages/ComplaintDetailPage';
import AssistantPage from './pages/AssistantPage';
import AdminDashboard from './pages/AdminDashboard';
import ServicesPage from './pages/ServicesPage';
import ProfilePage from './pages/ProfilePage';

function AppLayout({ children }) {
  const { user } = useAuth();
  const isOnline = useOnlineStatus();

  if (!user) {
    return (
      <>
        {!isOnline && (
          <div style={{ background: '#ef4444', color: 'white', textAlign: 'center', padding: '0.5rem', fontSize: '0.875rem' }}>
            ⚠️ You are offline. Some features may not be available.
          </div>
        )}
        {children}
        <InstallBanner />
      </>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        {!isOnline && (
          <div style={{ background: '#ef4444', color: 'white', textAlign: 'center', padding: '0.5rem', fontSize: '0.875rem', marginBottom: '1rem', borderRadius: '8px' }}>
            ⚠️ You are offline. Showing cached data.
          </div>
        )}
        {children}
      </div>
      <BottomNav />
      <InstallBanner />
    </div>
  );
}

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <LandingPage />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'department_head') return <Navigate to="/dept" replace />;
  return <Navigate to="/dashboard" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </BrowserRouter>
  );
}

function AppInner() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Citizen Routes */}
        <Route path="/dashboard" element={<ProtectedRoute roles={['citizen']}><CitizenDashboard /></ProtectedRoute>} />
        <Route path="/submit" element={<ProtectedRoute><SubmitComplaint /></ProtectedRoute>} />
        <Route path="/my-complaints" element={<ProtectedRoute><ComplaintsListPage adminView={false} /></ProtectedRoute>} />
        <Route path="/complaint/:id" element={<ProtectedRoute><ComplaintDetailPage /></ProtectedRoute>} />
        <Route path="/assistant" element={<ProtectedRoute><AssistantPage /></ProtectedRoute>} />
        <Route path="/services" element={<ProtectedRoute><ServicesPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/complaints" element={<ProtectedRoute roles={['admin']}><ComplaintsListPage adminView={true} /></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/departments" element={<ProtectedRoute roles={['admin']}><ServicesPage /></ProtectedRoute>} />

        {/* Department Head Routes */}
        <Route path="/dept" element={<ProtectedRoute roles={['admin','department_head']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/dept/complaints" element={<ProtectedRoute roles={['admin','department_head']}><ComplaintsListPage adminView={true} /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}

export default App;
