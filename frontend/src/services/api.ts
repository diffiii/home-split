import axios from 'axios';
import { AuthTokens, LoginCredentials, RegisterData, User, Household, Membership, RawMembership } from '../types';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('access_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = sessionStorage.getItem('refresh_token');

        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });
          const { access } = response.data;
          sessionStorage.setItem('access_token', access);
          originalRequest.headers.Authorization = `Bearer ${access}`;

          return api(originalRequest);
        }

      } catch (refreshError) {
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
        window.location.href = '/';
      }
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthTokens> => {
    const response = await api.post('/auth/token/', credentials);
    return response.data;
  },

  register: async (data: RegisterData): Promise<User> => {
    const response = await api.post('/users/', data);
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/users/detail/');
    return response.data;
  },
};

export const userAPI = {
  getUser: async (userId: number): Promise<User | null> => {
    try {
      const response = await api.get('/users/');
      const users = response.data;
      return users.find((user: User) => user.id === userId) || null;
    } catch (error) {
      return null;
    }
  },

  updateProfile: async (data: Partial<User & { current_password?: string; password?: string }>): Promise<User> => {
    const response = await api.patch('/users/detail/', data);
    return response.data;
  },

  uploadProfilePicture: async (file: File): Promise<User> => {
    const formData = new FormData();
    formData.append('profile_picture', file);
    
    const response = await api.patch('/users/detail/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  removeProfilePicture: async (): Promise<User> => {
    const response = await api.patch('/users/detail/', {
      profile_picture: null,
    });
    return response.data;
  },

  validateCurrentPassword: async (currentPassword: string): Promise<boolean> => {
    try {
      const user = await authAPI.getCurrentUser();
      const response = await api.post('/auth/token/', {
        email: user.email,
        password: currentPassword,
      });
      return !!response.data.access;
    } catch (error) {
      return false;
    }
  },
};

export const householdAPI = {
  getHouseholds: async (): Promise<Household[]> => {
    const response = await api.get('/households/');
    return response.data;
  },

  createHousehold: async (data: { name: string; description?: string }): Promise<Household> => {
    const response = await api.post('/households/', data);
    return response.data;
  },

  getHousehold: async (id: number): Promise<Household> => {
    const response = await api.get(`/households/${id}/`);
    return response.data;
  },
};

export const membershipAPI = {
  getMemberships: async (): Promise<RawMembership[]> => {
    const response = await api.get('/memberships/');
    return response.data;
  },

  inviteUser: async (householdId: number, userEmail: string): Promise<RawMembership> => {
    const userResponse = await api.get('/users/');
    const users = userResponse.data;
    
    const user = users.find((u: User) => u.email.toLowerCase() === userEmail.toLowerCase());
    
    if (!user) {
      throw new Error('User not found');
    }
    
    const response = await api.post('/memberships/', {
      user: user.id,
      household: householdId,
      is_active: false
    });

    return response.data;
  },

  acceptInvitation: async (membershipId: number): Promise<RawMembership> => {
    const response = await api.patch(`/memberships/${membershipId}/`, {
      is_active: true
    });
    return response.data;
  },

  declineInvitation: async (membershipId: number): Promise<void> => {
    await api.delete(`/memberships/${membershipId}/`);
  },

  removeMember: async (membershipId: number): Promise<void> => {
    await api.delete(`/memberships/${membershipId}/`);
  },
};

export default api;
