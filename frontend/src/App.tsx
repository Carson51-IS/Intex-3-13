import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import LoginMfaPage from './pages/LoginMfaPage';
import RegisterPage from './pages/RegisterPage';
import LogoutPage from './pages/LogoutPage';
import AdminDashboard from './pages/AdminDashboard';
import ImpactPage from './pages/ImpactPage';
import PrivacyPage from './pages/PrivacyPage';
import DonorDashboard from './pages/DonorDashboard';
import ResidentsPage from './pages/admin/ResidentsPage';
import ResidentDetailPage from './pages/admin/ResidentDetailPage';
import DonorsPage from './pages/admin/DonorsPage';
import ReportsPage from './pages/admin/ReportsPage';
import SettingsPage from './pages/admin/SettingsPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import InsightsHubPage from './pages/admin/InsightsHubPage';
import SocialInsightsAdminPage from './pages/admin/SocialInsightsAdminPage';
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
    const adminMayAccessDonor = requiredRole === 'Donor' && user.roles.includes('Admin');
    if (!adminMayAccessDonor) {
      if (user.roles.includes('Donor')) return <Navigate to="/donor" replace />;
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}

function AdminRoute({ children }: { children: ReactNode }) {
  return <ProtectedRoute requiredRole="Admin">{children}</ProtectedRoute>;
}

const ADMIN_ROUTES: { path: string; element: ReactNode }[] = [
  { path: '/admin', element: <AdminDashboard /> },
  { path: '/admin/residents', element: <ResidentsPage /> },
  { path: '/admin/residents/:id', element: <ResidentDetailPage /> },
  { path: '/admin/donors', element: <DonorsPage /> },
  { path: '/admin/reports', element: <ReportsPage /> },
  { path: '/admin/insights', element: <InsightsHubPage /> },
  { path: '/admin/social-insights', element: <SocialInsightsAdminPage /> },
  { path: '/admin/settings', element: <SettingsPage /> },
  { path: '/admin/users', element: <UserManagementPage /> },
  { path: '/admin/donor-insights', element: <DonorInsightsPage /> },
  { path: '/admin/resident-insights', element: <ResidentInsightsPage /> },
];

function GuestOnlyRoute({ children }: { children: ReactNode }) {
  const { user, isLoading, isAdmin, isDonor } = useAuth();

  if (isLoading) return <div style={{ padding: '2rem' }}>Loading...</div>;
  if (user) {
    const target = isAdmin ? '/admin' : isDonor ? '/donor' : '/';
    return <Navigate to={target} replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { pathname } = useLocation();
  const isAdminRoute = pathname.startsWith('/admin');
  const showPublicChrome = !isAdminRoute;

  return (
    <div className="flex min-h-screen flex-col">
      {showPublicChrome && <Navbar />}
      <main className={`flex-1 bg-[#f7fafc] ${showPublicChrome ? 'pt-16' : ''}`}>
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
          <Route
            path="/login/mfa"
            element={
              <GuestOnlyRoute>
                <LoginMfaPage />
              </GuestOnlyRoute>
            }
          />
          <Route path="/impact" element={<ImpactPage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/logout" element={<LogoutPage />} />
          <Route
            path="/manage-mfa"
            element={
              <ProtectedRoute>
                <ManageMFA />
              </ProtectedRoute>
            }
          />
          <Route path="/cookies" element={<CookiePolicyPage />} />
          <Route
            path="/donor"
            element={
              <ProtectedRoute requiredRole="Donor">
                <DonorDashboard />
              </ProtectedRoute>
            }
          />

          {ADMIN_ROUTES.map(({ path, element }) => (
            <Route key={path} path={path} element={<AdminRoute>{element}</AdminRoute>} />
          ))}

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {showPublicChrome && <Footer />}
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

function AppProviders({ children }: { children: ReactNode }) {
  return (
    <CookieConsentProvider>
      <AuthProvider>
        <BrowserRouter>{children}</BrowserRouter>
      </AuthProvider>
    </CookieConsentProvider>
  );
}

export default function App() {
  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  );
}
