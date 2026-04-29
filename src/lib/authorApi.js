const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper function to get token from multiple possible locations
const getToken = () => {
  // Check localStorage
  const localStorageToken = localStorage.getItem('token');
  if (localStorageToken) return localStorageToken;
  
  // Check sessionStorage
  const sessionToken = sessionStorage.getItem('token');
  if (sessionToken) return sessionToken;
  
  // Check your auth store's token if available
  try {
    // Try to get from authStore if it's persisted
    const authStoreData = localStorage.getItem('auth-storage');
    if (authStoreData) {
      const parsed = JSON.parse(authStoreData);
      if (parsed.state?.token) return parsed.state.token;
      if (parsed.state?.user?.token) return parsed.state.user.token;
    }
  } catch (e) {
    console.error('Error parsing auth store:', e);
  }
  
  return null;
};

const getAuthHeaders = () => {
  const token = getToken();
  console.log('Token being sent:', token ? 'Present (length: ' + token.length + ')' : 'Missing'); // Debug log
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    if (response.status === 401) {
      // Clear all possible token locations
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      localStorage.removeItem('auth-storage');
      
      // Dispatch logout event
      window.dispatchEvent(new Event('auth-logout'));
      
      // Optional: Redirect to login page
      window.location.href = '/login';
    }
    const error = new Error(data.message || 'Request failed');
    error.status = response.status;
    throw error;
  }
  
  return data;
};

const authorApi = {
  getAllAuthors: async () => {
    const response = await fetch(`${API_BASE_URL}/authors`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await handleResponse(response);
    return data.data || data;
  },

  getAuthorById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/authors/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await handleResponse(response);
    return data.data;
  },

  createAuthor: async (authorData) => {
    const response = await fetch(`${API_BASE_URL}/authors`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(authorData),
    });
    const data = await handleResponse(response);
    return data.data;
  },

  updateAuthor: async (id, authorData) => {
    const response = await fetch(`${API_BASE_URL}/authors/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(authorData),
    });
    const data = await handleResponse(response);
    return data.data;
  },

  deleteAuthor: async (id) => {
    const response = await fetch(`${API_BASE_URL}/authors/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await handleResponse(response);
    return data;
  },

  getAuthorsByStatus: async (status) => {
    const response = await fetch(`${API_BASE_URL}/authors/status/${status}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await handleResponse(response);
    return data.data;
  },
};

export default authorApi;