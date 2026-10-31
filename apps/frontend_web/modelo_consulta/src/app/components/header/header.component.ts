import { Component, inject, signal, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../services/theme.service';
import { DonationService } from '../../services/donation.service';
import { CnpjService } from '../../services/cnpj.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  public themeService = inject(ThemeService);
  public donationService = inject(DonationService);
  public cnpjService = inject(CnpjService);
  public router = inject(Router);

  public isMenuOpen = false;
  public searchInput = signal<string>('');
  public showSearch = signal<boolean>(false);
  public showMobileSearch = signal<boolean>(false);
  public isDownloadsHovered = signal<boolean>(false);
  public isDownloadsPinned = signal<boolean>(false); // Mobile search toggle
  public isHistoryExpanded = signal<boolean>(false);
  public searchHistory = this.cnpjService.searchHistory;

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Hide search bar on home page exactly
      this.showSearch.set(event.urlAfterRedirects !== '/');
      
      // Auto-fill CNPJ if we are on a CNPJ page
      const urlParts = event.urlAfterRedirects.split('/');
      if (urlParts.length > 1 && urlParts[1] && urlParts[1] !== 'projetos' && urlParts[1] !== 'terminal' && urlParts[1] !== 'windows') {
        const potentialCnpj = this.cnpjService.cleanCnpj(urlParts[urlParts.length - 1]);
        if (potentialCnpj && potentialCnpj.length === 14) {
          this.searchInput.set(this.cnpjService.formatCnpj(potentialCnpj));
        } else {
          this.searchInput.set('');
        }
      } else {
        this.searchInput.set('');
      }
    });
  }

  public onSearchChange(val: string): void {
    this.searchInput.set(this.cnpjService.maskCnpjInput(val));
  }

  public submitSearch(): void {
    const clean = this.cnpjService.cleanCnpj(this.searchInput());
    if (clean) {
      if (typeof window !== 'undefined') {
        window.location.href = `/${clean}`;
      }
    }
  }

  public clearSearch(): void {
    this.searchInput.set('');
    if (typeof window !== 'undefined') {
      window.location.href = `/`;
    }
  }

  public toggleHistory(): void {
    this.isHistoryExpanded.set(!this.isHistoryExpanded());
  }

  public clearHistory(): void {
    this.cnpjService.clearHistory();
    this.isHistoryExpanded.set(false);
  }

  public selectPreset(cnpj: string): void {
    this.isHistoryExpanded.set(false);
    this.searchInput.set(this.cnpjService.formatCnpj(cnpj));
    this.submitSearch();
  }

  
  @HostListener('document:click', ['$event'])
  public onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.nav-dropdown-wrapper') && this.isDownloadsPinned()) {
      this.isDownloadsPinned.set(false);
    }
  }

  public toggleDownloadsPin(event: Event): void {
    event.preventDefault();
    this.isDownloadsPinned.set(!this.isDownloadsPinned());
  }

  public toggleMobileSearch(): void {
    this.showMobileSearch.set(!this.showMobileSearch());
  }

  public toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    if (this.isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  public closeMenu(): void {
    if (this.isMenuOpen) {
      this.isMenuOpen = false;
      document.body.style.overflow = '';
    }
  }
  public openDonationModal(): void {
    this.donationService.open();
  }

  public toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  public scrollToDonation(event: Event): void {
    const el = document.getElementById('donation');
    if (el) {
      event.preventDefault();
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
