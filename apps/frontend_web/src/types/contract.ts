export type RiskLevel = 'BAIXO' | 'MEDIO' | 'ALTO' | 'CRITICO';

export interface ContractStrength {
  clause_reference: string;
  title: string;
  explanation: string;
}

export interface ContractTrap {
  clause_reference: string;
  title: string;
  severity: RiskLevel;
  ambiguity_detected: boolean;
  original_snippet: string;
  plain_explanation: string;
  recommendation: string;
}

export interface TimelineItem {
  event: string;
  trigger_date_or_period: string;
  metric_or_consequence: string;
  alert?: string | null;
}

export interface ContractAnalysisResponse {
  contract_type: string;
  risk_score: number;
  risk_level: RiskLevel;
  summary_plain_text: string;
  strengths: ContractStrength[];
  weaknesses_and_traps: ContractTrap[];
  timeline: TimelineItem[];
  actionable_questions: string[];
}

export interface ModelInfo {
  id: string;
  name: string;
  description?: string;
  is_recommended?: boolean;
}

export interface TestConnectionResponse {
  success: boolean;
  provider: string;
  message: string;
  models: ModelInfo[];
}

export interface AIProviderConfig {
  provider: 'gemini' | 'ollama' | 'openai';
  model_name?: string;
  api_key?: string;
  base_url?: string;
  user_role: string;
}

export interface ProviderStoreSettings {
  apiKey?: string;
  baseUrl?: string;
  selectedModel: string;
  availableModels: ModelInfo[];
}

export interface AppAIState {
  activeProvider: 'gemini' | 'ollama' | 'openai';
  user_role: string;
  gemini: ProviderStoreSettings;
  ollama: ProviderStoreSettings;
  openai: ProviderStoreSettings;
}
