import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { AuthSession } from '../types/authSession';
import { getCurrentUser } from '../lib/AuthAPI';

interface AuthContextValue {
  authSession: AuthSession;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshAuthSession: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const AnonymousSession: AuthSession = {
  isAuthenticated: false,
  userName: null,
  email: null,
  roles: [],
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authSession, setAuthSession] = useState<AuthSession>(AnonymousSession);
  const [isLoading, setIsLoading] = useState(true);

  const refreshAuthSession = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();
      setAuthSession({
        isAuthenticated: true,
        userName: currentUser.email,
        email: currentUser.email,
        roles: currentUser.roles,
      });
    } catch {
      // Session may be expired or unauthenticated; default to anonymous view state.
      setAuthSession(AnonymousSession);
    } finally {
  useEffect(() => {
    if (!token) {
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAuthSession();
  }, [refreshAuthSession]);
    setIsLoading(true);
    api.get<User>('/auth/me')
      .then(setUser)
      .catch(() => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, [token]);

  const login = async (email: string, password: string) => {
    const { token: newToken } = await api.post<{ token: string }>('/auth/login', { email, password });
    localStorage.setItem('token', newToken);
    setToken(newToken);
    // Load user before LoginPage navigates — otherwise ProtectedRoute sees token but no user
    // and redirects back to /login (isLoading was false during the /me gap).
    const me = await api.get<User>('/auth/me');
    setUser(me);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = authSession.isAuthenticated;
  const isAdmin = authSession.roles.includes('Admin');

  return (
    <AuthContext.Provider value={{ authSession, isAuthenticated, isLoading, refreshAuthSession, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
