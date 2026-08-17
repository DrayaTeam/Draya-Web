import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, query, animate, group } from '@angular/animations';

@Component({
  selector: 'draya-auth-shell',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block w-full min-h-screen' },
  animations: [
    trigger('routeTransition', [
      transition('* <=> *', [
        query(
          ':enter, :leave',
          [
            style({
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              opacity: 1,
            }),
          ],
          { optional: true },
        ),
        query(':enter', [style({ opacity: 0, transform: 'scale(0.98)' })], { optional: true }),
        group([
          query(
            ':leave',
            [animate('300ms ease-in-out', style({ opacity: 0, transform: 'scale(0.98)' }))],
            { optional: true },
          ),
          query(
            ':enter',
            [animate('300ms 150ms ease-in-out', style({ opacity: 1, transform: 'scale(1)' }))],
            { optional: true },
          ),
        ]),
      ]),
    ]),
  ],
  template: `
    <div class="relative flex min-h-screen w-full flex-col overflow-hidden bg-white lg:block">
      <!-- Form Side -->
      <div
        class="relative z-10 flex flex-col overflow-y-auto bg-white px-6 py-8 transition-all duration-700 ease-in-out lg:absolute lg:top-0 lg:bottom-0 lg:w-1/2 lg:px-16 xl:px-24"
        [ngClass]="isLogin() ? 'lg:start-0' : 'lg:start-1/2'">
        <div class="relative m-auto w-full py-8" [@routeTransition]="getRouteAnimationData(outlet)">
          <router-outlet #outlet="outlet"></router-outlet>
        </div>
      </div>

      <!-- Branding / Illustration Side -->
      <div
        class="z-20 hidden flex-col items-center justify-center overflow-hidden bg-[var(--draya-primary-700,#1B6D63)] p-12 text-white transition-all duration-700 ease-in-out lg:absolute lg:top-0 lg:bottom-0 lg:flex lg:w-1/2"
        [ngClass]="isLogin() ? 'lg:start-1/2' : 'lg:start-0'">
        <!-- Decorative Background Circles -->
        <div
          class="pointer-events-none absolute -start-32 -top-32 h-96 w-96 rounded-full bg-white/5"></div>
        <div
          class="pointer-events-none absolute -end-24 -bottom-48 h-[32rem] w-[32rem] rounded-full bg-white/5"></div>

        <!-- Faint Floating Icons -->
        <svg
          class="absolute start-1/4 top-1/4 h-8 w-8 -rotate-12 text-white/10"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M12 14l9-5-9-5-9 5 9 5z" />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
        </svg>
        <svg
          class="absolute end-1/4 top-1/3 h-10 w-10 rotate-12 text-white/10"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
        <svg
          class="absolute start-1/3 bottom-1/4 h-6 w-6 -rotate-45 text-white/10"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
        <svg
          class="absolute end-1/3 bottom-1/3 h-8 w-8 rotate-45 text-white/10"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <svg
          class="absolute end-12 bottom-1/2 h-6 w-6 text-white/10"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>

        <!-- Top Right Logo -->
        <div class="absolute end-10 top-10 flex items-center gap-3">
          <span class="text-2xl font-bold">دراية</span>
          <div class="rounded-lg border border-white/30 p-2 text-white">
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M12 3L1 9L5 11.18V17.18L12 21L19 17.18V11.18L21 10.09V17H23V9L12 3ZM18.82 9L12 12.72L5.18 9L12 5.28L18.82 9Z" />
            </svg>
          </div>
        </div>

        <div class="z-10 w-full max-w-lg text-start">
          <div
            class="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
            ✨ الجيل الجديد من تكنولوجيا التعليم
          </div>
          <h1 class="mb-4 text-4xl leading-tight font-bold lg:text-5xl">
            أسهل طريقة لإنشاء
            <br />
            وتصحيح الامتحانات بالذكاء
            <br />
            الاصطناعي
          </h1>
          <p class="text-lg leading-relaxed font-light text-white/80">
            وفر ساعات من العمل الورقي واستمتع بتحليلات دقيقة لأداء الطلاب مصممة خصيصاً لمراكز الدروس
            الخصوصية في مصر.
          </p>
        </div>
      </div>
    </div>
  `,
})
export class AuthShellComponent {
  private router = inject(Router);
  protected isLogin = signal(true);

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((event) => {
        this.isLogin.set((event as NavigationEnd).urlAfterRedirects.includes('/login'));
      });

    this.isLogin.set(this.router.url.includes('/login'));
  }

  getRouteAnimationData(outlet: RouterOutlet): string {
    return outlet?.activatedRouteData?.['animation'] || this.router.url;
  }
}
