import { getApiBase } from '../api/client';

export function resolveProfileImageSrc(url: string | null | undefined): string {
  if (url == null || typeof url !== 'string') return '';
  const u = url.trim();
  if (!u) return '';
  if (u.startsWith('data:')) return u;

  const base = getApiBase();

  if (u.startsWith('http://') || u.startsWith('https://')) {
    try {
      const parsed = new URL(u);
      if (parsed.pathname.startsWith('/profile-images/')) {
        if (base.startsWith('http')) {
          const origin = base.replace(/\/?api\/?$/i, '').replace(/\/$/, '');
          return `${origin}${parsed.pathname}${parsed.search}`;
        }
        return `${parsed.pathname}${parsed.search}`;
      }
    } catch {
      return u;
    }
    return u;
  }

  const path = u.startsWith('/') ? u : `/${u}`;
  if (!path.startsWith('/profile-images/')) return path;

  if (base.startsWith('http')) {
    const origin = base.replace(/\/?api\/?$/i, '').replace(/\/$/, '');
    return `${origin}${path}`;
  }

  return path;
}
