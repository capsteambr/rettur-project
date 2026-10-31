import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CookieConsentService } from '../../services/cookie-consent.service';

@Component({
  selector: 'app-cookie-consent',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cookie-consent.component.html',
  styleUrl: './cookie-consent.component.css'
})
export class CookieConsentComponent implements OnInit {
  public consentService = inject(CookieConsentService);

  public tempAnalytics = false;

  ngOnInit(): void {
    this.tempAnalytics = this.consentService.analyticsConsent();
  }

  public openSettingsModal(): void {
    this.tempAnalytics = this.consentService.analyticsConsent();
    this.consentService.openSettings();
  }

  public saveCustom(): void {
    this.consentService.saveSettings(this.tempAnalytics);
  }
}
