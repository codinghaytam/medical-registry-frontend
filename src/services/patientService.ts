import { fetch } from '@tauri-apps/plugin-http';

const BASE_URL = 'http://localhost:3000';

export type MotifConsultation = 'ESTHETIQUE' | 'FONCTIONNELLE' | 'ADRESSE_PAR_CONFRERE';
export type HygieneBuccoDentaire = 'BONNE' | 'MOYENNE' | 'MAUVAISE';
export type TypeMastication = 'UNILATERALE_ALTERNEE' | 'UNILATERALE_STRICTE' | 'BILATERALE';

export interface PatientData {
  nom: string;
  prenom: string;
  numeroDeDossier: string;
  adresse: string;
  tel: string;
  motifConsultation: MotifConsultation;
  anameseGenerale?: string;
  anamneseFamiliale?: string;
  anamneseLocale?: string;
  hygieneBuccoDentaire: HygieneBuccoDentaire;
  typeMastication: TypeMastication;
  antecedentsDentaires?: string;
}

export const patientService = {
  getAll: async () => {
    const response = await fetch(`${BASE_URL}/patient`);
    return response.json();
  },

  create: async (data: PatientData) => {
    const response = await fetch(`${BASE_URL}/patient`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return response.json();
  },

  update: async (id: string, data: Partial<PatientData>) => {
    const response = await fetch(`${BASE_URL}/patient/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },

  delete: async (id: string) => {
    await fetch(`${BASE_URL}/patient/${id}`, {
      method: 'DELETE',
    });
  }
};
