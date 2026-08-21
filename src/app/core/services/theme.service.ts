import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const THEME_KEY = 'theme';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  readonly isDarkMode = signal<boolean>(false);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const savedTheme = localStorage.getItem(THEME_KEY);
      const initialDark = savedTheme === 'dark';
      this.isDarkMode.set(initialDark);
      this.applyTheme(initialDark);
    }
  }

  toggleTheme(): void {
    const nextDark = !this.isDarkMode();
    this.setDarkMode(nextDark);
  }

  setDarkMode(dark: boolean): void {
    this.isDarkMode.set(dark);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
      this.applyTheme(dark);
    }
  }

  init(): void {
    if (isPlatformBrowser(this.platformId)) {
      const savedTheme = localStorage.getItem(THEME_KEY);
      const initialDark = savedTheme === 'dark';
      this.setDarkMode(initialDark);
    }
  }

  private applyTheme(dark: boolean): void {
    if (isPlatformBrowser(this.platformId)) {
      if (dark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }
}
