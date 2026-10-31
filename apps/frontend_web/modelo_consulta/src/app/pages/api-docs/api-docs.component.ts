import { Component, inject, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { ApiExplorerService, ApiEndpoint, ApiTestResult } from '../../services/api-explorer.service';
import { AnalyticsService } from '../../services/analytics.service';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-api-docs',
  standalone: true,
  imports: [RouterLink, FormsModule, FooterComponent],
  templateUrl: './api-docs.component.html',
  styleUrl: './api-docs.component.css'
})
export class ApiDocsComponent implements OnInit, OnDestroy {
  private apiExplorerService = inject(ApiExplorerService);
  private analyticsService = inject(AnalyticsService);
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private document = inject(DOCUMENT);

  public selectedApi = signal<ApiEndpoint>(this.apiExplorerService.getEndpoint('cnpj')!);
  public isEndpointExpanded = signal<boolean>(true);

  public playgroundParamValue = signal<string>('00000000000191');
  public testResult = signal<ApiTestResult | null>(null);
  public isTesting = signal<boolean>(false);
  public activeSnippetTab = signal<'curl' | 'js' | 'python'>('curl');
  public copyStatus = signal<Record<string, boolean>>({});

  public highlightedJson = computed<string>(() => {
    const res = this.testResult();
    if (!res) return '';
    return this.apiExplorerService.syntaxHighlight(JSON.stringify(res.data, null, 2));
  });

  public currentSnippetCode = computed<string>(() => {
    const api = this.selectedApi();
    const rawVal = this.playgroundParamValue().trim();
    const paramVal = rawVal.replace(/\D/g, '') || (api.params[0]?.defaultValue || '');
    const finalUrl = api.baseUrl + api.endpointPath.replace(`{${api.params[0]?.name}}`, paramVal);

    if (this.activeSnippetTab() === 'curl') {
      return `curl -X GET "${finalUrl}" \\\n  -H "Accept: application/json"`;
    } else if (this.activeSnippetTab() === 'js') {
      return `fetch("${finalUrl}")\n  .then(response => {\n    if (!response.ok) throw new Error(\`HTTP error! status: \${response.status}\`);\n    return response.json();\n  })\n  .then(data => {\n    console.log("Dados retornados:", data);\n  })\n  .catch(error => {\n    console.error("Erro na requisição:", error);\n  });`;
    } else {
      return `import requests\n\nurl = "${finalUrl}"\nheaders = {"Accept": "application/json"}\n\ntry:\n    response = requests.get(url, headers=headers)\n    response.raise_for_status()\n    data = response.json()\n    print("Dados retornados:", data)\nexcept requests.exceptions.RequestException as e:\n    print("Erro na requisição:", e)`;
    }
  });

  private jsonLdScript: HTMLScriptElement | null = null;

  ngOnInit(): void {
    this.setupSeoMetadata();
    this.injectStructuredData();

    // Carrega resultado inicial demonstrativo pronto
    const api = this.selectedApi();
    this.testResult.set({
      status: 200,
      statusText: '200 OK (Exemplo Pronto)',
      timeMs: 38,
      isSimulated: true,
      data: api.sampleFallback
    });
  }

  ngOnDestroy(): void {
    if (this.jsonLdScript && this.jsonLdScript.parentNode) {
      this.jsonLdScript.parentNode.removeChild(this.jsonLdScript);
    }
  }

  public toggleEndpointExpanded(): void {
    this.isEndpointExpanded.update(v => !v);
  }

  public async runLiveTest(): Promise<void> {
    const api = this.selectedApi();
    const val = this.playgroundParamValue();

    this.isTesting.set(true);
    try {
      const result = await this.apiExplorerService.executeTest(api, val);
      this.testResult.set(result);
      this.analyticsService.trackApiTest(api.id, api.endpointPath, result.status);
    } finally {
      this.isTesting.set(false);
    }
  }

  public applyPreset(val: string): void {
    this.playgroundParamValue.set(val);
    this.runLiveTest();
  }

