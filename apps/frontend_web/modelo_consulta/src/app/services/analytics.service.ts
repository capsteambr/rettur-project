import { Injectable, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private router = inject(Router);

  // ID de Medição Oficial do Google Analytics 4 (OpenCNPJ)
  public readonly gaMeasurementId = 'G-D1ENPS7FM6';

  constructor() {
    this.initRouteTracking();
  }

  /**
   * Monitora transições de rota no Angular para registrar PageViews virtuais no GA4
   */
  private initRouteTracking(): void {
    if (typeof window === 'undefined') return;

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.trackPageView(event.urlAfterRedirects);
      });
  }

  /**
   * Envia evento de visualização de página para o GA4
   */
  public trackPageView(path: string): void {
    if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;

    window.gtag('event', 'page_view', {
      page_path: path,
      page_title: typeof document !== 'undefined' ? document.title : '',
      page_location: typeof window !== 'undefined' ? window.location.href : ''
    });
  }

  /**
   * Rastreia cliques de download dos aplicativos e extensões
   * @param item Ex: 'OpenCNPJ Mobile' ou 'OpenCNPJ Extensão'
   * @param platform Ex: 'google_play', 'app_store', 'chrome_store', 'edge_store'
   * @param destinationUrl URL de destino do download/loja
   */
  public trackDownload(item: string, platform: string, destinationUrl?: string): void {
    if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;

    window.gtag('event', 'download_click', {
      item_name: item,
      platform: platform,
      destination_url: destinationUrl || '',
      event_category: 'Downloads',
      event_label: `${item} - ${platform}`
    });
  }

  /**
   * Rastreia consultas de CNPJ realizadas pelo usuário na barra de pesquisa
   * @param cnpj CNPJ consultado
   * @param origin Origem da consulta (ex: 'home_bar', 'consulta_bar', 'preset_chip')
   * @param mode Modo de exibição (ex: 'padrao', 'terminal', 'windows')
   */
  public trackSearch(cnpj: string, origin: string = 'home_bar', mode: string = 'padrao'): void {
    if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;

    window.gtag('event', 'search', {
      search_term: cnpj,
      origin: origin,
      search_mode: mode,
      event_category: 'Consultas'
    });
  }

  /**
   * Rastreia requisições de teste efetuadas pelo console da documentação interativa
   */
  public trackApiTest(apiId: string, endpointPath: string, status: number): void {
    if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;

    window.gtag('event', 'api_test', {
      api_id: apiId,
      endpoint_path: endpointPath,
      response_status: status,
      event_category: 'API Docs'
    });
  }

  /**
   * Rastreia eventos genéricos personalizados
   */
  public trackEvent(eventName: string, params: Record<string, any> = {}): void {
    if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;

    window.gtag('event', eventName, params);
  }

  /**
   * Atualiza o estado de consentimento do Google Analytics (Consent Mode v2)
   */
  public updateConsent(analyticsGranted: boolean): void {
    if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;

    window.gtag('consent', 'update', {
      analytics_storage: analyticsGranted ? 'granted' : 'denied'
    });
  }
}
