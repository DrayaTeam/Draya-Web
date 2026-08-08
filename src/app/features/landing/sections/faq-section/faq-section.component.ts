import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

interface FaqItem {
  qKey: string;
  aKey: string;
}

@Component({
  selector: 'draya-faq-section',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './faq-section.component.html',
  styleUrl: './faq-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FaqSectionComponent {
  readonly openFaq = signal<number | null>(null);

  readonly faqItems: FaqItem[] = [
    { qKey: 'LANDING.FAQ.Q1', aKey: 'LANDING.FAQ.A1' },
    { qKey: 'LANDING.FAQ.Q2', aKey: 'LANDING.FAQ.A2' },
    { qKey: 'LANDING.FAQ.Q3', aKey: 'LANDING.FAQ.A3' },
    { qKey: 'LANDING.FAQ.Q4', aKey: 'LANDING.FAQ.A4' },
    { qKey: 'LANDING.FAQ.Q5', aKey: 'LANDING.FAQ.A5' },
  ];

  toggleFaq(idx: number): void {
    this.openFaq.update((curr) => (curr === idx ? null : idx));
  }
}
