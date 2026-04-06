export interface AuthUser {
  email: string;
  roles: string[];
}

export interface RegisterResponse {
  message: string;
}

export interface LoginResult {
  requiresTwoFactor: boolean;
  email?: string;
  roles?: string[];
}

export interface AuthSession {
  isAuthenticated: boolean;
  userName: string | null;
  email: string | null;
  roles: string[];
}
