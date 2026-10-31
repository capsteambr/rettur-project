import { inject, Injectable, InjectionToken, signal } from '@angular/core';

export type AppTheme = 'light' | 'dark';

export const INITIAL_THEME = new InjectionToken<AppTheme>('INITIAL_THEME', {
  providedIn: 'root',
  factory: () => 'dark'
});

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private initialThemeFromSsr = inject(INITIAL_THEME, { optional: true });
  public theme = signal<AppTheme>(this.getInitialTheme());

  private mediaQueryListener?: (e: MediaQueryListEvent) => void;

  constructor() {
    this.initTheme();
  }

  private getInitialTheme(): AppTheme {
    if (typeof window === 'undefined') {
      return this.initialThemeFromSsr || 'dark';
    }

    try {
      // 1. Preferência explicitamente salva pelo usuário no site
      const saved = localStorage.getItem('opencnpj_theme') as AppTheme;
      if (saved === 'light' || saved === 'dark') {
        return saved;
      }

      // 2. Cookie de sessão (fallback compartilhado)
      const cookieMatch = document.cookie.match(/(?:^|; )opencnpj_theme=([^;]*)/);
      if (cookieMatch && (cookieMatch[1] === 'light' || cookieMatch[1] === 'dark')) {
        return cookieMatch[1] as AppTheme;
      }

      // 3. Preferência padrão: tema do navegador do usuário
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'light';
      }
    } catch {
      // Fallback seguro
    }

    return 'dark';
  }

  private initTheme(): void {
    if (typeof window === 'undefined') return;

    // Sincroniza classes no DOM sem persistir escolha forçada
    this.applyThemeToDom(this.theme());

    // Se o usuário NÃO tiver uma escolha salva, escuta mudanças do navegador em tempo real
    try {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.mediaQueryListener = (e: MediaQueryListEvent) => {
        let hasSaved = false;
        try {
          hasSaved = !!localStorage.getItem('opencnpj_theme');
        } catch {}

        if (!hasSaved) {
          const sysTheme: AppTheme = e.matches ? 'dark' : 'light';
          this.setTheme(sysTheme, false);
        }
      };

      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', this.mediaQueryListener);
      } else if ((mediaQuery as any).addListener) {
        (mediaQuery as any).addListener(this.mediaQueryListener);
      }
    } catch {
      // Ignora erro em ambientes restritos
    }
  }

  public toggleTheme(): void {
    const nextTheme: AppTheme = this.theme() === 'dark' ? 'light' : 'dark';

    // Ativa transição suave apenas durante a alternância manual do usuário
    if (typeof document !== 'undefined') {
      document.documentElement.classList.add('theme-transitioning');
    }

    this.setTheme(nextTheme, true);

    if (typeof window !== 'undefined') {
      setTimeout(() => {
        document.documentElement.classList.remove('theme-transitioning');
      }, 350);
    }
  }

  public setTheme(newTheme: AppTheme, persistChoice = true): void {
    this.theme.set(newTheme);

    if (typeof window !== 'undefined') {
      if (persistChoice) {
        try {
          localStorage.setItem('opencnpj_theme', newTheme);
          document.cookie = `opencnpj_theme=${newTheme}; path=/; max-age=31536000; SameSite=Lax`;
        } catch {}
      }

      this.applyThemeToDom(newTheme);
    }
  }

  private applyThemeToDom(targetTheme: AppTheme): void {
    if (typeof document === 'undefined') return;

    const isLight = targetTheme === 'light';
    const root = document.documentElement;
    const body = document.body;

    if (isLight) {
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
      if (body) {
        body.classList.add('light-theme');
        body.classList.remove('dark-theme');
      }
      root.style.colorScheme = 'light';
    } else {
      root.classList.remove('light-theme');
      root.classList.add('dark-theme');
      if (body) {
        body.classList.remove('light-theme');
        body.classList.add('dark-theme');
      }
      root.style.colorScheme = 'dark';
    }

    const meta = document.getElementById('meta-theme-color') || document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', isLight ? '#F8FAFC' : '#0A101C');
    }
  }

  public isLight(): boolean {
    return this.theme() === 'light';
  }
}
