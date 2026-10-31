import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AnalyticsService } from '../../services/analytics.service';

@Component({
  selector: 'app-project-mobile',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './project-mobile.component.html',
  styleUrl: './project-mobile.component.css'
})
export class ProjectMobileComponent {
  private analyticsService = inject(AnalyticsService);

  // URLs das lojas oficiais (substitua pelos links reais quando publicado)
  public googlePlayUrl = 'https://play.google.com/store/apps/details?id=com.opencaramelo.opencnpj';
  public appStoreUrl = 'https://apps.apple.com/app/opencnpj/id6470000000';

  public notifyFeedback = signal<string | null>(null);

  public onStoreClick(platform: 'google_play' | 'app_store'): void {
    const isPlay = platform === 'google_play';
    const storeName = isPlay ? 'Google Play Store (Android)' : 'Apple App Store (iOS)';
    const targetUrl = isPlay ? this.googlePlayUrl : this.appStoreUrl;

    // Dispara evento para o Google Analytics para contabilizar a intenção/download
    this.analyticsService.trackDownload('OpenCNPJ Mobile', platform, targetUrl);

    // Mensagem de feedback informativa
    this.notifyFeedback.set(`Você clicou no download para ${storeName}. O aplicativo v2.0.0 está em processo de homologação nas lojas e estará disponível para download público a qualquer momento!`);
    
    // Auto-oculta a mensagem após 5 segundos
    setTimeout(() => {
      this.notifyFeedback.set(null);
    }, 5000);
  }

  public trackDownload(platform: string, url?: string): void {
    this.analyticsService.trackDownload('OpenCNPJ Mobile', platform, url || '');
  }
}
