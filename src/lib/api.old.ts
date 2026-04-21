const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api';

let sessionId: string | null = localStorage.getItem('sessionId');

export function setSession(id: string) {
  sessionId = id;
  localStorage.setItem('sessionId', id);
}

export function clearSession() {
  sessionId = null;
  localStorage.removeItem('sessionId');
}

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (sessionId) {
    headers['x-session-id'] = sessionId;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // Handle 401 Unauthorized - session expired
    if (response.status === 401) {
      clearSession();
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }
    
    const error = await response.json();
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

export const api = {
  auth: {
    signup: (email: string, password: string) =>
      fetchAPI('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    login: (email: string, password: string) =>
      fetchAPI('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    me: () => fetchAPI('/auth/me'),
  },
  waitlists: {
    generate: (productName: string, shortDescription: string) =>
      fetchAPI('/waitlists/generate', {
        method: 'POST',
        body: JSON.stringify({ productName, shortDescription }),
      }),
    create: (name: string, description: string, slug: string) =>
      fetchAPI('/waitlists', {
        method: 'POST',
        body: JSON.stringify({ name, description, slug }),
      }),
    list: () => fetchAPI('/waitlists'),
    get: (slug: string) => fetchAPI(`/waitlists/${slug}`),
    update: (slug: string, data: any) =>
      fetchAPI(`/waitlists/${slug}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    signup: (slug: string, email: string) =>
      fetchAPI(`/waitlists/${slug}/signup`, {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
    getSignups: (slug: string) => fetchAPI(`/waitlists/${slug}/signups`),
    getAnalytics: (slug: string) => fetchAPI(`/waitlists/${slug}/analytics`),
  },
};
