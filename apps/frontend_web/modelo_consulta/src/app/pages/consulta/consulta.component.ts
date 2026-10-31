import { Component, signal, inject, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { CnpjService, CnpjData, QueryResult, Socio, CnaeItem } from '../../services/cnpj.service';
import { AnalyticsService } from '../../services/analytics.service';

interface HistoryEntry {
  cnpj: string;
  razaoSocial?: string;
  timestamp: number;
}

@Component({
  selector: 'app-consulta',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './consulta.component.html',
  styleUrl: './consulta.component.css'
})
export class ConsultaComponent implements OnInit {
  public cnpjService = inject(CnpjService);
  private analyticsService = inject(AnalyticsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private titleService = inject(Title);
  private metaService = inject(Meta);
  // Search state
  public cnpjInput = signal<string>('');
  public isLoading = signal<boolean>(false);
  public isMobileMenuOpen = signal<boolean>(false);
  public isExtMenuOpen = signal<boolean>(false);

  public hasSearched = signal<boolean>(false);
  public errorMessage = signal<string | null>(null);

  // Result state
  public companyData = signal<CnpjData | null>(null);
  public rawResult = signal<QueryResult | null>(null);
  public showRawJson = signal<boolean>(false);
  public showAllCnaes = signal<boolean>(false);
  public showAllSocios = signal<boolean>(false);
  public activeTab = signal<'resumo' | 'atividades' | 'socios'>('resumo');

  // Accordion state
  public isGeneralInfoExpanded = signal<boolean>(true);

  // UX state
  public copyFeedback = signal<string | null>(null);
  public searchHistory = this.cnpjService.searchHistory;
  public isHistoryExpanded = signal<boolean>(false);

  public get printDate(): string {
    return new Date().toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  @HostListener('document:click', ['$event'])
  public onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.mobile-menu-container') && this.isMobileMenuOpen && this.isMobileMenuOpen()) {
      this.isMobileMenuOpen.set(false);
    }
    if (!target.closest('.ext-menu-container') && this.isExtMenuOpen && this.isExtMenuOpen()) {
      this.isExtMenuOpen.set(false);
    }
    if (!target.closest('.history-dropdown-anchor')) {
      this.isHistoryExpanded.set(false);
    }
  }

  public toggleHistory(): void {
    this.isHistoryExpanded.update(v => !v);
  }

  ngOnInit(): void {
    this.titleService.setTitle('Consulta de CNPJ | OpenCNPJ');
    this.cnpjService.loadHistory();

    // Suporta o novo formato /:cnpj e o antigo ?cnpj=...
    this.route.paramMap.subscribe(paramMap => {
      let q = (paramMap.get('cnpj') || '').trim();
      
      if (!q) {
         q = (this.route.snapshot.queryParamMap.get('cnpj') || '').trim();
      }

      // Se a rota de consulta não tiver nenhum CNPJ, redireciona imediatamente para a home
      if (!q) {
        this.router.navigate(['/']);
        return;
      }

      // Suporte para URLs antigas com modificadores na string
      if (q.toLowerCase().includes('/linux') || q.toLowerCase().includes('/terminal')) {
        const cleanDigits = this.cnpjService.cleanCnpj(q);
        this.router.navigate(cleanDigits ? ['/terminal', cleanDigits] : ['/terminal']);
        return;
      }

      if (q.toLowerCase().includes('/windows') || q.toLowerCase().includes('/win')) {
        const cleanDigits = this.cnpjService.cleanCnpj(q);
        this.router.navigate(cleanDigits ? ['/windows', cleanDigits] : ['/windows']);
        return;
      }

      const masked = this.cnpjService.maskCnpjInput(q);
      this.cnpjInput.set(masked);
      this.performSearch(q, false);
    });
  }

  public onCnpjInputChange(value: string): void {
    const masked = this.cnpjService.maskCnpjInput(value);
    this.cnpjInput.set(masked);
  }

  public getActiveCnpj(): string {
    return this.companyData()?.cnpj || this.cnpjService.cleanCnpj(this.cnpjInput()) || '';
  }

  public onFormSubmit(): void {
    const raw = this.cnpjInput().trim();
    if (!raw) {
      this.clearSearch();
      return;
    }
    this.performSearch(raw, true);
  }

  public async performSearch(inputCnpj: string, updateUrl = true): Promise<void> {
    const clean = this.cnpjService.cleanCnpj(inputCnpj);
    if (!clean) {
      this.errorMessage.set('Por favor, informe um número de CNPJ válido.');
      return;
    }

    if (clean.length < 14) {
      this.errorMessage.set('O CNPJ deve conter 14 dígitos numéricos.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.hasSearched.set(true);
    this.showAllCnaes.set(false);
    this.showAllSocios.set(false);

    if (updateUrl) {
      if (typeof window !== 'undefined') {
        window.location.href = `/${clean}`;
        return; // Retorna cedo para não chamar a API no client-side
      }
    }

    // Rastreia evento de consulta no GA4
    this.analyticsService.trackSearch(clean, updateUrl ? 'consulta_bar' : 'url_direct', 'padrao');

    try {
      const res = await this.cnpjService.consultCnpj(clean);
      this.rawResult.set(res);

      if (res.status === 200 && res.data?.data) {
        const data = res.data.data as CnpjData;
        this.companyData.set(data);
        this.cnpjService.addToHistory(clean, data.razaoSocial);
        const cnpjFormatado = this.cnpjService.formatCnpj(clean);
        
        const cityName = data.municipio ? ` - ${data.municipio}` : '';
        const pageTitle = `${cnpjFormatado} - ${data.razaoSocial || data.nomeFantasia || 'Consulta'}${cityName} | OpenCNPJ`;
        const pageDescription = `Consulta de CNPJ de ${data.razaoSocial}. CNPJ: ${cnpjFormatado}. Status: ${data.situacaoCadastral}. Natureza Jurídica: ${data.naturezaJuridica}. Localizada em ${data.municipio} - ${data.uf}. Obtenha Quadro de Sócios e CNAEs gratuitamente.`;

        this.titleService.setTitle(pageTitle);
        this.metaService.updateTag({ name: 'description', content: pageDescription });
        this.metaService.updateTag({ property: 'og:title', content: pageTitle });
        this.metaService.updateTag({ property: 'og:description', content: pageDescription });
        this.metaService.updateTag({ property: 'og:url', content: `https://opencnpj.com/${clean}` });
      } else {
        this.companyData.set(null);
        this.titleService.setTitle('CNPJ não encontrado | OpenCNPJ');
        this.metaService.updateTag({ name: 'description', content: 'CNPJ não encontrado ou não cadastrado na Receita Federal.' });
        const errorMsg = res.data?.message || res.data?.error || `Nenhum registro encontrado para o CNPJ ${this.cnpjService.formatCnpj(clean)}.`;
        this.errorMessage.set(errorMsg);
      }
    } catch (err: any) {
      this.companyData.set(null);
      this.titleService.setTitle('Erro na consulta | OpenCNPJ');
      this.metaService.updateTag({ name: 'description', content: 'Não foi possível consultar os dados neste momento.' });
      this.errorMessage.set('Não foi possível conectar ao serviço de consulta da Receita Federal. Tente novamente em instantes.');
    } finally {
      this.isLoading.set(false);
    }
  }

  public selectPreset(val: string): void {
    const masked = this.cnpjService.maskCnpjInput(val);
    this.cnpjInput.set(masked);
    this.isHistoryExpanded.set(false);
    this.performSearch(val, true);
  }

  public clearSearch(): void {
    this.cnpjInput.set('');
    this.companyData.set(null);
    this.hasSearched.set(false);
    this.errorMessage.set(null);
    this.isHistoryExpanded.set(false);
    this.titleService.setTitle('Consulta de CNPJ | OpenCNPJ');
    this.router.navigate(['/']);
  }

  public copyToClipboard(text: string, label: string): void {
    if (!text || !navigator.clipboard) return;
    navigator.clipboard.writeText(text).then(() => {
      this.copyFeedback.set(label);
      setTimeout(() => this.copyFeedback.set(null), 2500);
    });
  }

  public printSheet(): void {
    const data = this.companyData();
    if (!data || typeof window === 'undefined') return;

    const printWin = window.open('', '_blank');
    if (!printWin) {
      alert('Por favor, permita pop-ups para imprimir a ficha.');
      return;
    }

    const formatSocio = (s: Socio) => `${s.nomeSocio}\n  Cargo: ${s.descricao}${s.faixaEtaria ? ' | Idade: ' + s.faixaEtaria : ''}`;
    const formatCnae = (c: CnaeItem) => `${c.cnae} - ${c.descricao}`;

    const cnaePrincipal = data.cnaes && data.cnaes.length > 0 ? formatCnae(data.cnaes[0]) : 'Não informado';
    const cnaesSecundarios = data.cnaes && data.cnaes.length > 1 ? data.cnaes.slice(1) : [];

    const cnaesStr = cnaesSecundarios.length > 0 
      ? cnaesSecundarios.map(formatCnae).join('<br>') 
      : 'Nenhuma atividade secundária registrada.';

    const sociosStr = data.socios && data.socios.length > 0
      ? data.socios.map(s => `<li>${formatSocio(s).replace(/\n/g, '<br>')}</li>`).join('')
      : '<li>Nenhum sócio registrado.</li>';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Ficha Cadastral - ${data.cnpj}</title>
        <style>
          body { 
            font-family: "Courier New", Courier, monospace; 
            padding: 40px; 
            color: #000; 
            background: #fff; 
            line-height: 1.5;
            max-width: 800px;
            margin: 0 auto;
          }
          h1 { font-size: 1.4rem; text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 20px; }
          .section-title { font-weight: bold; margin-top: 30px; margin-bottom: 10px; border-bottom: 1px dashed #000; text-transform: uppercase; }
          .row { margin-bottom: 8px; }
          .label { font-weight: bold; }
          ul { margin: 0; padding-left: 20px; }
          li { margin-bottom: 10px; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <h1>FICHA CADASTRAL DE EMPRESA</h1>
        
        <div class="row"><span class="label">RAZÃO SOCIAL:</span> ${data.razaoSocial}</div>
        <div class="row"><span class="label">NOME FANTASIA:</span> ${data.nomeFantasia || 'Nenhum'}</div>
        <div class="row"><span class="label">CNPJ:</span> ${this.cnpjService.formatCnpj(data.cnpj)}</div>
        <div class="row"><span class="label">SITUAÇÃO:</span> ${data.situacaoCadastral} (${data.dataSituacaoCadastral})</div>
        <div class="row"><span class="label">DATA ABERTURA:</span> ${data.dataInicioAtividades}</div>
        <div class="row"><span class="label">NATUREZA JURÍDICA:</span> ${data.naturezaJuridica}</div>
        <div class="row"><span class="label">CAPITAL SOCIAL:</span> ${this.cnpjService.formatCurrency(data.capitalSocial)}</div>
        <div class="row"><span class="label">SIMPLES NACIONAL:</span> ${this.formatSimples(data.opcaoSimples)}</div>
        <div class="row"><span class="label">MEI:</span> ${this.formatSimples(data.opcaoMei)}</div>

        <div class="section-title">Endereço e Contato</div>
        <div class="row"><span class="label">ENDEREÇO:</span> ${this.getFullAddress(data)}</div>
        <div class="row"><span class="label">TELEFONE:</span> ${data.telefone || 'Não informado'}</div>
        <div class="row"><span class="label">E-MAIL:</span> ${data.email || 'Não informado'}</div>

        <div class="section-title">Atividades Econômicas (CNAE)</div>
        <div class="row"><span class="label">PRINCIPAL:</span> <br>${cnaePrincipal}</div>
        <div class="row" style="margin-top: 15px;"><span class="label">SECUNDÁRIAS:</span> <br>${cnaesStr}</div>

        <div class="section-title">Quadro Societário (QSA)</div>
        <ul>${sociosStr}</ul>
        
        <div style="margin-top: 50px; text-align: justify; font-size: 0.8rem; color: #666; border-top: 1px dashed #ccc; padding-top: 10px;">
          <strong>Aviso:</strong> Os dados apresentados acima foram coletados diretamente de fontes oficiais da Receita Federal do Brasil. Esta consulta não substitui a emissão oficial da Certidão Negativa de Débitos ou do Comprovante de Inscrição e Situação Cadastral emitido pelo portal governamental.<br><br>
          Gerado por OpenCNPJ (opencnpj.opencaramelo.com) - ${new Date().toLocaleString('pt-BR')}
        </div>
      </body>
      </html>
    `;

    printWin.document.open();
    printWin.document.write(htmlContent);
    printWin.document.close();
    
    printWin.focus();
    setTimeout(() => {
      printWin.print();
    }, 250);
  }

  private formatSimples(val: any): string {
    if (val === true || val === 'S' || val === 'Sim' || val === 'optante') return 'Optante';
    if (val === false || val === 'N' || val === 'Não' || val === 'nao_optante') return 'Não Optante';
    return String(val || 'Não informado');
  }

  
  public toggleExtMenu(): void {
    this.isExtMenuOpen.set(!this.isExtMenuOpen());
  }

  public toggleMobileMenu(): void {
    this.isMobileMenuOpen.set(!this.isMobileMenuOpen());
  }

  public toggleGeneralInfo(): void {
    this.isGeneralInfoExpanded.set(!this.isGeneralInfoExpanded());
  }



  public shareLink(): void {
    if (typeof window !== 'undefined') {
      const url = window.location.href;
      this.copyToClipboard(url, 'Link copiado para a área de transferência!');
    }
  }

  public copyFullRecord(): void {
    const data = this.companyData();
    if (!data) return;

    const summary = [
      `RAZÃO SOCIAL: ${data.razaoSocial}`,
      `NOME FANTASIA: ${data.nomeFantasia || 'Nenhum'}`,
      `CNPJ: ${this.cnpjService.formatCnpj(data.cnpj)}`,
      `SITUAÇÃO: ${data.situacaoCadastral} (${data.dataSituacaoCadastral})`,
      `DATA ABERTURA: ${data.dataInicioAtividades}`,
      `NATUREZA JURÍDICA: ${data.naturezaJuridica}`,
      `CAPITAL SOCIAL: ${this.cnpjService.formatCurrency(data.capitalSocial)}`,
      `ENDEREÇO: ${this.getFullAddress(data)}`,
      `TELEFONE: ${data.telefone || 'Não informado'}`,
      `E-MAIL: ${data.email || 'Não informado'}`
    ].join('\n');

    this.copyToClipboard(summary, 'Ficha completa copiada!');
  }

  public getFullAddress(data: CnpjData): string {
    const parts = [
      data.logradouro,
      data.numero ? `nº ${data.numero}` : null,
      data.complemento,
      data.bairro,
      data.municipio && data.uf ? `${data.municipio} - ${data.uf}` : null,
      data.cep ? `CEP ${data.cep}` : null
    ].filter(Boolean);

    return parts.join(', ') || 'Endereço não disponível';
  }

  public getGoogleMapsUrl(data: CnpjData): string {
    const query = encodeURIComponent(this.getFullAddress(data));
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  }

  public getStatusClass(status?: string): string {
    const s = (status || '').toUpperCase();
    if (s.includes('ATIVA')) return 'status-ativa';
    if (s.includes('BAIXADA')) return 'status-baixada';
    if (s.includes('SUSPENSA')) return 'status-suspensa';
    if (s.includes('INAPTA')) return 'status-inapta';
    return 'status-outro';
  }

  public isMatriz(matriz: any): boolean {
    if (typeof matriz === 'boolean') return matriz;
    if (typeof matriz === 'string') return matriz.toLowerCase().includes('sim') || matriz === '1';
    return false;
  }

  public getHighlightedJson(): string {
    const res = this.rawResult();
    if (!res) return '';
    return this.cnpjService.highlightJson(res.data);
  }

  public clearHistory(): void {
    this.cnpjService.clearHistory();
    this.isHistoryExpanded.set(false);
  }
}
