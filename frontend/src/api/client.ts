/**
 * Base URL including `/api` (e.g. https://your-api.azurewebsites.net/api).
 * In dev, defaults to same-origin `/api` so Vite proxies to the backend (see vite.config.ts) — avoids wrong ports and HTTPS cert issues.
 * Set `VITE_API_URL` to override (e.g. point at Azure while running the Vite dev server).
 */
export function getApiBase(): string {
  const raw = import.meta.env.VITE_API_URL?.trim();
  if (raw) return raw.replace(/\/$/, '');
  if (import.meta.env.DEV) return '/api';
  return '';
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const API_BASE = getApiBase();
  if (!API_BASE) {
    throw new Error(
      'API URL is not configured. In Vercel → Settings → Environment Variables, set VITE_API_URL to your Azure API (e.g. https://havenlight-api-intex3-13.azurewebsites.net/api), then redeploy.'
    );
  }

  const token = localStorage.getItem('token');
  const url = `${API_BASE}${path}`;

  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch (e) {
    const isNetwork =
      e instanceof TypeError && (e.message === 'Failed to fetch' || e.name === 'TypeError');
    if (isNetwork) {
      throw new Error(
        `Cannot reach the API at ${url}. Check: (1) VITE_API_URL on Vercel matches your Azure URL and you redeployed after setting it; (2) Azure app setting Cors__AllowedOrigins includes your exact Vercel origin (https://intex-3-13.vercel.app); (3) the API is running.`
      );
    }
    throw e;
  }

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as Record<string, unknown> | null;
    const msgFromErrors =
      body?.errors && typeof body.errors === 'object'
        ? Object.entries(body.errors as Record<string, string[] | string>)
            .flatMap(([k, v]) => (Array.isArray(v) ? v.map((x) => `${k}: ${x}`) : [`${k}: ${v}`]))
            .join(' ')
        : '';
    const message =
      (typeof body?.message === 'string' && body.message) ||
      (typeof body?.title === 'string' && body.title && msgFromErrors ? `${body.title} — ${msgFromErrors}` : '') ||
      (typeof body?.title === 'string' && body.title) ||
      msgFromErrors ||
      `Request failed: ${res.status}`;
    throw new Error(message);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),

  post: <T>(path: string, data: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(data) }),

  put: <T>(path: string, data: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(data) }),

  delete: <T>(path: string) =>
    request<T>(path, { method: 'DELETE' }),
};
