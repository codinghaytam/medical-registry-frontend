import { fetch } from '@tauri-apps/plugin-http';
import { MedecinData } from './seanceService';

const BASE_URL = 'http://localhost:3000';

export interface UserData {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  enabled: boolean;
  roles?: string[];
}

export const userService = {
  getAll: async () => {
    const response = await fetch(`${BASE_URL}/users`);
    return response.json();
  },

  create: async (data: Omit<UserData, 'id' | 'enabled'>) => {
    const response = await fetch(`${BASE_URL}/users`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    });
    return response.json();
  },

  update: async (id: string, data: Partial<UserData>) => {
    const response = await fetch(`${BASE_URL}/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },

  delete: async (id: string) => {
    await fetch(`${BASE_URL}/users/${id}`, {
      method: 'DELETE',
    });
  },

  getMedecins: async (): Promise<MedecinData[]> => {
    const response = await fetch(`${BASE_URL}/medecin`);
    return response.json();
  }
};
