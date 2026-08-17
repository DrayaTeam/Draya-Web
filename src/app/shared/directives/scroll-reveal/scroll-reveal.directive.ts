// src/app/shared/directives/scroll-reveal/scroll-reveal.directive.ts
import { Directive, ElementRef, inject, OnInit, OnDestroy } from '@angular/core';

@Directive({
  selector: '[drayaScrollReveal]',
  standalone: true,
})
export class ScrollRevealDirective implements OnInit, OnDestroy {
  private readonly el = inject(ElementRef);
  private observer?: IntersectionObserver;

  ngOnInit(): void {
    const target = this.el.nativeElement as HTMLElement;
    target.classList.add('scroll-reveal-init');

    if (typeof IntersectionObserver !== 'undefined') {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              target.classList.add('scroll-reveal-visible');
              this.observer?.unobserve(target);
            }
          });
        },
        { threshold: 0.08, rootMargin: '0px 0px -40px 0px' },
      );
      this.observer.observe(target);
    } else {
      target.classList.add('scroll-reveal-visible');
    }
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
