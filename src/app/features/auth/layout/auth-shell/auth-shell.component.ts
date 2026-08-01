import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'draya-auth-shell',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block w-full min-h-screen' },
  template: `
    <div class="flex min-h-screen w-full bg-white transition-all duration-700 ease-in-out"
         [ngClass]="isLogin() ? 'flex-col lg:flex-row' : 'flex-col lg:flex-row-reverse'">
      
      <!-- Form Side -->
      <div class="flex flex-1 flex-col justify-center px-6 py-12 lg:px-16 xl:px-24 bg-white relative z-10 overflow-y-auto">
        <router-outlet></router-outlet>
      </div>

      <!-- Branding / Illustration Side -->
      <div class="hidden lg:flex lg:w-1/2 bg-[var(--draya-primary-700,#1B6D63)] text-white flex-col justify-center items-center p-12 relative overflow-hidden transition-all duration-700">
        <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 32px 32px;"></div>
        
        <div class="z-10 text-center max-w-lg">
          <div class="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full mb-8 backdrop-blur-sm border border-white/20">
            <span class="text-sm font-medium">✨ الجيل الجديد من تكنولوجيا التعليم</span>
          </div>
          <h1 class="text-4xl lg:text-5xl font-bold leading-tight mb-6">
            أسهل طريقة لإنشاء<br/>وتصحيح الامتحانات بالذكاء<br/>الاصطناعي
          </h1>
          <p class="text-lg text-white/80 leading-relaxed">
            وفر ساعات من العمل الورقي واستمتع بتحليلات دقيقة لأداء الطلاب مصممة خصيصاً لمراكز الدروس الخصوصية في مصر.
          </p>
        </div>
      </div>
      
    </div>
  `
})
export class AuthShellComponent {
  private router = inject(Router);
  protected isLogin = signal(true);

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.isLogin.set(event.urlAfterRedirects.includes('/login'));
    });
    
    this.isLogin.set(this.router.url.includes('/login'));
  }
}
