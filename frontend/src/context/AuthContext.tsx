import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { getAuthSession, loginUser } from '../lib/AuthAPI';
import type { AuthSession } from '../types/AuthSession';

export interface AuthUser {
  email: string;
  roles: string[];
  hasGoogle: boolean;
}

interface AuthContextValue {
  authSession: AuthSession | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (
    email: string,
    password: string,
    twoFactorCode?: string,
    recoveryCode?: string,
  ) => Promise<AuthSession>;
  logout: () => void;
  refreshAuthSession: () => Promise<AuthSession>;
}

const anonymousAuthSession: AuthSession = {
  isAuthenticated: false,
  userName: null,
  email: null,
  roles: [],
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authSession, setAuthSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshAuthSession = useCallback(async (): Promise<AuthSession> => {
    try {
      const session = await getAuthSession();
      setAuthSession(session);
      return session;
    } catch {
      setAuthSession(anonymousAuthSession);
      return anonymousAuthSession;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(
    async (
      email: string,
      password: string,
      twoFactorCode?: string,
      recoveryCode?: string,
    ): Promise<AuthSession> => {
      await loginUser(email, password, false, twoFactorCode, recoveryCode);
      return refreshAuthSession();
    },
    [refreshAuthSession],
  );

  const logout = useCallback(() => {
    setAuthSession(anonymousAuthSession);
  }, []);

  useEffect(() => {
    void refreshAuthSession();
  }, [refreshAuthSession]);

  const user = useMemo((): AuthUser | null => {
    if (!authSession?.isAuthenticated) return null;
    const email = authSession.email ?? authSession.userName ?? '';
    if (!email) return null;
    return { email, roles: authSession.roles };
  }, [authSession]);

  const isAdmin = user?.roles.includes('Admin') ?? false;
  const isDonor = user?.roles.includes('Donor') ?? false;

  return (
    <AuthContext.Provider
      value={{
        authSession,
        user,
        isAuthenticated: authSession?.isAuthenticated ?? false,
        isAdmin,
        isLoading,
        login,
        logout,
        refreshAuthSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/** Hook lives next to provider; Fast Refresh keeps both in sync. */
// eslint-disable-next-line react-refresh/only-export-components -- useAuth is the public API for this module
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
