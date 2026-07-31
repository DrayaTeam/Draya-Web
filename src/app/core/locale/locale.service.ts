import { Injectable, signal, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

export type SupportedLocale = 'ar' | 'en';

const LOCALE_KEY = 'draya_locale';
const DEFAULT_LOCALE: SupportedLocale = 'ar';

@Injectable({ providedIn: 'root' })
export class LocaleService {
  private readonly translate = inject(TranslateService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly locale = signal<SupportedLocale>(this.loadPersistedLocale());

  constructor() {
    this.translate.addLangs(['ar', 'en']);
    this.translate.setDefaultLang(DEFAULT_LOCALE);

    // Apply the initial locale
    this.applyLocale(this.locale());

    // Reactively apply locale changes
    effect(() => {
      this.applyLocale(this.locale());
    });
  }

  toggle(): void {
    this.setLocale(this.locale() === 'ar' ? 'en' : 'ar');
  }

  setLocale(locale: SupportedLocale): void {
    this.locale.set(locale);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(LOCALE_KEY, locale);
    }
  }

  get isRtl(): boolean {
    return this.locale() === 'ar';
  }

  private applyLocale(locale: SupportedLocale): void {
    this.translate.use(locale);
  }

  private loadPersistedLocale(): SupportedLocale {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem(LOCALE_KEY);
      return stored === 'en' ? 'en' : DEFAULT_LOCALE;
    }
    return DEFAULT_LOCALE;
  }
}
