import { 
  ContractAnalysisResponse, 
  Lawyer 
} from '../types/contract';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function analyzeContractFile(
  file: File,
  userRole: string = 'locatario / contratante leigo'
): Promise<ContractAnalysisResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('user_role', userRole);

  const response = await fetch(`${API_BASE_URL}/api/v1/analyze`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Erro na análise do contrato (${response.status})`);
  }

  return response.json();
}

export async function analyzeContractText(
  text: string,
  userRole: string = 'locatario / contratante leigo'
): Promise<ContractAnalysisResponse> {
  const payload = {
    text,
    user_role: userRole,
  };

  const response = await fetch(`${API_BASE_URL}/api/v1/analyze/text`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Erro na análise do contrato (${response.status})`);
  }

  return response.json();
}

export async function checkServerHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/health`, { method: 'GET' });
    return response.ok;
  } catch {
    return false;
  }
}

// ==========================================
// Marketplace de Advogados Credenciados
// ==========================================

export async function fetchLawyers(params?: {
  area?: string;
  state?: string;
  city?: string;
  search?: string;
}): Promise<Lawyer[]> {
  const query = new URLSearchParams();
  if (params?.area) query.append('area', params.area);
  if (params?.state) query.append('state', params.state);
  if (params?.city) query.append('city', params.city);
  if (params?.search) query.append('search', params.search);

  const url = `${API_BASE_URL}/api/v1/lawyers?${query.toString()}`;
  const response = await fetch(url, { method: 'GET' });

  if (!response.ok) {
    throw new Error(`Erro ao buscar advogados credenciados (${response.status})`);
  }

  return response.json();
}

export async function fetchPracticeAreas(): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/lawyers/areas`, { method: 'GET' });
  if (!response.ok) {
    return [
      "Direito Imobiliário",
      "Direito do Trabalho",
      "Direito do Consumidor",
      "Direito Civil",
      "Direito Empresarial"
    ];
  }
  return response.json();
}

export async function registerLawyer(data: {
  name: string;
  oab: string;
  state: string;
  city: string;
  areas: string[];
  bio: string;
  phone: string;
  email: string;
}): Promise<Lawyer> {
  const response = await fetch(`${API_BASE_URL}/api/v1/lawyers/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Falha ao cadastrar advogado.');
  }

  return response.json();
}
