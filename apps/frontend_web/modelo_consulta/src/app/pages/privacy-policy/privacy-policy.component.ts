import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';

export type PolicyTab = 'extensao' | 'mobile' | 'geral';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.css'
})
export class PrivacyPolicyComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  public activeTab = signal<PolicyTab>('extensao');
  public lastUpdated = '17 de Setembro de 2026';

  ngOnInit(): void {
    const currentUrl = this.router.url.toLowerCase();
    if (currentUrl.includes('/mobile')) {
      this.activeTab.set('mobile');
    } else if (currentUrl.includes('/extensao') || currentUrl.includes('/extension')) {
      this.activeTab.set('extensao');
    }

    this.route.queryParams.subscribe(params => {
      const tabParam = params['tab']?.toLowerCase();
      if (tabParam === 'mobile') {
        this.activeTab.set('mobile');
      } else if (tabParam === 'geral' || tabParam === 'web') {
        this.activeTab.set('geral');
      } else if (tabParam === 'extensao' || tabParam === 'extension') {
        this.activeTab.set('extensao');
      }
    });

    this.route.fragment.subscribe(fragment => {
      if (fragment === 'mobile') {
        this.activeTab.set('mobile');
      } else if (fragment === 'extensao') {
        this.activeTab.set('extensao');
      } else if (fragment === 'geral') {
        this.activeTab.set('geral');
      }
    });
  }

  public setTab(tab: PolicyTab): void {
    this.activeTab.set(tab);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  }
}
