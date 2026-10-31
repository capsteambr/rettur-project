import { Injectable, inject, signal } from '@angular/core';
import { AnalyticsService } from './analytics.service';

export type CookieConsentStatus = 'accepted' | 'essential' | 'unset';

@Injectable({
  providedIn: 'root'
})
export class CookieConsentService {
  private analyticsService = inject(AnalyticsService);

  private readonly STORAGE_KEY = 'opencnpj_cookie_consent';

  public isBannerOpen = signal<boolean>(false);
  public isSettingsModalOpen = signal<boolean>(false);
  public analyticsConsent = signal<boolean>(false);

  constructor() {
    this.initConsent();
  }

  private initConsent(): void {
    if (typeof window === 'undefined') return;

    try {
      const saved = localStorage.getItem(this.STORAGE_KEY) as CookieConsentStatus | null;
      if (saved === 'accepted') {
        this.analyticsConsent.set(true);
        this.isBannerOpen.set(false);
        this.analyticsService.updateConsent(true);
      } else if (saved === 'essential') {
        this.analyticsConsent.set(false);
        this.isBannerOpen.set(false);
        this.analyticsService.updateConsent(false);
      } else {
        // Nenhuma escolha realizada ainda: exibe o aviso
        this.isBannerOpen.set(true);
        this.analyticsConsent.set(false);
      }
    } catch {
      this.isBannerOpen.set(true);
    }
  }

  public acceptAll(): void {
    this.analyticsConsent.set(true);
    this.isBannerOpen.set(false);
    this.isSettingsModalOpen.set(false);
    try {
      localStorage.setItem(this.STORAGE_KEY, 'accepted');
    } catch {}
    this.analyticsService.updateConsent(true);
  }

  public acceptEssentialOnly(): void {
    this.analyticsConsent.set(false);
    this.isBannerOpen.set(false);
    this.isSettingsModalOpen.set(false);
    try {
      localStorage.setItem(this.STORAGE_KEY, 'essential');
    } catch {}
    this.analyticsService.updateConsent(false);
  }

  public openSettings(): void {
    this.isSettingsModalOpen.set(true);
  }

  public closeSettings(): void {
    this.isSettingsModalOpen.set(false);
  }

  public saveSettings(enableAnalytics: boolean): void {
    if (enableAnalytics) {
      this.acceptAll();
    } else {
      this.acceptEssentialOnly();
    }
  }
}
