// ZYNTRA API SERVICE LAYER (Client <-> Backend)
// Built with graceful offline fallbacks so the frontend NEVER crashes if backend is starting or offline.

const API_BASE = import.meta.env?.VITE_API_URL || 'http://localhost:5000/api';
export const SERVER_URL = import.meta.env?.VITE_SERVER_URL || 'http://localhost:5000';

export const getFileUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  return `${SERVER_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

// Helper for making requests with auth token
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('zyntra_auth_token');
  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  } catch (error) {
    // Graceful network error fallback
    console.warn(`[Zyntra API] Offline or unreachable endpoint (${endpoint}):`, error.message);
    return { ok: false, error: error.message, isOffline: true };
  }
}

export const api = {
  // Authentication
  auth: {
    login: async (email, password) => {
      const res = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (res.ok && res.data?.token) {
        localStorage.setItem('zyntra_auth_token', res.data.token);
      }
      return res;
    },
    register: async (userData) => {
      const res = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      if (res.ok && res.data?.token) {
        localStorage.setItem('zyntra_auth_token', res.data.token);
      }
      return res;
    },
    getMe: () => request('/auth/me'),
    updateProfile: (data) =>
      request('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    addContext: (context) =>
      request('/auth/context', {
        method: 'POST',
        body: JSON.stringify(context),
      }),
    logout: () => {
      localStorage.removeItem('zyntra_auth_token');
    },
  },

  // Workspaces
  workspaces: {
    getAll: () => request('/workspaces'),
    getNodes: () => request('/workspaces/nodes'),
    getTree: (wsId) => request(`/workspaces/${wsId}/tree`),
    create: (data) =>
      request('/workspaces', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    createGroup: (wsId, data) =>
      request(`/workspaces/${wsId}/nodes`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    joinByCode: (code) =>
      request('/workspaces/join', {
        method: 'POST',
        body: JSON.stringify({ code }),
      }),
    leaveParentGroup: (groupId) =>
      request('/workspaces/leave-parent-group', {
        method: 'POST',
        body: JSON.stringify({ groupId }),
      }),
    addMembers: (wsId, nodeId, members) =>
      request(`/workspaces/${wsId}/nodes/${nodeId}/members`, {
        method: 'POST',
        body: JSON.stringify({ members }),
      }),
  },

  // Messages
  messages: {
    getByChat: (chatId) => request(`/messages/${chatId}`),
    send: (chatId, messageData) =>
      request(`/messages/${chatId}`, {
        method: 'POST',
        body: JSON.stringify(messageData),
      }),
    edit: (messageId, content) =>
      request(`/messages/${messageId}`, {
        method: 'PUT',
        body: JSON.stringify({ content }),
      }),
    delete: (messageId) =>
      request(`/messages/${messageId}`, {
        method: 'DELETE',
      }),
    addReaction: (messageId, emoji, userId) =>
      request(`/messages/${messageId}/reactions`, {
        method: 'POST',
        body: JSON.stringify({ emoji, userId }),
      }),
  },

  // Contacts
  contacts: {
    getAll: () => request('/contacts'),
    search: (query) => request(`/contacts/search?q=${encodeURIComponent(query)}`),
    create: (data) =>
      request('/contacts', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    createGroup: (data) =>
      request('/contacts/groups', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // Uploads
  upload: {
    file: (file) => {
      const form = new FormData();
      form.append('file', file);
      return request('/upload', {
        method: 'POST',
        body: form,
      });
    },
  },

  // Health
  health: () => request('/health'),
  getFileUrl,
};

export default api;
