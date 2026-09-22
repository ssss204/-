// Resolve public/ assets with the platform app-root base path (see hosting protocol).
const APP_BASE = (import.meta.env.MIAODA_CLIENT_BASE_PATH || '').replace(/\/$/, '');

export function asset(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${APP_BASE}${normalized}`;
}
