import { Component, ChangeDetectionStrategy } from '@angular/core';
import { LandingNavbarComponent } from './sections/landing-navbar/landing-navbar.component';
import { HeroSectionComponent } from './sections/hero-section/hero-section.component';
import { TrustedByComponent } from './sections/trusted-by/trusted-by.component';
import { WhySectionComponent } from './sections/why-section/why-section.component';
import { FeaturesSectionComponent } from './sections/features-section/features-section.component';
import { PricingSectionComponent } from './sections/pricing-section/pricing-section.component';
import { TestimonialsSectionComponent } from './sections/testimonials-section/testimonials-section.component';
import { FaqSectionComponent } from './sections/faq-section/faq-section.component';
import { CtaSectionComponent } from './sections/cta-section/cta-section.component';
import { LandingFooterComponent } from './sections/landing-footer/landing-footer.component';
import { ScrollRevealDirective } from '../../shared/directives/scroll-reveal/scroll-reveal.directive';

@Component({
  selector: 'draya-landing',
  standalone: true,
  imports: [
    LandingNavbarComponent,
    HeroSectionComponent,
    TrustedByComponent,
    WhySectionComponent,
    FeaturesSectionComponent,
    PricingSectionComponent,
    TestimonialsSectionComponent,
    FaqSectionComponent,
    CtaSectionComponent,
    LandingFooterComponent,
    ScrollRevealDirective,
  ],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingComponent {}
