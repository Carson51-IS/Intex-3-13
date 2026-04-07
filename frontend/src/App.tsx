import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CookieConsent from './components/CookieConsent';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import ImpactPage from './pages/ImpactPage';
import PrivacyPage from './pages/PrivacyPage';
import DonorDashboard from './pages/DonorDashboard';
import ResidentsPage from './pages/admin/ResidentsPage';
import ResidentDetailPage from './pages/admin/ResidentDetailPage';
import DonorsPage from './pages/admin/DonorsPage';
import ReportsPage from './pages/admin/ReportsPage';
import InsightsPage from './pages/InsightsPage';
import DonorInsightsPage from './pages/DonorInsightsPage';
import ResidentInsightsPage from './pages/ResidentInsightsPage';
import type { ReactNode } from 'react';

function ProtectedRoute({ children, requiredRole }: { children: ReactNode; requiredRole?: string }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⏳</div>
          <div style={{ color: '#a0aec0', fontSize: '0.9rem' }}>Loading…</div>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && !user.roles.includes(requiredRole)) {
    if (user.roles.includes('Donor')) return <Navigate to="/donor" replace />;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1, backgroundColor: '#f7fafc' }}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/impact" element={<ImpactPage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />

          {/* Donor routes */}
          <Route
            path="/donor"
            element={
              <ProtectedRoute>
                <DonorDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="Admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/residents"
            element={
              <ProtectedRoute requiredRole="Admin">
                <ResidentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/residents/:id"
            element={
              <ProtectedRoute requiredRole="Admin">
                <ResidentDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/donors"
            element={
              <ProtectedRoute requiredRole="Admin">
                <DonorsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute requiredRole="Admin">
                <ReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/donor-insights"
            element={
              <ProtectedRoute requiredRole="Admin">
                <DonorInsightsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/resident-insights"
            element={
              <ProtectedRoute requiredRole="Admin">
                <ResidentInsightsPage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <CookieConsent />
    </div>
  );
}

function NotFound() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', textAlign: 'center', padding: '2rem' }}>
      <div>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>404</div>
        <h1 style={{ fontSize: '1.5rem', color: '#1a365d', marginBottom: '0.75rem' }}>Page Not Found</h1>
        <p style={{ color: '#718096', marginBottom: '1.5rem' }}>The page you're looking for doesn't exist.</p>
        <a href="/" style={{ color: '#2b6cb0', textDecoration: 'none', fontWeight: 600 }}>← Back to Home</a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
