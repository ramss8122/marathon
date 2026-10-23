/**
 * adminFetch.js
 * Authenticated HTTP request helper for admin endpoints.
 * Automatically injects the 'Authorization: Bearer <token>' header from localStorage.
 * On 401 or 403 responses, removes adminToken and adminUser from localStorage and redirects to /admin/login.
 */
export async function adminFetch(url, options = {}) {
  const token = localStorage.getItem('adminToken');

  const headers = {
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const finalOptions = {
    ...options,
    headers
  };

  const response = await fetch(url, finalOptions);

  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/admin/login')) {
      window.location.href = '/admin/login';
    }
  }

  return response;
}

export default adminFetch;
