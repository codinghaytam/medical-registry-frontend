import { fetch } from '@tauri-apps/plugin-http';

const BASE_URL = 'http://localhost:3000';

export interface ReevaluationData {
  id?: string;
  date?: Date;
  indiceDePlaque: number;
  indiceGingivale: number;
  sondagePhoto?: string | null;
  seanceId: string;
  seance?: {
    id: string;
    type: string;
    date: Date;
    patientId: string;
    medecinId: string;
    patient?: {
      id: string;
      nom: string;
      prenom: string;
    };
    medecin?: {
      id: string;
      profession: string;
      userInfo?: {
        firstName: string;
        lastName: string;
      };
    };
  };
}

export const reevaluationService = {
  getAll: async () => {
    const response = await fetch(`${BASE_URL}/reevaluation`);
    return response.json();
  },

  getById: async (id: string) => {
    const response = await fetch(`${BASE_URL}/reevaluation/${id}`);
    return response.json();
  },

  create: async (data: FormData) => {
    const response = await fetch(`${BASE_URL}/reevaluation`, {
      method: 'POST',
      body: data
    });
    return response.json();
  },

  update: async (id: string, data: FormData) => {
    const response = await fetch(`${BASE_URL}/reevaluation/${id}`, {
      method: 'PUT',
      body: data
    });
    return response.json();
  },

  delete: async (id: string) => {
    await fetch(`${BASE_URL}/reevaluation/${id}`, {
      method: 'DELETE',
    });
  }
};