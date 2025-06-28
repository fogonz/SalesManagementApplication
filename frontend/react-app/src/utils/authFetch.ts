// authFetch.ts: fetch wrapper que agrega el token JWT automáticamente y refresca si es necesario

const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://salesmanagementapplication-production.up.railway.app/api';

async function refreshToken() {
  const refresh = localStorage.getItem('refresh');
  if (!refresh) return null;
  const res = await fetch(`${API_URL}/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh })
  });
  if (res.ok) {
    const data = await res.json();
    localStorage.setItem('access', data.access);
    return data.access;
  } else {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    return null;
  }
}

export async function authFetch(input: RequestInfo, init: RequestInit = {}) {
  let access = localStorage.getItem('access');
  if (!init.headers) init.headers = {};
  (init.headers as any)['Authorization'] = `Bearer ${access}`;
  let res = await fetch(input, init);
  if (res.status === 401) {
    // Intentar refrescar token
    access = await refreshToken();
    if (access) {
      (init.headers as any)['Authorization'] = `Bearer ${access}`;
      res = await fetch(input, init);
    }
  }
  return res;
}
