import { Injectable, signal, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly _isDarkMode = signal<boolean>(false);
  readonly isDarkMode = this._isDarkMode.asReadonly();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      const savedTheme = localStorage.getItem('draya_theme');
      if (savedTheme === 'dark') {
        this._isDarkMode.set(true);
        document.documentElement.classList.add('dark');
      }
    }
  }

  toggleTheme(): void {
    if (isPlatformBrowser(this.platformId)) {
      const isDark = !this._isDarkMode();
      this._isDarkMode.set(isDark);
      
      if (isDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('draya_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('draya_theme', 'light');
      }
    }
  }
}
