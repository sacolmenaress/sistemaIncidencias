const API_URL = '/api/v1';


async function apiClient(endpoint: string, options: RequestInit = {}) {

  const token = localStorage.getItem('token');

  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const url = `${API_URL}${endpoint}`;

  const config: RequestInit = {
    ...options,
    headers,
  };

 
  const response = await fetch(url, config);


  if (!response.ok) {

    const errorData = await response.json().catch(() => ({})); 
    throw new Error(errorData.error || 'Ocurrió un error en la API');
  }

  const text = await response.text();
  return text ? JSON.parse(text) : {};
}



export const api = {
  get: (endpoint: string) => apiClient(endpoint, { method: 'GET' }),

  post: <T>(endpoint: string, data: T) => apiClient(endpoint, {
    method: 'POST',
    body: JSON.stringify(data), // fetch no convierte a JSON automáticamente
  }),
  
  put: <T>(endpoint: string, data: T) => apiClient(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  delete: (endpoint: string) => apiClient(endpoint, { method: 'DELETE' }),
};