export type RiskLevel = 'BAIXO' | 'MEDIO' | 'ALTO' | 'CRITICO';

export interface AttentionPoint {
  clause_reference: string;
  title: string;
  severity: RiskLevel;
  original_snippet: string;
  plain_explanation: string;
  recommendation: string;
}

export interface ContractStrength {
  clause_reference: string;
  title: string;
  explanation: string;
}

export interface TimelineItem {
  event: string;
  trigger_date_or_period: string;
  metric_or_consequence: string;
  alert?: string | null;
}

export interface ContractAnalysisResponse {
  id?: string;
  created_at?: string;
  expires_at?: string;
  contract_type: string;
  risk_score: number;
  risk_level: RiskLevel;
  summary_plain_text: string;
  strengths: ContractStrength[];
  weaknesses_and_traps: AttentionPoint[];
  timeline: TimelineItem[];
  actionable_questions: string[];
  suggested_practice_areas?: string[];
  ethical_disclaimer?: string;
}

export interface ConsultationRecord {
  id: string; // UUID v4
  createdAt: string;
  expiresAt: string;
  contractType: string;
  riskScore: number;
  riskLevel: RiskLevel;
  fileName?: string;
  analysis: ContractAnalysisResponse;
}

export interface Lawyer {
  id: string;
  name: string;
  oab: string;
  state: string;
  city: string;
  areas: string[];
  bio: string;
  rating: number;
  review_count: number;
  phone: string;
  email: string;
  verified: boolean;
  available_online: boolean;
}

export interface UserSession {
  isLoggedIn: boolean;
  userType: 'client' | 'lawyer';
  name: string;
  email: string;
  documentsAnalyzed: number;
  maxFreeDocuments: number;
  oab?: string;
  subscriptionPlan?: string;
}

export interface LawyerLead {
  id: string;
  clientName: string;
  clientPhone: string;
  contractType: string;
  riskLevel: RiskLevel;
  date: string;
  status: 'NOVO' | 'EM_ATENDIMENTO' | 'CONTRATO_FECHADO';
  initialMessage: string;
}

export interface LawyerReview {
  id: string;
  clientName: string;
  rating: number;
  date: string;
  comment: string;
  contractCategory: string;
}
