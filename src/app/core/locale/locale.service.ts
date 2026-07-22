// src/app/core/locale/locale.service.ts
// Purpose: Manages locale/language switching for the Draya RTL-first platform.
// Toggles between Arabic (RTL) and English (LTR), persisting the user's choice
// to localStorage. Sets document.documentElement.dir and lang attributes on change.
// Exposes a signal `locale()` consumed by components and TranslateService.

import { Injectable, signal, effect } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type SupportedLocale = 'ar' | 'en';

const LOCALE_KEY = 'draya_locale';
const DEFAULT_LOCALE: SupportedLocale = 'ar'; // Arabic-first platform

@Injectable({ providedIn: 'root' })
export class LocaleService {
  /** Reactive signal of the current locale. Components subscribe to this. */
  readonly locale = signal<SupportedLocale>(this.loadPersistedLocale());

  constructor(private readonly translate: TranslateService) {
    // Bootstrap ngx-translate with the supported languages. Default lang is set in app.config.ts.
    this.translate.addLangs(['ar', 'en']);

    // Apply the initial locale (DOM attributes + translation language).
    this.applyLocale(this.locale());

    // Reactively apply locale changes whenever the signal updates.
    effect(() => {
      this.applyLocale(this.locale());
    });
  }

  /** Toggles between 'ar' and 'en'. */
  toggle(): void {
    this.setLocale(this.locale() === 'ar' ? 'en' : 'ar');
  }

  /** Sets a specific locale and persists it. */
  setLocale(locale: SupportedLocale): void {
    this.locale.set(locale);
    localStorage.setItem(LOCALE_KEY, locale);
  }

  /** True when the current locale is RTL (Arabic). */
  get isRtl(): boolean {
    return this.locale() === 'ar';
  }

  private applyLocale(locale: SupportedLocale): void {
    const dir = locale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = locale;
    this.translate.use(locale);
  }

  private loadPersistedLocale(): SupportedLocale {
    const stored = localStorage.getItem(LOCALE_KEY);
    return stored === 'en' ? 'en' : DEFAULT_LOCALE;
  }
}
