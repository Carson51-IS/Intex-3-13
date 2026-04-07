import type { AuthSession } from '../types/AuthSession';
import { getApiBase } from '../api/client';
import type { TwoFactorStatus } from '../types/TwoFactorStatus';

export interface ExternalAuthProvider{
  name: string;
  displayName: string;
}

function apiUrl(path: string): string {
  const base = getApiBase();
  if (!base) {
    throw new Error(
      'API URL is not configured. In dev, use the Vite proxy (default). In production, set VITE_API_URL (e.g. https://your-api.azurewebsites.net/api).',
    );
  }

  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${base}${suffix}`;
}

async function readApiError(
  res: Response,
  fallbackMessage: string,
): Promise<string> {
  const contentType = res.headers.get('content-type') ?? '';
  const isJsonLike =
    contentType.includes('application/json') || contentType.includes('+json');
  if (!isJsonLike) {
    return fallbackMessage;
  }

  try {
    const data = (await res.json()) as Record<string, unknown>;

    if (typeof data.detail === 'string' && data.detail.length > 0) {
      return data.detail;
    }
    if (typeof data.title === 'string' && data.title.length > 0) {
      return data.title;
    }
    if (typeof data.message === 'string' && data.message.length > 0) {
      return data.message;
    }
    if (data.errors && typeof data.errors === 'object') {
      const firstError = Object.values(data.errors as Record<string, unknown>)
        .flat()
        .find((value): value is string => typeof value === 'string');
      if (firstError) {
        return firstError;
      }
    }
  } catch {
    // ignore parse errors
  }

  return fallbackMessage;
}

async function postTwoFactorRequest(payload: object): Promise<TwoFactorStatus> {
  const stored = localStorage.getItem('token');
  const response = await fetch(apiUrl('/auth/manage/2fa'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(stored ? { Authorization: `Bearer ${stored}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      await readApiError(response, 'Failed to post two-factor request')
    );
  }

  return response.json();
}

function readAccessTokenFromJson(body: unknown): string | null {
  if (body === null || typeof body !== 'object') {
    return null;
  }
  const o = body as Record<string, unknown>;
  // Identity BearerToken uses OAuth-style names (access_token); some hosts serialize camelCase (accessToken).
  const camel = o.accessToken;
  if (typeof camel === 'string' && camel.length > 0) {
    return camel;
  }
  const snake = o.access_token;
  if (typeof snake === 'string' && snake.length > 0) {
    return snake;
  }
  return null;
}

function toStringOrNull(value: unknown): string | null {
  if (value === null) return null;
  if (typeof value === 'string') return value;
  return null;
}

function parseAuthSessionPayload(body: unknown): AuthSession {
  if (body === null || typeof body !== 'object') {
    throw new Error('Invalid auth session payload');
  }
  const o = body as Record<string, unknown>;
  const isAuthenticated = o.isAuthenticated === true;
  const userName = toStringOrNull(o.userName);
  const email = toStringOrNull(o.email);
  const roles = Array.isArray(o.roles) ? o.roles.filter((r): r is string => typeof r === 'string') : [];
  return { isAuthenticated, userName, email, roles };
}

export async function getAuthSession(): Promise<AuthSession> {
  const stored = localStorage.getItem('token');
  const sessionRes = await fetch(apiUrl('/auth/me'), {
    headers: stored ? { Authorization: `Bearer ${stored}` } : undefined,
  });

  if (!sessionRes.ok) {
    throw new Error(await readApiError(sessionRes, 'Failed to get auth session'));
  }

  const sessionJson: unknown = await sessionRes.json();
  return parseAuthSessionPayload(sessionJson);
}

export async function registerUser(email: string, password: string): Promise<void> {
  const registerBody = JSON.stringify({ email, password });
  const registerRes = await fetch(apiUrl('/auth/register'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: registerBody,
  });

  if (!registerRes.ok) {
    throw new Error(await readApiError(registerRes, 'Failed to register user'));
  }
}

export async function logoutUser(): Promise<void> {
  localStorage.removeItem('token');
}

export async function getTwoFactorStatus(): Promise<TwoFactorStatus> {
  return postTwoFactorRequest({});
}

export async function enableTwoFactor(
  twoFactorCode: string
): Promise<TwoFactorStatus> {
  return postTwoFactorRequest({
    enable : true,
    twoFactorCode,
    resetRecoveryCodes : true,
  });
}

export async function disableTwoFactor(): Promise<TwoFactorStatus> {
  return postTwoFactorRequest({
    enable : false,
  });
}

export async function resetRecoveryCodes(): Promise<TwoFactorStatus> {
  return postTwoFactorRequest({
    resetRecoveryCodes : true,
  });
}

export async function loginUser(
  email: string,
  password: string,
  rememberMe: boolean,
  twoFactorCode?:string,
  twoFactorRecoveryCode?:string,
): Promise<void> {
  const searchParams = new URLSearchParams();
  searchParams.set('useCookies', 'false');
  searchParams.set('useSessionCookies', rememberMe ? 'true' : 'false');

  const loginBody: {
    email: string;
    password: string;
    twoFactorCode?: string;
    twoFactorRecoveryCode?: string;
  } = { email, password };

  if (twoFactorCode) {
    loginBody.twoFactorCode = twoFactorCode;
  }

  if (twoFactorRecoveryCode) {
    loginBody.twoFactorRecoveryCode = twoFactorRecoveryCode;
  }

  const loginRes = await fetch(
    `${apiUrl('/auth/login')}?${searchParams.toString()}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginBody),
    },
  );

  if (!loginRes.ok) {
    throw new Error(await readApiError(loginRes, 'Failed to login user'));
  }

  const loginJson: unknown = await loginRes.json().catch(() => null);
  const accessToken = readAccessTokenFromJson(loginJson);
  if (!accessToken) {
    throw new Error('Login succeeded but no access token was returned');
  }

  localStorage.setItem('token', accessToken);
}

export function buildExternalLoginUrl(
  provider: string,
  returnPath: '/catalog'
) : string {
  const searchParams = new URLSearchParams({
    provider,
    returnPath,
  });

  return `${apiUrl('/auth/external-login')}?${searchParams.toString()}`;
}

export async function getExternalAuthProviders(): Promise<ExternalAuthProvider[]> {
  const response = await fetch(apiUrl('/auth/providers'), {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(
      await readApiError(response, 'Failed to get external auth providers')
    );
  }

  return response.json();
}

export async function externalLogin(
  provider: string,
  returnPath: '/catalog'
) : Promise<void> {
  const url = buildExternalLoginUrl(provider, returnPath);
  window.location.href = url;
}