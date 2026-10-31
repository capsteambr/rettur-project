import { Injectable } from '@angular/core';

export interface ApiPresetExample {
  label: string;
  value: string;
}

export interface EndpointParam {
  name: string;
  type: string;
  in: 'path' | 'query';
  required: boolean;
  defaultValue: string;
  description: string;
  examples?: ApiPresetExample[];
}

export interface ApiPayloadDoc {
  field: string;
  type: string;
  desc: string;
}

export interface EcosystemProduct {
  name: string;
  badge: string;
  badgeType: 'web' | 'mobile' | 'extension';
  icon: string;
  description: string;
  actionUrl?: string;
  actionLabel: string;
}

export interface ApiEndpoint {
  id: string;
  category: string;
  categoryName: string;
  categoryIcon: string;
  subCategory?: string;
  subCategoryName?: string;
  title: string;
  method: 'GET' | 'POST';
  status: 'online' | 'coming-soon';
  rateLimit: string;
  isFree: boolean;
  shortDesc: string;
  baseUrl: string;
  endpointPath: string;
  githubUrl?: string;
  websiteUrl?: string;
  websiteLabel?: string;
  ecosystem?: {
    title: string;
    description: string;
    products: EcosystemProduct[];
  };
  params: EndpointParam[];
  payloadDocs: ApiPayloadDoc[];
  sampleFallback: any;
}

export interface ApiSubCategoryGroup {
  subCategory: string;
  subCategoryName: string;
  apis: ApiEndpoint[];
}

export interface ApiCategoryGroup {
  category: string;
  categoryName: string;
  categoryIcon: string;
  subCategories: ApiSubCategoryGroup[];
}

