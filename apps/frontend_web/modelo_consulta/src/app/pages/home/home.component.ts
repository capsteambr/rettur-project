import { Component, signal, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CnpjService } from '../../services/cnpj.service';
import { DonationService } from '../../services/donation.service';
import { AnalyticsService } from '../../services/analytics.service';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, FormsModule, FooterComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  public cnpjService = inject(CnpjService);
  public donationService = inject(DonationService);
  private analyticsService = inject(AnalyticsService);
  private router = inject(Router);

  public openDonationModal(): void {
    this.donationService.open();
  }

  // Search state
  public cnpjInput = signal<string>('');
  public isSearchFocused = signal<boolean>(false);
  public hasInputError = signal<boolean>(false);
  public selectedMode = signal<'padrao' | 'terminal' | 'windows'>('padrao');
  public searchHistory = this.cnpjService.searchHistory;

  private blurTimer: any = null;

  ngOnInit(): void {
    this.cnpjService.loadHistory();
  }

  public setMode(mode: 'padrao' | 'terminal' | 'windows'): void {
    this.selectedMode.set(mode);
    const raw = this.cnpjInput().trim();
    const clean = this.cnpjService.cleanCnpj(raw);

    if (mode === 'padrao') {
      if (clean) {
        this.router.navigate(['/', clean]);
      } else {
        this.router.navigate(['/']);
      }
    } else if (mode === 'terminal') {
      this.router.navigate(clean ? ['/terminal', clean] : ['/terminal']);
    } else if (mode === 'windows') {
      this.router.navigate(clean ? ['/windows', clean] : ['/windows']);
    }
  }

  public submitSearch(overrideCnpj?: string): void {
    const raw = (overrideCnpj !== undefined ? overrideCnpj : this.cnpjInput()).trim();
    const clean = this.cnpjService.cleanCnpj(raw);
    
    // Se o usuário não digitou nada, destaca o input em vermelho e abre o dropdown de exemplos
    if (!clean) {
      this.hasInputError.set(true);
      this.isSearchFocused.set(true);
      const el = document.getElementById('home-cnpj-input') as HTMLInputElement;
      if (el) {
        el.focus();
      }
      return;
    }

    this.hasInputError.set(false);
    const targetCnpj = clean;

    // Salva no histórico compartilhado
    this.cnpjService.addToHistory(targetCnpj);

    // Rastreia evento no GA4
    this.analyticsService.trackSearch(targetCnpj, overrideCnpj ? 'preset_chip' : 'home_bar', this.selectedMode());

    const mode = this.selectedMode();
    if (mode === 'terminal') {
      window.location.href = `/terminal/${targetCnpj}`;
    } else if (mode === 'windows') {
      window.location.href = `/windows/${targetCnpj}`;
    } else {
      window.location.href = `/${targetCnpj}`;
    }
  }

  public onSearchFocus(): void {
    if (this.blurTimer) {
      clearTimeout(this.blurTimer);
      this.blurTimer = null;
    }
    this.isSearchFocused.set(true);
  }

  public onSearchBlur(): void {
    this.blurTimer = setTimeout(() => {
      this.isSearchFocused.set(false);
    }, 250);
  }

  public onCnpjInputChange(value: string): void {
    this.hasInputError.set(false);
    const masked = this.cnpjService.maskCnpjInput(value);
    this.cnpjInput.set(masked);
  }

  public selectPreset(val: string): void {
    const masked = this.cnpjService.maskCnpjInput(val);
    this.cnpjInput.set(masked);
    this.submitSearch(val);
  }

  public clearHistory(): void {
    this.cnpjService.clearHistory();
  }

  public focusSearchInput(): void {
    const el = document.getElementById('home-cnpj-input') as HTMLInputElement;
    if (el) {
      el.focus();
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}
