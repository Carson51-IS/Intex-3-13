import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LogoutPage from './pages/LogoutPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminPage from './pages/AdminPage';
import ImpactPage from './pages/ImpactPage';
import PrivacyPage from './pages/PrivacyPage';
import InsightsPage from './pages/InsightsPage';
import DonorInsightsPage from './pages/DonorInsightsPage';
import ResidentInsightsPage from './pages/ResidentInsightsPage';
import type { ReactNode } from 'react';
import ManageMFA from './pages/ManageMFAPage';
import CookiePolicyPage from './pages/CookiePolicyPage';
import CookieConsentBannerView from './components/CookieConsentBannerView';
import { CookieConsentProvider } from './context/CookieConsentContext';

function ProtectedRoute({ children, requiredRole }: { children: ReactNode; requiredRole?: string }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div style={{ padding: '2rem' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && !user.roles.includes(requiredRole)) return <Navigate to="/" replace />;

  return <>{children}</>;
}

function GuestOnlyRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div style={{ padding: '2rem' }}>Loading...</div>;
  if (user) return <Navigate to="/" replace />;

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1, backgroundColor: '#f7fafc' }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/login"
            element={
              <GuestOnlyRoute>
                <LoginPage />
              </GuestOnlyRoute>
            }
          />
          <Route path="/impact" element={<ImpactPage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/logout" element={<LogoutPage />} />
          <Route path="/manage-mfa" element={<ManageMFA />} />
          <Route path="/cookies" element={<CookiePolicyPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="Admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requiredRole="Admin">
                <AdminPage />
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
        </Routes>
      </main>
      <Footer />
      <CookieConsentBannerView />
    </div>
  );
}

export default function App() {
  return (
    <CookieConsentProvider>
      <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
    </CookieConsentProvider>
    
  );
}
