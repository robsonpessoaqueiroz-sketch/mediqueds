export interface Medicamento {
  id: string;
  user_id: string;
  nome: string;
  dosagem: string;
  horario: string;
  frequencia: string;
  observacao?: string;
  created_at: string;
  updated_at: string;
}

export interface MedicamentoFormData {
  nome: string;
  dosagem: string;
  horario: string;
  frequencia: string;
  observacao: string;
}

export interface User {
  id: string;
  email?: string;
  user_metadata?: {
    nome?: string;
    full_name?: string;
  };
}

export interface AuthState {
  user: User | null;
  loading: boolean;
}
