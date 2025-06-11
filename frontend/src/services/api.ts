import axios from 'axios';
import {
  AuthTokens,
  LoginCredentials,
  RegisterData,
  User,
  Household,
  Membership,
  RawMembership,
  Expense,
  CreateExpenseData,
  ExpenseCategory,
  Task,
  CreateTaskData,
  ExpenseSummary,
  HouseholdExpenseSummary
} from '../types';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(config => {
  const token = sessionStorage.getItem('access_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = sessionStorage.getItem('refresh_token');

        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken
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
  }
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

  updateProfile: async (
    data: Partial<User & { current_password?: string; password?: string }>
  ): Promise<User> => {
    const response = await api.patch('/users/detail/', data);
    return response.data;
  },

  uploadProfilePicture: async (file: File): Promise<User> => {
    const formData = new FormData();
    formData.append('profile_picture', file);

    const response = await api.patch('/users/detail/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  removeProfilePicture: async (): Promise<User> => {
    const response = await api.patch('/users/detail/', {
      profile_picture: null
    });
    return response.data;
  },

  validateCurrentPassword: async (currentPassword: string): Promise<boolean> => {
    try {
      const user = await authAPI.getCurrentUser();
      const response = await api.post('/auth/token/', {
        email: user.email,
        password: currentPassword
      });
      return !!response.data.access;
    } catch (error) {
      return false;
    }
  }
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

  updateHousehold: async (
    id: number,
    data: { name?: string; description?: string }
  ): Promise<Household> => {
    const response = await api.patch(`/households/${id}/`, data);
    return response.data;
  },

  deleteHousehold: async (id: number): Promise<void> => {
    await api.delete(`/households/${id}/`);
  }
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
  }
};

export const expenseAPI = {
  getExpenses: async (householdId: number): Promise<Expense[]> => {
    const response = await api.get(`/expenses/?household_id=${householdId}`);
    const expenses = response.data;

    const expensesWithSplits = await Promise.all(
      expenses.map(async (expense: Expense) => {
        try {
          const detailResponse = await api.get(`/expenses/${expense.id}/`);
          return detailResponse.data;
        } catch (error) {
          return expense;
        }
      })
    );

    return expensesWithSplits;
  },

  createExpense: async (data: CreateExpenseData): Promise<Expense> => {
    const response = await api.post('/expenses/', data);
    return response.data;
  },

  updateExpense: async (
    expenseId: number,
    data: { category_id?: number | null }
  ): Promise<Expense> => {
    const response = await api.patch(`/expenses/${expenseId}/`, data);
    return response.data;
  },

  getHouseholdCategories: async (householdId: number): Promise<ExpenseCategory[]> => {
    const response = await api.get(`/households/${householdId}/categories/`);
    return response.data;
  },

  createExpenseCategory: async (data: {
    household_id: number;
    name: string;
    icon: string;
  }): Promise<ExpenseCategory> => {
    const response = await api.post('/categories/', data);
    return response.data;
  },

  deleteExpenseCategory: async (categoryId: number): Promise<void> => {
    await api.delete(`/categories/${categoryId}/`);
  },

  getUserExpenseSummary: async (): Promise<ExpenseSummary> => {
    const response = await api.get('/expenses/summary/');
    return response.data;
  },

  getHouseholdExpenseSummary: async (householdId: number): Promise<HouseholdExpenseSummary> => {
    const response = await api.get(`/households/${householdId}/expenses/summary/`);
    return response.data;
  }
};

export const taskAPI = {
  getTasks: async (householdId: number): Promise<Task[]> => {
    const response = await api.get(`/households/${householdId}/tasks/`);
    return response.data;
  },

  createTask: async (householdId: number, data: CreateTaskData): Promise<Task> => {
    const response = await api.post(`/households/${householdId}/tasks/`, data);
    return response.data;
  },

  updateTask: async (taskId: number, data: Partial<CreateTaskData>): Promise<Task> => {
    const response = await api.patch(`/tasks/${taskId}/`, data);
    return response.data;
  },

  deleteTask: async (taskId: number): Promise<void> => {
    await api.delete(`/tasks/${taskId}/`);
  }
};

export default api;
