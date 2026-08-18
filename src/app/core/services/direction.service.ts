import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { PrimeNG } from 'primeng/config';

@Injectable({ providedIn: 'root' })
export class DirectionService {
  private readonly translate = inject(TranslateService);
  private readonly primeNG = inject(PrimeNG);
  private readonly platformId = inject(PLATFORM_ID);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.translate.onLangChange.subscribe((event) => {
        this.updateDirection(event.lang);
      });

      const currentLangValue =
        typeof this.translate.currentLang === 'function'
          ? (this.translate.currentLang() as string)
          : (this.translate.currentLang as unknown as string);
      const initialLang = currentLangValue || this.translate.getFallbackLang() || 'ar';
      this.updateDirection(initialLang);
    }
  }

  updateDirection(lang: string): void {
    const isRtl = lang === 'ar';
    const dir = isRtl ? 'rtl' : 'ltr';

    if (isPlatformBrowser(this.platformId)) {
      document.documentElement.dir = dir;
      document.documentElement.lang = lang;
      document.body.dir = dir;

      const body = document.body;
      if (isRtl) {
        body.classList.add('font-cairo');
        body.classList.remove('font-inter');
      } else {
        body.classList.add('font-inter');
        body.classList.remove('font-cairo');
      }

      this.primeNG.ripple.set(true);
    }
  }

  init(): void {
    if (isPlatformBrowser(this.platformId)) {
      const currentLangValue =
        typeof this.translate.currentLang === 'function'
          ? (this.translate.currentLang() as string)
          : (this.translate.currentLang as unknown as string);
      const initialLang = currentLangValue || this.translate.getFallbackLang() || 'ar';
      this.updateDirection(initialLang);
    }
  }
}
