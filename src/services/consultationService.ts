import { fetch } from '@tauri-apps/plugin-http';

const BASE_URL = 'http://localhost:3000';

export interface ConsultationData {
  date: string;
  idConsultation: string;
  patientId: string;
  medecinId: string;
  diagnostiqueParo?: string;
  diagnostiqueOrtho?: string;
}

export const consultationService = {
  getAll: async () => {
    const response = await fetch(`${BASE_URL}/consultation`);
    return response.json();
  },

  create: async (data: ConsultationData) => {
    const response = await fetch(`${BASE_URL}/consultation`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },

  update: async (id: string, data: Partial<ConsultationData>) => {
    const response = await fetch(`${BASE_URL}/consultation/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },

  delete: async (id: string) => {
    await fetch(`${BASE_URL}/consultation/${id}`, {
      method: 'DELETE',
    });
  }
};
