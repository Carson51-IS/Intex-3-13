import type { AuthUser, LoginResult, RegisterResponse } from '../types/authSession';
import type { TwoFactorStatus } from '../types/twoFactorStatus';

const API_BASE = import.meta.env.VITE_API_URL ?? 'https://localhost:5001/api';

async function readApiError(res: Response): Promise<string> {
  const fallback = `Request failed: ${res.status}`;
  const body = await res.json().catch(() => null);

  if (!body || typeof body !== 'object') return fallback;
  if (typeof body.message === 'string' && body.message.trim().length > 0) return body.message;
  if (Array.isArray(body.errors) && body.errors.length > 0) {
    return body.errors.map((err: unknown) => String(err)).join(' ');
  }

  return fallback;
}

async function authRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    throw new Error(await readApiError(res));
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export function registerUser(email: string, password: string): Promise<RegisterResponse> {
  return authRequest<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function loginUser(
  email: string,
  password: string,
  rememberMe: boolean,
  twoFactorCode?: string,
  twoFactorRecoveryCode?: string,
): Promise<LoginResult> {
  const params = new URLSearchParams({ rememberMe: String(rememberMe) });
  return authRequest<LoginResult>(`/auth/login?${params.toString()}`, {
    method: 'POST',
    body: JSON.stringify({ email, password, twoFactorCode, twoFactorRecoveryCode }),
  });
}

export function logoutUser(): Promise<string> {
  return authRequest<string>('/auth/logout', {
    method: 'POST',
  });
}

export function getCurrentUser(): Promise<AuthUser> {
  return authRequest<AuthUser>('/auth/session');
}

export type ExternalProvider = {
  name: string;
  displayName: string;
};

export function getExternalProviders(): Promise<ExternalProvider[]> {
  return authRequest<ExternalProvider[]>('/auth/external/providers');
}

export function getExternalLoginUrl(provider: string, returnUrl = '/'): string {
  const params = new URLSearchParams({ returnUrl });
  return `${API_BASE}/auth/external/login/${encodeURIComponent(provider)}?${params.toString()}`;
}

export function getTwoFactorStatus(): Promise<TwoFactorStatus> {
  return authRequest<TwoFactorStatus>('/auth/2fa');
}

export function enableTwoFactor(code: string): Promise<{ recoveryCodes: string[]; recoveryCodesLeft: number }> {
  return authRequest<{ recoveryCodes: string[]; recoveryCodesLeft: number }>('/auth/2fa/enable', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
}

export function disableTwoFactor(): Promise<{ message: string }> {
  return authRequest<{ message: string }>('/auth/2fa/disable', {
    method: 'POST',
  });
}

export function resetRecoveryCodes(): Promise<{ recoveryCodes: string[]; recoveryCodesLeft: number }> {
  return authRequest<{ recoveryCodes: string[]; recoveryCodesLeft: number }>('/auth/2fa/recovery-codes', {
    method: 'POST',
  });
}