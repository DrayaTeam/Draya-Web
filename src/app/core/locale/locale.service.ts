import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { DirectionService } from '../services/direction.service';
import { firstValueFrom } from 'rxjs';

export type SupportedLocale = 'ar' | 'en';

const LOCALE_KEY = 'draya_locale';
const DEFAULT_LOCALE: SupportedLocale = 'ar';

@Injectable({ providedIn: 'root' })
export class LocaleService {
  private readonly translate = inject(TranslateService);
  private readonly directionService = inject(DirectionService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly locale = signal<SupportedLocale>(this.loadPersistedLocale());

  constructor() {
    const initialLang = this.locale();
    this.translate.addLangs(['ar', 'en']);
    this.translate.setFallbackLang(DEFAULT_LOCALE);
    this.translate.use(initialLang);
    this.directionService.updateDirection(initialLang);
  }

  async init(): Promise<void> {
    this.translate.addLangs(['ar', 'en']);
    this.translate.setFallbackLang(DEFAULT_LOCALE);

    const initialLang = this.locale();
    this.directionService.updateDirection(initialLang);
    try {
      await firstValueFrom(this.translate.use(initialLang));
    } catch {
      // Fallback in case of offline/test mode
    }
  }

  toggle(): void {
    this.setLocale(this.locale() === 'ar' ? 'en' : 'ar');
  }

  setLocale(locale: SupportedLocale): void {
    this.locale.set(locale);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(LOCALE_KEY, locale);
    }
    this.translate.use(locale);
    this.directionService.updateDirection(locale);
  }

  get isRtl(): boolean {
    return this.locale() === 'ar';
  }

  private loadPersistedLocale(): SupportedLocale {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem(LOCALE_KEY);
      return stored === 'en' ? 'en' : DEFAULT_LOCALE;
    }
    return DEFAULT_LOCALE;
  }
}
