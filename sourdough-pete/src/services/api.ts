// API client configuration and base functions
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseURL: string;
  private authToken?: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // GET request
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST request
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Game Management API
export const gameApi = {
  // Cases
  getCases: () => apiClient.get('/cases'),
  getCase: (id: string) => apiClient.get(`/cases/${id}`),
  createCase: (data: any) => apiClient.post('/cases', data),
  updateCase: (id: string, data: any) => apiClient.put(`/cases/${id}`, data),
  deleteCase: (id: string) => apiClient.delete(`/cases/${id}`),

  // Game Sessions
  createSession: (data: any) => apiClient.post('/sessions', data),
  getSession: (id: string) => apiClient.get(`/sessions/${id}`),
  advanceRound: (id: string) => apiClient.post(`/sessions/${id}/round`),
  submitWarrant: (id: string, data: any) => apiClient.post(`/sessions/${id}/warrant`, data),

  // Villains
  getVillains: () => apiClient.get('/villains'),
  createVillain: (data: any) => apiClient.post('/villains', data),
  updateVillain: (id: string, data: any) => apiClient.put(`/villains/${id}`, data),
  reviewVillain: (id: string, data: any) => apiClient.put(`/villains/${id}/review`, data),
};

export default apiClient;