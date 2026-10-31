import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { DonationModalComponent } from './components/donation-modal/donation-modal.component';
import { CookieConsentComponent } from './components/cookie-consent/cookie-consent.component';
import { ThemeService } from './services/theme.service';
import { AnalyticsService } from './services/analytics.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, DonationModalComponent, CookieConsentComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  public themeService = inject(ThemeService);
  public analyticsService = inject(AnalyticsService);

  ngOnInit(): void {
    // Garante que qualquer elemento de vídeo adicionado permaneça estritamente sem som
    this.enforceGlobalMute();
  }

  private enforceGlobalMute(): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const muteAll = () => {
      const videos = document.querySelectorAll('video');
      videos.forEach(v => {
        v.muted = true;
        v.volume = 0;
        v.setAttribute('muted', '');
      });
    };

    muteAll();

    try {
      const observer = new MutationObserver(() => {
        muteAll();
      });
      observer.observe(document.body, { childList: true, subtree: true });
    } catch {
      // Ignora em caso de ambientes restritos
    }
  }
}
