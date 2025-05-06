import { fetch } from '@tauri-apps/plugin-http';

const BASE_URL = 'http://localhost:3000';

export interface ConsultationData {
  date: string;
  idConsultation: string;
  patientId: string;
  medecinId: string;
}

export interface DiagnosisData {
  type: string;
  text: string;
  medecinId: string;
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
  },

  addDiagnosis: async (consultationId: string, data: DiagnosisData) => {
    const response = await fetch(`${BASE_URL}/consultation/${consultationId}/diagnosis`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },

  updateDiagnosis: async (diagnosisId: string, data: Partial<DiagnosisData>) => {
    const response = await fetch(`${BASE_URL}/consultation/diagnosis/${diagnosisId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },

  getByPatientId: async (patientId: string) => {
    const response = await fetch(`${BASE_URL}/consultation`);
    const consultations = await response.json();
    return consultations.filter((consultation: any) => consultation.patientId === patientId);
  }
};
