import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
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
import DonorDashboard from './pages/DonorDashboard';
import ResidentsPage from './pages/admin/ResidentsPage';
import ResidentDetailPage from './pages/admin/ResidentDetailPage';
import DonorsPage from './pages/admin/DonorsPage';
import ReportsPage from './pages/admin/ReportsPage';
import SettingsPage from './pages/admin/SettingsPage';
import UserManagementPage from './pages/admin/UserManagementPage';
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

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
        Loading…
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

function GuestOnlyRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div style={{ padding: '2rem' }}>Loading...</div>;
  if (user) return <Navigate to="/" replace />;

  return <>{children}</>;
}

function AppRoutes() {
  const { pathname } = useLocation();
  const isLanding = pathname === '/';
  const isAdminRoute = pathname.startsWith('/admin');
  const showPublicChrome = !isLanding && !isAdminRoute;

  return (
    <div className="flex min-h-screen flex-col">
      {showPublicChrome && <Navbar />}
      <main className="flex-1 bg-[#f7fafc]">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/catalog" element={<Navigate to="/" replace />} />
          <Route path="/signin" element={<Navigate to="/login" replace />} />
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
            path="/donor"
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

          {ADMIN_ROUTES.map(({ path, element }) => (
            <Route key={path} path={path} element={<AdminRoute>{element}</AdminRoute>} />
          ))}

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <CookieConsentBannerView />
    </div>
  );
}

function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-8 text-center">
      <div className="mb-4 text-6xl text-foreground">404</div>
      <h1 className="mb-3 text-2xl font-semibold text-[#1a365d]">Page Not Found</h1>
      <p className="mb-6 text-[#718096]">The page you&apos;re looking for doesn&apos;t exist.</p>
      <a href="/" className="font-semibold text-[#2b6cb0] no-underline hover:underline">
        ← Back to Home
      </a>
    </div>
  );
}

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() ?? '';

function AppProviders({ children }: { children: ReactNode }) {
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

export default function App() {
  return googleClientId ? (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AppProviders>
        <AppRoutes />
      </AppProviders>
    </GoogleOAuthProvider>
  ) : (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  );
}
