const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api';

let accessToken: string | null = localStorage.getItem('accessToken');

export function setAccessToken(token: string) {
  accessToken = token;
  localStorage.setItem('accessToken', token);
}

export function clearAccessToken() {
  accessToken = null;
  localStorage.removeItem('accessToken');
}

export function getAccessToken(): string | null {
  return accessToken;
}

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add Authorization header if we have a token
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // Include cookies for refresh token
  });

  // If we get 401, try to refresh the token
  if (response.status === 401 && accessToken) {
    try {
      const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (refreshResponse.ok) {
        const { accessToken: newToken } = await refreshResponse.json();
        setAccessToken(newToken);

        // Retry the original request with new token
        headers['Authorization'] = `Bearer ${newToken}`;
        response = await fetch(`${API_URL}${endpoint}`, {
          ...options,
          headers,
          credentials: 'include',
        });
      } else {
        // Refresh failed, clear token and redirect to login
        clearAccessToken();
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      }
    } catch (error) {
      clearAccessToken();
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || error.message || 'Request failed');
  }

  return response.json();
}

export const api = {
  auth: {
    signup: async (email: string, password: string) => {
      const data = await fetchAPI('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setAccessToken(data.accessToken);
      return data;
    },
    
    login: async (email: string, password: string) => {
      const data = await fetchAPI('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setAccessToken(data.accessToken);
      return data;
    },
    
    logout: async () => {
      await fetchAPI('/auth/logout', {
        method: 'POST',
      });
      clearAccessToken();
    },
    
    me: () => fetchAPI('/auth/me'),
    
    verifyEmail: (token: string) =>
      fetchAPI('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ token }),
      }),
    
    resendVerification: () =>
      fetchAPI('/auth/resend-verification', {
        method: 'POST',
      }),
    
    forgotPassword: (email: string) =>
      fetchAPI('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
    
    resetPassword: (token: string, newPassword: string) =>
      fetchAPI('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
      }),
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
  
  billing: {
    getUsage: () => fetchAPI('/billing/usage'),
    
    createCheckoutSession: () =>
      fetchAPI('/billing/create-checkout-session', {
        method: 'POST',
      }),
    
    createPortalSession: () =>
      fetchAPI('/billing/create-portal-session', {
        method: 'POST',
      }),
    
    getSubscription: () => fetchAPI('/billing/subscription'),
  },
};
