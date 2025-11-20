import api from './api';

export const authService = {
  register: async (username, email, password) => {
    const response = await api.post('/auth/register', { username, email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  login: async (usernameOrEmail, password) => {
    const response = await api.post('/auth/login', { usernameOrEmail, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data.user;
  },

  changePassword: async (oldPassword, newPassword) => {
    const response = await api.post('/auth/change-password', { oldPassword, newPassword });
    return response.data;
  },
};

export const forumService = {
  getForums: async () => {
    const response = await api.get('/forums');
    return response.data.categories;
  },

  getForum: async (categorySlug, forumSlug, page = 1) => {
    const response = await api.get(`/forums/${categorySlug}/${forumSlug}?page=${page}`);
    return response.data;
  },
};

export const topicService = {
  getTopic: async (topicId, page = 1) => {
    const response = await api.get(`/topics/${topicId}?page=${page}`);
    return response.data;
  },

  createTopic: async (forumId, title, content) => {
    const response = await api.post('/topics', { forumId, title, content });
    return response.data;
  },

  updateTopic: async (topicId, title) => {
    const response = await api.put(`/topics/${topicId}`, { title });
    return response.data;
  },

  deleteTopic: async (topicId) => {
    const response = await api.delete(`/topics/${topicId}`);
    return response.data;
  },

  togglePin: async (topicId) => {
    const response = await api.post(`/topics/${topicId}/pin`);
    return response.data;
  },

  toggleLock: async (topicId) => {
    const response = await api.post(`/topics/${topicId}/lock`);
    return response.data;
  },
};

export const postService = {
  createPost: async (topicId, content) => {
    const response = await api.post('/posts', { topicId, content });
    return response.data;
  },

  updatePost: async (postId, content) => {
    const response = await api.put(`/posts/${postId}`, { content });
    return response.data;
  },

  deletePost: async (postId) => {
    const response = await api.delete(`/posts/${postId}`);
    return response.data;
  },

  addReaction: async (postId, reactionType = 'like') => {
    const response = await api.post(`/posts/${postId}/reactions`, { reactionType });
    return response.data;
  },

  removeReaction: async (postId, reactionType = 'like') => {
    const response = await api.delete(`/posts/${postId}/reactions`, { data: { reactionType } });
    return response.data;
  },
};

export const userService = {
  getProfile: async (username) => {
    const response = await api.get(`/users/${username}`);
    return response.data.user;
  },

  updateProfile: async (bio, avatarUrl) => {
    const response = await api.put('/users/profile', { bio, avatar_url: avatarUrl });
    return response.data;
  },

  getUsers: async (page = 1) => {
    const response = await api.get(`/users?page=${page}`);
    return response.data;
  },

  updateUserRole: async (userId, role) => {
    const response = await api.put(`/users/${userId}/role`, { role });
    return response.data;
  },

  toggleUserActive: async (userId) => {
    const response = await api.post(`/users/${userId}/toggle-active`);
    return response.data;
  },
};
