import { fetch } from '@tauri-apps/plugin-http';

const BASE_URL = 'http://localhost:3000';

export interface MedecinData {
  id: string;
  profession: 'PARODENTAIRE' | 'ORTHODENTAIRE';
  userInfo?: {
    firstName: string;
    lastName: string;
  };
}

export interface SeanceData {
  id?: string;
  type: string;
  date: Date;
  patientId: string;
  medecinId: string;
  patient?: {
    nom: string;
    prenom: string;
  };
  medecin?: MedecinData;
}

export const seanceService = {
  getAll: async () => {
    const response = await fetch(`${BASE_URL}/seance`);
    return response.json();
  },

  getById: async (id: string) => {
    const response = await fetch(`${BASE_URL}/seance/${id}`);
    return response.json();
  },

  create: async (data: SeanceData) => {
    const response = await fetch(`${BASE_URL}/seance`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },

  update: async (id: string, data: Partial<SeanceData>) => {
    const response = await fetch(`${BASE_URL}/seance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },

  delete: async (id: string) => {
    await fetch(`${BASE_URL}/seance/${id}`, {
      method: 'DELETE',
    });
  }
};
