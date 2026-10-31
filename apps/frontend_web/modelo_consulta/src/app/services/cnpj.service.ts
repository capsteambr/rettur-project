import { Injectable, inject, signal, TransferState, makeStateKey } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface Socio {
  nomeSocio: string;
  descricao: string;
  faixaEtaria?: string;
  dataEntradaSociedade?: string;
  cnpjCpfSocio?: string;
  identificadorSocio?: number;
  nomeRepresentante?: string | null;
}

export interface CnaeItem {
  cnae: string;
  descricao: string;
}

export interface CnpjData {
  cnpj: string;
  situacaoCadastral: string;
  dataSituacaoCadastral: string;
  motivoSituacaoCadastral?: string | null;
  razaoSocial: string;
  nomeFantasia?: string | null;
  dataInicioAtividades: string;
  matriz: boolean | string;
  naturezaJuridica: string;
  capitalSocial: number;
  email?: string | null;
  telefone?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  municipio?: string | null;
  uf?: string | null;
  cep?: string | null;
  dataSituacaoEspecial?: string | null;
  situacaoEspecial?: string | null;
  opcaoSimples?: string | boolean | null;
  opcaoMei?: string | boolean | null;
  cnaes?: CnaeItem[];
  socios?: Socio[];
}

export interface HistoryEntry {
  cnpj: string;
  razaoSocial?: string;
  timestamp: number;
}

export interface QueryResult {
  status: number;
  statusText: string;
  timeMs: number;
  data: {
    success?: boolean;
    message?: string | null;
    data?: CnpjData;
    error?: string;
  } | any;
  isSimulated: boolean;
  note?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CnpjService {
  private http = inject(HttpClient);
  private transferState = inject(TransferState);

  private readonly CNPJ_BASE_URL = 'https://kitana-x.opencnpj.com';
  public readonly HISTORY_KEY = 'opencnpj_recent_queries';

  private readonly DEFAULT_RECENT: HistoryEntry[] = [
    { cnpj: '00000000000191', razaoSocial: 'BANCO DO BRASIL SA', timestamp: 1 },
    { cnpj: '06990590000123', razaoSocial: 'GOOGLE BRASIL INTERNET LTDA', timestamp: 2 },
    { cnpj: '33000167000101', razaoSocial: 'PETROLEO BRASILEIRO S.A. PETROBRAS', timestamp: 3 }
  ];

  public searchHistory = signal<HistoryEntry[]>([]);

  constructor() {
    this.loadHistory();
  }

  public loadHistory(): void {
    if (typeof localStorage === 'undefined') {
      this.searchHistory.set([]);
      return;
    }
    try {
      const raw = localStorage.getItem(this.HISTORY_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.searchHistory.set(parsed);
          return;
        }
      }
    } catch {}
    this.searchHistory.set([]);
  }

