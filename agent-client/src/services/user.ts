import api from './api';
import type { User } from '../types';

export interface UpdateProfileData {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

export const userService = {
  async getCurrentUser(): Promise<User> {
    const response = await api.get<{ status: string; data: { user: User } }>('/users/me');
    return response.data.data.user;
  },

  async updateProfile(data: UpdateProfileData): Promise<User> {
    const response = await api.put<{ status: string; data: { user: User } }>('/users/me', data);
    return response.data.data.user;
  }
}; 