  public copyToClipboard(text: string, key: string): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        this.triggerCopyState(key);
      });
    } else if (typeof document !== 'undefined') {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      this.triggerCopyState(key);
    }
  }

  private triggerCopyState(key: string): void {
    this.copyStatus.update(state => ({ ...state, [key]: true }));
    setTimeout(() => {
      this.copyStatus.update(state => ({ ...state, [key]: false }));
    }, 2000);
  }

  public getEndpointFullUrl(): string {
    const api = this.selectedApi();
    return `${api.baseUrl}${api.endpointPath}`;
  }

  public getPathPrefix(): string {
    const api = this.selectedApi();
    return api.baseUrl + api.endpointPath.split('{')[0];
  }

  private setupSeoMetadata(): void {
    const pageTitle = 'Documentação da API REST | OpenCNPJ - Consulta Pública de CNPJ';
    const pageDescription = 'Documentação técnica oficial da API REST pública do OpenCNPJ. Consulte dados cadastrais de empresas (CNPJ, Razão Social, CNAEs, Quadro Societário) gratuitamente, com limite de 300 req/min e sem chave de API.';
    const canonicalUrl = 'https://opencnpj.com/api';

    this.titleService.setTitle(pageTitle);

    this.metaService.updateTag({ name: 'description', content: pageDescription });
    this.metaService.updateTag({ name: 'keywords', content: 'api cnpj, documentacao api cnpj, api receita federal, consulta cnpj rest api, api publica empresas brasil, kitana opencnpj, opencaramelo api' });
    this.metaService.updateTag({ name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' });

    // Open Graph
    this.metaService.updateTag({ property: 'og:title', content: pageTitle });
    this.metaService.updateTag({ property: 'og:description', content: pageDescription });
    this.metaService.updateTag({ property: 'og:url', content: canonicalUrl });
    this.metaService.updateTag({ property: 'og:type', content: 'article' });
    this.metaService.updateTag({ property: 'og:image', content: 'https://opencnpj.com/assets/opencnpj_logo.png' });

    // Twitter Card
    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.metaService.updateTag({ name: 'twitter:title', content: pageTitle });
    this.metaService.updateTag({ name: 'twitter:description', content: pageDescription });
    this.metaService.updateTag({ name: 'twitter:image', content: 'https://opencnpj.com/assets/opencnpj_logo.png' });

    // Canonical link update
    if (typeof this.document !== 'undefined') {
      const canonicalLink = this.document.querySelector("link[rel='canonical']") as HTMLLinkElement;
      if (canonicalLink) {
        canonicalLink.setAttribute('href', canonicalUrl);
      }
    }
  }

  private injectStructuredData(): void {
    if (typeof this.document === 'undefined') return;

    try {
      const schemaData = {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'TechArticle',
            '@id': 'https://opencnpj.com/api#techarticle',
            'headline': 'Documentação Técnica da API REST OpenCNPJ',
            'description': 'Guia oficial para consulta de dados cadastrais de CNPJ via API REST pública e gratuita.',
            'url': 'https://opencnpj.com/api',
            'inLanguage': 'pt-BR',
            'author': {
              '@type': 'Organization',
              'name': 'OpenCaramelo',
              'url': 'https://opencaramelo.com'
            },
            'publisher': {
              '@type': 'Organization',
              'name': 'OpenCNPJ',
              'url': 'https://opencnpj.com',
              'logo': {
                '@type': 'ImageObject',
                'url': 'https://opencnpj.com/assets/opencnpj_logo.png'
              }
            }
          },
          {
            '@type': 'WebAPI',
            '@id': 'https://kitana.opencnpj.com#api',
            'name': 'OpenCNPJ REST API',
            'description': 'API pública e gratuita de consulta de CNPJ com limite de 300 requisições por minuto.',
            'documentation': 'https://opencnpj.com/api',
            'termsOfService': 'https://opencnpj.com/politica-de-privacidade',
            'provider': {
              '@type': 'Organization',
              'name': 'OpenCaramelo',
              'url': 'https://opencaramelo.com'
            }
          },
          {
            '@type': 'BreadcrumbList',
            'itemListElement': [
              {
                '@type': 'ListItem',
                'position': 1,
                'name': 'Início',
                'item': 'https://opencnpj.com/'
              },
              {
                '@type': 'ListItem',
                'position': 2,
                'name': 'Documentação da API',
                'item': 'https://opencnpj.com/api'
              }
            ]
          }
        ]
      };

      this.jsonLdScript = this.document.createElement('script');
      this.jsonLdScript.type = 'application/ld+json';
      this.jsonLdScript.text = JSON.stringify(schemaData);
      this.document.head.appendChild(this.jsonLdScript);
    } catch {
      // Ignora erro em ambientes sem suporte
    }
  }
}
