const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface RequestOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('cms-auth') : null;
  const parsedToken = token ? JSON.parse(token).state.token : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (parsedToken) {
    headers['Authorization'] = `Bearer ${parsedToken}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
}

export const api = {
  auth: {
    login: (data: { email: string; password: string }) =>
      request<{ user: any; token: string }>('/auth/login', { method: 'POST', body: data }),
    register: (data: { email: string; password: string; name?: string }) =>
      request<{ user: any; token: string }>('/auth/register', { method: 'POST', body: data }),
  },
  products: {
    getAll: (params?: { skip?: number; take?: number; search?: string }) => {
      const query = new URLSearchParams(params as any).toString();
      return request<{ products: any[]; total: number }>(`/products${query ? `?${query}` : ''}`);
    },
    getOne: (id: string) => request<any>(`/products/${id}`),
    create: (data: any) => request<any>('/products', { method: 'POST', body: data }),
    update: (id: string, data: any) => request<any>(`/products/${id}`, { method: 'PUT', body: data }),
    delete: (id: string) => request<any>(`/products/${id}`, { method: 'DELETE' }),
  },
  collections: {
    getAll: (params?: { skip?: number; take?: number; search?: string }) => {
      const query = new URLSearchParams(params as any).toString();
      return request<{ collections: any[]; total: number }>(`/collections${query ? `?${query}` : ''}`);
    },
    getOne: (id: string) => request<any>(`/collections/${id}`),
    create: (data: any) => request<any>('/collections', { method: 'POST', body: data }),
    update: (id: string, data: any) => request<any>(`/collections/${id}`, { method: 'PUT', body: data }),
    delete: (id: string) => request<any>(`/collections/${id}`, { method: 'DELETE' }),
  },
  orders: {
    getAll: (params?: { skip?: number; take?: number; status?: string; search?: string }) => {
      const query = new URLSearchParams(params as any).toString();
      return request<{ orders: any[]; total: number }>(`/orders${query ? `?${query}` : ''}`);
    },
    getOne: (id: string) => request<any>(`/orders/${id}`),
    getStats: () => request<any>('/orders/stats'),
    updateStatus: (id: string, status: string) =>
      request<any>(`/orders/${id}/status`, { method: 'PUT', body: { status } }),
  },
  customers: {
    getAll: (params?: { skip?: number; take?: number; search?: string }) => {
      const query = new URLSearchParams(params as any).toString();
      return request<{ customers: any[]; total: number }>(`/customers${query ? `?${query}` : ''}`);
    },
    getOne: (id: string) => request<any>(`/customers/${id}`),
    getStats: () => request<any>('/customers/stats'),
  },
  discounts: {
    getAll: () => request<any[]>('/discounts'),
    getOne: (id: string) => request<any>(`/discounts/${id}`),
    create: (data: any) => request<any>('/discounts', { method: 'POST', body: data }),
    update: (id: string, data: any) => request<any>(`/discounts/${id}`, { method: 'PUT', body: data }),
    delete: (id: string) => request<any>(`/discounts/${id}`, { method: 'DELETE' }),
    validate: (code: string, total: number) =>
      request<any>(`/discounts/validate?code=${code}&total=${total}`),
  },
  content: {
    getSections: () => request<{ sections: any[]; count: number }>('/content/sections'),
    getSection: (id: string) => request<{ section: any }>(`/content/sections/${id}`),
    createSection: (data: any) => request<any>('/content/sections', { method: 'POST', body: data }),
    updateSection: (id: string, data: any) =>
      request<any>(`/content/sections/${id}`, { method: 'PUT', body: data }),
    deleteSection: (id: string) => request<any>(`/content/sections/${id}`, { method: 'DELETE' }),
    reorderSections: (sections: { id: string; position: number }[]) =>
      request<any>('/content/sections/reorder', { method: 'POST', body: sections }),
  },
  media: {
    getAll: (params?: { skip?: number; take?: number; search?: string }) => {
      const query = new URLSearchParams(params as any).toString();
      return request<{ media: any[]; total: number }>(`/media${query ? `?${query}` : ''}`);
    },
    getOne: (id: string) => request<any>(`/media/${id}`),
    create: (data: any) => request<any>('/media', { method: 'POST', body: data }),
    update: (id: string, data: any) => request<any>(`/media/${id}`, { method: 'PUT', body: data }),
    delete: (id: string) => request<any>(`/media/${id}`, { method: 'DELETE' }),
  },
};
