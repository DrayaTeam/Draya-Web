// src/app/app.config.ts
// Purpose: Root application configuration (Angular standalone bootstrap).
// Registers all application-wide providers in one place:
//   - Router with lazy-loaded routes and component input binding
//   - HttpClient with functional interceptors (auth JWT + global error handling)
//   - Angular animations (required by PrimeNG components)
//   - PrimeNG in unstyled mode with the Aura preset
//   - ngx-translate (HttpLoader pointed at /assets/i18n/)
// No NgModules — all providers use the functional/standalone provider APIs.

import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import {
  provideHttpClient,
  withInterceptors,
  HttpClient,
} from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

import { appRoutes } from './app.routes';
import { authInterceptor } from './core/auth/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

/** Factory for ngx-translate's HttpLoader — loads JSON files from /assets/i18n/. */


export const appConfig: ApplicationConfig = {
  providers: [
    // Angular change detection (zoneless-ready via event coalescing)
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Router: lazy-loaded routes + `routerLink` inputs bound as component inputs
    provideRouter(appRoutes, withComponentInputBinding()),

    // HttpClient: auth interceptor attaches JWT; error interceptor handles 401/5xx
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),

    // Angular animations — required by PrimeNG overlay components (Dialog, Drawer, etc.)
    provideAnimationsAsync(),

    // PrimeNG: unstyled mode with Aura preset.
    // Unstyled = no PrimeNG CSS — all component styling is done via Tailwind utilities.
    // The Aura preset provides the component structure tokens that tailwindcss-primeui bridges.
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          // Prefix for PrimeNG CSS variable tokens (avoids collisions with Draya's --draya-* vars)
          prefix: 'p',
          // Use system dark mode detection (respects OS preference)
          darkModeSelector: '.dark',
          // CSS layer so Tailwind utilities can override PrimeNG defaults
          cssLayer: {
            name: 'primeng',
            order: 'tailwind-base, primeng, tailwind-utilities',
          },
        },
      },
      ripple: true,
    }),

    // ngx-translate: loads /assets/i18n/{locale}.json via HttpClient.
    // LocaleService (core/locale/locale.service.ts) bootstraps the initial language on startup.
    provideTranslateService({
      fallbackLang: 'ar',
      loader: provideTranslateHttpLoader({
        prefix: '/assets/i18n/',
        suffix: '.json',
      }),
    }),
  ],
};
