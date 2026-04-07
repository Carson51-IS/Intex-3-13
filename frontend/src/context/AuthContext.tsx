import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { api } from '../api/client';

interface User {
  username: string;
  email: string | null;
  roles: string[];
  hasGoogle: boolean;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isDonor: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

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

  const saveToken = async (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    const me = await api.get<User>('/auth/me');
    setUser(me);
  };

  const login = async (identifier: string, password: string) => {
    const { token: newToken } = await api.post<{ token: string }>('/auth/login', { identifier, password });
    await saveToken(newToken);
  };

  const loginWithGoogle = async (idToken: string) => {
    const { token: newToken } = await api.post<{ token: string }>('/auth/google', { idToken });
    await saveToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const isAdmin = user?.roles.includes('Admin') ?? false;
  const isDonor = user?.roles.includes('Donor') ?? false;

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, loginWithGoogle, logout, isAdmin, isDonor }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