export interface ApiTestResult {
  status: number;
  statusText: string;
  timeMs: number;
  isSimulated: boolean;
  data: any;
  note?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiExplorerService {
  private registry: Record<string, ApiEndpoint> = {
    cnpj: {
      id: 'cnpj',
      category: 'empresas',
      categoryName: 'Empresas & Negócios',
      categoryIcon: 'fa-building',
      subCategory: 'cnpj',
      subCategoryName: 'CNPJ',
      title: 'API de Consulta de CNPJ',
      method: 'GET',
      status: 'online',
      rateLimit: '300 req/min',
      isFree: true,
      shortDesc: 'Consulta pública em tempo real de dados cadastrais completos de Pessoas Jurídicas (CNPJ) no Brasil. Dados obtidos diretamente de fontes oficiais da Receita Federal.',
      baseUrl: 'https://kitana.opencnpj.com',
      endpointPath: '/cnpj/{cnpj}',
      githubUrl: 'https://github.com/opencaramelo/opencnpj',
      websiteUrl: 'https://opencnpj.com',
      websiteLabel: 'opencnpj.com',
      ecosystem: {
        title: 'Ecossistema OpenCNPJ',
        description: 'Conheça os aplicativos e soluções oficiais desenvolvidos para consulta e validação ágil de empresas:',
        products: [
          {
            name: 'OpenCNPJ Mobile',
            badge: 'App Android & iOS',
            badgeType: 'mobile',
            icon: 'fa-mobile-screen-button',
            description: 'Aplicativo móvel para consultas instantâneas e offline-ready de dados cadastrais de CNPJ na palma da sua mão.',
            actionUrl: '/downloads/OpenCNPJ/Mobile',
            actionLabel: 'Conhecer'
          },
          {
            name: 'OpenCNPJ Extensão',
            badge: 'Extensão de Navegador',
            badgeType: 'extension',
            icon: 'fa-puzzle-piece',
            description: 'Extensão para Chrome, Firefox e Edge que identifica CNPJs automaticamente em páginas da web, compras e notas fiscais.',
            actionUrl: '/downloads/OpenCNPJ/Extensao',
            actionLabel: 'Conhecer'
          }
        ]
      },
      params: [
        {
          name: 'cnpj',
          type: 'string',
          in: 'path',
          required: true,
          defaultValue: '00000000000191',
          description: 'Número do CNPJ da empresa. Aceita apenas números ou com caracteres de formatação (pontos, barras e hífen). O sistema sanitiza automaticamente.',
          examples: [
            { label: 'Banco do Brasil', value: '00000000000191' },
            { label: 'Petrobras', value: '33000167000101' },
            { label: 'Google Brasil', value: '06990590000123' }
          ]
        }
      ],
      payloadDocs: [
        { field: 'success', type: 'boolean', desc: 'Indica se a requisição foi atendida com êxito.' },
        { field: 'message', type: 'string | null', desc: 'Mensagem descritiva de erro ou aviso, quando houver.' },
        { field: 'data.cnpj', type: 'string', desc: 'Número do CNPJ normalizado (14 dígitos).' },
        { field: 'data.razaoSocial', type: 'string', desc: 'Razão social oficial registrada na Receita Federal.' },
        { field: 'data.nomeFantasia', type: 'string', desc: 'Nome de fantasia ou título do estabelecimento.' },
        { field: 'data.situacaoCadastral', type: 'string', desc: 'Situação cadastral na Receita (ex: Ativa, Baixada, Suspensa).' },
        { field: 'data.dataSituacaoCadastral', type: 'string', desc: 'Data da situação cadastral informada.' },
        { field: 'data.naturezaJuridica', type: 'string', desc: 'Código e descrição da natureza jurídica.' },
        { field: 'data.capitalSocial', type: 'number', desc: 'Valor do capital social registrado em reais.' },
        { field: 'data.logradouro', type: 'string', desc: 'Tipo e nome do logradouro cadastrado.' },
        { field: 'data.municipio / uf', type: 'string', desc: 'Cidade e Unidade Federativa do endereço.' },
        { field: 'data.cep', type: 'string', desc: 'Código de Endereçamento Postal (CEP).' },
        { field: 'data.cnaes', type: 'array', desc: 'Lista de CNAEs primário e secundários com códigos e descrições.' },
        { field: 'data.socios', type: 'array', desc: 'Quadro de Sócios e Administradores (QSA) com nomes, cargos e faixas etárias.' }
      ],
      sampleFallback: {
        "success": true,
        "message": null,
        "data": {
          "cnpj": "00000000000191",
          "situacaoCadastral": "Ativa",
          "dataSituacaoCadastral": "03/11/2005",
          "motivoSituacaoCadastral": "SEM MOTIVO",
          "razaoSocial": "BANCO DO BRASIL SA",
          "nomeFantasia": "DIRECAO GERAL",
          "dataInicioAtividades": "01/08/1966",
          "matriz": "Sim",
          "naturezaJuridica": "Sociedade Anônima Aberta (2046)",
          "capitalSocial": 90000000000,
          "email": "secex@bb.com.br",
          "telefone": "(61) 3493-9002",
          "logradouro": "SETOR DE AUTARQUIAS NORTE QUADRA 5 BL A",
          "numero": "SN",
          "complemento": "LOTE B ED SEDE III",
          "bairro": "ASA NORTE",
          "municipio": "BRASILIA",
          "uf": "DF",
          "cep": "70040-912",
          "opcaoSimples": "N",
          "opcaoMei": "N",
          "cnaes": [
            { "cnae": "6422100", "descricao": "Bancos múltiplos, com carteira comercial" }
          ],
          "socios": [
            { "nomeSocio": "TARCIANA PAULA GOMES MEDEIROS", "descricao": "Presidente", "faixaEtaria": "41-50 anos" }
          ]
        }
      }
    }
  };

  public getAllEndpoints(): ApiEndpoint[] {
    return Object.values(this.registry);
  }

  public getEndpoint(id: string): ApiEndpoint | undefined {
    return this.registry[id];
  }

  public getCategoryGroups(): ApiCategoryGroup[] {
    const catMap: Record<string, {
      category: string;
      categoryName: string;
      categoryIcon: string;
      subMap: Record<string, ApiSubCategoryGroup>;
    }> = {};

    Object.values(this.registry).forEach(api => {
      const catKey = api.category;
      if (!catMap[catKey]) {
        catMap[catKey] = {
          category: api.category,
          categoryName: api.categoryName,
          categoryIcon: api.categoryIcon,
          subMap: {}
        };
      }

      const subKey = api.subCategory || api.id;
      const subName = api.subCategoryName || api.title.replace('API de Consulta de ', '').replace('API de ', '');
      if (!catMap[catKey].subMap[subKey]) {
        catMap[catKey].subMap[subKey] = {
          subCategory: subKey,
          subCategoryName: subName,
          apis: []
        };
      }

      catMap[catKey].subMap[subKey].apis.push(api);
    });

    return Object.values(catMap).map(cat => ({
      category: cat.category,
      categoryName: cat.categoryName,
      categoryIcon: cat.categoryIcon,
      subCategories: Object.values(cat.subMap)
    }));
  }

  public async executeTest(endpoint: ApiEndpoint, paramValue: string): Promise<ApiTestResult> {
    let cleanVal = paramValue.trim();
    if (endpoint.id === 'cnpj') {
      cleanVal = cleanVal.replace(/\D/g, '');
    }

    if (!cleanVal) {
      cleanVal = endpoint.params[0]?.defaultValue || '';
    }

    const requestUrl = endpoint.baseUrl + endpoint.endpointPath.replace(`{${endpoint.params[0].name}}`, cleanVal);
    const startTime = performance.now();

    if (endpoint.status === 'coming-soon') {
      await new Promise(r => setTimeout(r, 120));
      return {
        status: 200,
        statusText: '200 OK (Demonstração)',
        timeMs: Math.round(performance.now() - startTime),
        isSimulated: true,
        data: endpoint.sampleFallback
      };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(requestUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const duration = Math.round(performance.now() - startTime);
      const data = await response.json();

      return {
        status: response.status,
        statusText: response.status === 200 ? '200 OK' : `${response.status} ${response.statusText}`,
        timeMs: duration,
        isSimulated: false,
        data
      };
    } catch {
      const duration = Math.round(performance.now() - startTime);
      return {
        status: 200,
        statusText: '200 OK (Demonstração Segura)',
        timeMs: duration > 0 ? duration : 85,
        isSimulated: true,
        data: endpoint.sampleFallback,
        note: 'Aviso: Houve restrição de rede no navegador. Exibindo dados simulados de demonstração.'
      };
    }
  }

  public syntaxHighlight(jsonStr: string): string {
    if (!jsonStr) return '';
    jsonStr = jsonStr.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return jsonStr.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      match => {
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
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );
  }
}
