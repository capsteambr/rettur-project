import { ContractAnalysisResponse, AIProviderConfig, TestConnectionResponse } from '../types/contract';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function analyzeContractFile(
  file: File,
  config: AIProviderConfig
): Promise<ContractAnalysisResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('provider', config.provider);
  formData.append('user_role', config.user_role);

  if (config.model_name) {
    formData.append('model_name', config.model_name);
  }
  if (config.api_key) {
    formData.append('api_key', config.api_key);
  }

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
  config: AIProviderConfig
): Promise<ContractAnalysisResponse> {
  const payload = {
    text,
    provider: config.provider,
    model_name: config.model_name || undefined,
    api_key: config.api_key || undefined,
    user_role: config.user_role,
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

export async function testAndListModels(
  provider: string,
  apiKey?: string,
  baseUrl?: string
): Promise<TestConnectionResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/ai/test`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      provider,
      api_key: apiKey || undefined,
      base_url: baseUrl || undefined,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Erro ao testar conexão (${response.status})`);
  }

  return response.json();
}
