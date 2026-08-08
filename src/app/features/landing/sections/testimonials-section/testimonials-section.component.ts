import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

interface Testimonial {
  quoteKey: string;
  nameKey: string;
  roleKey: string;
  centerKey: string;
  avatarUrl: string;
  initials: string;
}

@Component({
  selector: 'draya-testimonials-section',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './testimonials-section.component.html',
  styleUrl: './testimonials-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestimonialsSectionComponent {
  readonly testimonials: Testimonial[] = [
    {
      quoteKey: 'LANDING.TESTIMONIALS.T1_QUOTE',
      nameKey: 'LANDING.TESTIMONIALS.T1_NAME',
      roleKey: 'LANDING.TESTIMONIALS.T1_ROLE',
      centerKey: 'LANDING.TESTIMONIALS.T1_CENTER',
      avatarUrl:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=faces&fit=crop&w=200&h=200&q=80',
      initials: 'أس',
    },
    {
      quoteKey: 'LANDING.TESTIMONIALS.T2_QUOTE',
      nameKey: 'LANDING.TESTIMONIALS.T2_NAME',
      roleKey: 'LANDING.TESTIMONIALS.T2_ROLE',
      centerKey: 'LANDING.TESTIMONIALS.T2_CENTER',
      avatarUrl:
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?crop=faces&fit=crop&w=200&h=200&q=80',
      initials: 'سم',
    },
    {
      quoteKey: 'LANDING.TESTIMONIALS.T3_QUOTE',
      nameKey: 'LANDING.TESTIMONIALS.T3_NAME',
      roleKey: 'LANDING.TESTIMONIALS.T3_ROLE',
      centerKey: 'LANDING.TESTIMONIALS.T3_CENTER',
      avatarUrl:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?crop=faces&fit=crop&w=200&h=200&q=80',
      initials: 'مع',
    },
  ];

  onAvatarError(event: Event, initials: string): void {
    const target = event.target as HTMLImageElement;
    target.style.display = 'none';
    const parent = target.parentElement;
    if (parent) {
      parent.textContent = initials;
      parent.style.fontSize = '0.875rem';
      parent.style.fontWeight = '700';
      parent.style.color = '#1B6D63';
    }
  }
}
