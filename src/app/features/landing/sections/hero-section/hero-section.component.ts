import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { BlobBgComponent } from '../../../../shared/components/blob-bg/blob-bg.component';

@Component({
  selector: 'draya-hero-section',
  standalone: true,
  imports: [RouterLink, TranslatePipe, BlobBgComponent],
  templateUrl: './hero-section.component.html',
  styleUrl: './hero-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroSectionComponent {
  readonly stats = [
    { val: '92%', labelKey: 'LANDING.HERO.STATS.RATE' },
    { val: '12,000+', labelKey: 'LANDING.HERO.STATS.STUDENTS' },
    { val: '500+', labelKey: 'LANDING.HERO.STATS.ACADEMIES' },
    { val: '1,226+', labelKey: 'LANDING.HERO.STATS.LECTURES' },
  ];

  // Exact original photo URLs from photos.ts
  readonly photos = {
    hero1Primary:
      'https://images.unsplash.com/photo-1752650735119-8929e5f7d1ec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw1fHx5b3VuZyUyMHdvbWFuJTIwc3R1ZGVudCUyMHNtaWxpbmclMjBsYXB0b3AlMjBzdHVkeSUyMGJyaWdodCUyMG1vZGVybnxlbnwxfHx8fDE3ODQ1Nzg4MTZ8MA&ixlib=rb-4.1.0&q=80&w=800',
    hero2Circle:
      'https://images.unsplash.com/photo-1671370819594-5a2dc1fbcd41?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHx1bml2ZXJzaXR5JTIwc3R1ZGVudCUyMHN0dWR5aW5nJTIwbGFwdG9wJTIwbGlicmFyeSUyME1pZGRsZSUyMEVhc3Rlcm58ZW58MXx8fHwxNzg0NTc4ODA4fDA&ixlib=rb-4.1.0&q=80&w=400',
    hero3Square:
      'https://images.unsplash.com/photo-1758270705317-3ef6142d306f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHx1bml2ZXJzaXR5JTIwc3R1ZGVudHMlMjBncm91cCUyMHN0dWR5JTIwY29sbGFib3JhdGlvbiUyMGNsYXNzcm9vbSUyMG1vZGVybnxlbnwxfHx8fDE3ODQ1Nzg4MDl8MA&ixlib=rb-4.1.0&q=80&w=400',
    hero4Blob:
      'https://images.unsplash.com/photo-1756973229712-af48b150e911?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxjb2xsZWdlJTIwc3R1ZGVudCUyMHdvbWFuJTIwaGlqYWIlMjBzdHVkeWluZyUyMGNhbXB1cyUyMHNtaWxpbmd8ZW58MXx8fHwxNzg0NTc4ODA5fDA&ixlib=rb-4.1.0&q=80&w=400',
  };

  scrollToFeatures(): void {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  }
}
