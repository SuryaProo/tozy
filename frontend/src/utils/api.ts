/**
 * Central API client.
 *
 * Reads the backend URL from REACT_APP_API_URL (set in .env).
 * `credentials: 'include'` is critical — it makes the browser send/receive
 * the httpOnly auth cookie set by the backend.
 */

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  [key: string]: any;
}

async function request<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
    });
  } catch (err) {
    return { success: false, message: 'Cannot reach server. Is the backend running?' };
  }

  const data = await res.json().catch(() => ({ success: false, message: 'Invalid server response.' }));

  if (!res.ok) {
    return { ...data, success: false };
  }
  return data;
}

export const api = {
  get:    <T = any>(path: string) => request<T>(path, { method: 'GET' }),
  post:   <T = any>(path: string, body?: any) => request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put:    <T = any>(path: string, body?: any) => request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T = any>(path: string) => request<T>(path, { method: 'DELETE' }),
};

export { API_BASE };