  public addToHistory(cnpj: string, razaoSocial?: string): void {
    const clean = this.cleanCnpj(cnpj);
    if (!clean) return;
    const current = this.searchHistory().filter((item: HistoryEntry) => item.cnpj !== clean);
    const updated: HistoryEntry[] = [{ cnpj: clean, razaoSocial, timestamp: Date.now() }, ...current].slice(0, 6);
    this.searchHistory.set(updated);
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(this.HISTORY_KEY, JSON.stringify(updated));
      } catch {}
    }
  }

  public clearHistory(): void {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(this.HISTORY_KEY);
      } catch {}
    }
    this.searchHistory.set([]);
  }

  public readonly CNPJ_PRESETS = [
    { label: 'Banco do Brasil', value: '00000000000191' },
    { label: 'Petrobras', value: '33000167000101' },
    { label: 'Google Brasil', value: '06990590000123' }
  ];

  public async consultCnpj(rawCnpj: string): Promise<QueryResult> {
    const clean = this.cleanCnpj(rawCnpj) || '00000000000191';
    const STATE_KEY = makeStateKey<QueryResult>(`cnpj-${clean}`);
    const isBrowser = typeof window !== 'undefined';

    if (isBrowser) {
      const cached = this.transferState.get(STATE_KEY, null);
      if (cached) {
        return cached;
      }
      // Se não tem cache no client, não podemos chamar a kitana-x devido a CORS e chaves expostas.
      return {
        status: 500,
        statusText: '500 Internal Error (Missing SSR Cache)',
        timeMs: 0,
        data: { success: false, message: 'Erro interno no servidor.', data: null },
        isSimulated: false
      };
    }

    const url = `${this.CNPJ_BASE_URL}/cnpj/${clean}`;
    const start = performance.now();
    let result: QueryResult;

    try {
      const data = await firstValueFrom(this.http.get<any>(url, {
        headers: { 
          'Accept': 'application/json',
          'User-Agent': 'OpenCNPJ-Web-x/1.0',
          'X-Client': 'OpenCNPJ-Web-x/1.0',
          'Authorization': 'Bearer LXUox7XHTwSBtYh0CXqpAcNtslXN6bVXB7CgDq6Tvks='
        },
        observe: 'response'
      }));

      const end = performance.now();
      result = {
        status: data.status,
        statusText: `${data.status} OK`,
        timeMs: Math.round(end - start),
        data: data.body,
        isSimulated: false
      };
    } catch (error: any) {
      const end = performance.now();
      let errorData = error.error;
      const status = error.status;

      if (status === 404) {
        errorData = { success: false, message: 'Não encontrada.', data: null };
      } else if (status === 500 || status === 0) {
        errorData = { success: false, message: 'Erro interno no servidor.', data: null };
      } else if (!errorData || typeof errorData !== 'object') {
        errorData = { success: false, message: `Erro na consulta: HTTP ${status}`, data: null };
      }

      result = {
        status,
        statusText: error.statusText,
        timeMs: Math.round(end - start),
        data: errorData,
        isSimulated: false
      };
    }

    // Grava no estado para o client consumir e não duplicar chamada
    this.transferState.set(STATE_KEY, result);
    return result;
  }

  public cleanCnpj(val: string): string {
    return (val || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  }

  public maskCnpjInput(value: string | undefined | null): string {
    if (!value) return '';
    const digits = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 14);
    if (!digits) return '';

    if (digits.length <= 2) {
      return digits;
    }
    if (digits.length <= 5) {
      return `${digits.slice(0, 2)}.${digits.slice(2)}`;
    }
    if (digits.length <= 8) {
      return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
    }
    if (digits.length <= 12) {
      return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
    }
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
  }

  public formatCnpj(raw: string | undefined | null): string {
    if (!raw) return '';
    const clean = this.cleanCnpj(raw);
    if (clean.length !== 14) return raw;
    return clean.replace(/^([A-Z0-9]{2})([A-Z0-9]{3})([A-Z0-9]{3})([A-Z0-9]{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  }

  public formatCurrency(val: number | string | undefined | null): string {
    if (val === undefined || val === null) return 'R$ 0,00';
    const num = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(num)) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
  }

  public highlightJson(json: any): string {
    if (typeof json !== 'string') {
      json = JSON.stringify(json, null, 2);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?|[{}[\]])/g,
      (match: string) => {
        let cls = 'json-number';
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'json-key';
          } else {
            cls = 'json-string';
          }
        } else if (/true|false/.test(match)) {
          cls = 'json-boolean';
        } else if (/null/.test(match)) {
          cls = 'json-null';
        } else if (/[{}[\]]/.test(match)) {
          cls = 'json-brace';
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );
  }

  private getSampleCnpjFallback(cnpj: string): any {
    return {
      success: true,
      message: null,
      data: {
        cnpj: cnpj || '00000000000191',
        situacaoCadastral: 'Ativa',
        dataSituacaoCadastral: '03/11/2005',
        motivoSituacaoCadastral: null,
        razaoSocial: cnpj === '33000167000101' ? 'PETROLEO BRASILEIRO S.A. PETROBRAS' : 'BANCO DO BRASIL SA',
        nomeFantasia: cnpj === '33000167000101' ? 'PETROBRAS' : 'DIRECAO GERAL',
        dataInicioAtividades: '01/08/1966',
        matriz: 'Sim',
        naturezaJuridica: 'Sociedade de Economia Mista (2038)',
        capitalSocial: 120000000000.00,
        email: 'contato@empresa.com.br',
        telefone: '(61) 3493-9002',
        logradouro: 'QUADRA SAUN QUADRA 5 BLOCO B TORRE I, II, III',
        numero: 'SN',
        complemento: 'ANDAR T I SL S101 A S1602',
        bairro: 'ASA NORTE',
        municipio: 'BRASILIA',
        uf: 'DF',
        cep: '70040-912',
        dataSituacaoEspecial: null,
        situacaoEspecial: null,
        opcaoSimples: 'Não',
        opcaoMei: 'Não',
        cnaes: [
          { cnae: '6422100', descricao: 'Bancos múltiplos, com carteira comercial' },
          { cnae: '6499999', descricao: 'Outras atividades de serviços financeiros não especificadas anteriormente' },
          { cnae: '6619302', descricao: 'Correspondentes de instituições financeiras' }
        ],
        socios: [
          { nomeSocio: 'TARCIANA PAULA GOMES MEDEIROS', descricao: 'Presidente', faixaEtaria: '41-50 anos', dataEntradaSociedade: '26/01/2023', cnpjCpfSocio: '***128734**' },
          { nomeSocio: 'FRANCISCO AUGUSTO LASSALVIA', descricao: 'Diretor', faixaEtaria: '41-50 anos', dataEntradaSociedade: '29/09/2020', cnpjCpfSocio: '***355918**' },
          { nomeSocio: 'RODRIGO MULINARI', descricao: 'Diretor', faixaEtaria: '41-50 anos', dataEntradaSociedade: '31/08/2021', cnpjCpfSocio: '***599070**' },
          { nomeSocio: 'CARLA NESI', descricao: 'Diretor', faixaEtaria: '51-60 anos', dataEntradaSociedade: '22/03/2023', cnpjCpfSocio: '***295868**' }
        ]
      }
    };
  }
}
