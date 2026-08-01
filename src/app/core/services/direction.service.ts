import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { PrimeNGConfig } from 'primeng/config';

@Injectable({ providedIn: 'root' })
export class DirectionService {
  private readonly translate = inject(TranslateService);
  private readonly primeNGConfig = inject(PrimeNGConfig);
  private readonly platformId = inject(PLATFORM_ID);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.translate.onLangChange.subscribe((event) => {
        this.updateDirection(event.lang);
      });

      this.updateDirection(this.translate.currentLang || this.translate.defaultLang || 'ar');
    }
  }

  private updateDirection(lang: string): void {
    const isRtl = lang === 'ar';
    const dir = isRtl ? 'rtl' : 'ltr';

    document.documentElement.dir = dir;
    document.documentElement.lang = lang;

    const body = document.body;
    if (isRtl) {
      body.classList.add('font-cairo');
      body.classList.remove('font-inter');
    } else {
      body.classList.add('font-inter');
      body.classList.remove('font-cairo');
    }

    // Align PrimeNG ripple and dynamic states
    this.primeNGConfig.ripple.set(true);
  }

  init(): void {
    void this.translate.currentLang;
  }
}


