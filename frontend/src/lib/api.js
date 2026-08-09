const BASE = '/nail';

async function api(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res;
}

export async function getDesigns() { return (await api('/api/designs')).json(); }
export async function getCategories() { return (await api('/api/categories')).json(); }
export async function getAdminDesigns() { return (await api('/api/admin/designs')).json(); }
export async function checkAdmin() { try { const r = await api('/api/admin/me'); return r.ok; } catch { return false; } }
export async function login(username, password) {
  const r = await fetch(`${BASE}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
    credentials: 'same-origin',
  });
  return r.ok;
}
export async function logout() { await api('/api/admin/logout', { method: 'POST' }); }
export async function createDesign(data) { await api('/api/admin/designs', { method: 'POST', body: data }); }
export async function updateDesign(id, data) { await api(`/api/admin/designs/${id}`, { method: 'PUT', body: data }); }
export async function deleteDesign(id) { await api(`/api/admin/designs/${id}`, { method: 'DELETE' }); }
export async function toggleDesign(id) { await api(`/api/admin/designs/${id}/toggle`, { method: 'POST' }); }
export { BASE };
