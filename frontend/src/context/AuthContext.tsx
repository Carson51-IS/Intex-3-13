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
import { getAccountPreferences, saveAccountPreferences } from '../lib/accountPreferences';

export interface AuthUser {
  userId: string | null;
  email: string;
  userName: string | null;
  phoneNumber: string | null;
  currencyPreference: 'PHP' | 'USD';
  profileImageUrl: string | null;
  roles: string[];
}

interface AuthContextValue {
  authSession: AuthSession | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isDonor: boolean;
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
  userId: null,
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
      if (session.isAuthenticated && session.email) {
        const fallbackName = session.userName?.trim() || session.email.split('@')[0] || session.email;
        const existing = getAccountPreferences(session.email, fallbackName);
        saveAccountPreferences(session.email, {
          displayName: fallbackName || existing.displayName,
          phone: session.phoneNumber ?? existing.phone,
          currency: session.currencyPreference === 'USD' ? 'USD' : 'PHP',
          // Preserve existing image until server returns one.
          profileImageDataUrl: session.profileImageUrl?.trim() || existing.profileImageDataUrl || '',
        });
      }
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
    let cancelled = false;
    const run = async () => {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        if (params.get('externalLogin') === '1') {
          localStorage.removeItem('token');
          params.delete('externalLogin');
          const qs = params.toString();
          const newUrl = `${window.location.pathname}${qs ? `?${qs}` : ''}${window.location.hash}`;
          window.history.replaceState({}, '', newUrl);
        }
      }
      if (!cancelled) await refreshAuthSession();
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [refreshAuthSession]);

  const user = useMemo((): AuthUser | null => {
    if (!authSession?.isAuthenticated) return null;
    const email = authSession.email ?? authSession.userName ?? '';
    if (!email) return null;
    return {
      userId: authSession.userId ?? null,
      email,
      userName: authSession.userName,
      phoneNumber: authSession.phoneNumber ?? null,
      currencyPreference: authSession.currencyPreference === 'USD' ? 'USD' : 'PHP',
      profileImageUrl: authSession.profileImageUrl ?? null,
      roles: authSession.roles,
    };
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
        isDonor,
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
