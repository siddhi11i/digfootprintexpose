// Central configuration for API URL resolution
// If deployed as a unified full-stack service or proxy, API_BASE will default to '' (relative path /api)
// If frontend is deployed separately (e.g. Vercel) from backend (e.g. Render), set VITE_API_URL in env
export const API_BASE = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
