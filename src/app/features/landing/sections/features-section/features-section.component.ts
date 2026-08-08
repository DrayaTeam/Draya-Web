import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

interface Feature {
  tagKey: string;
  titleKey: string;
  descKey: string;
  items: string[];
  photo: string;
  isAi: boolean;
}

@Component({
  selector: 'draya-features-section',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './features-section.component.html',
  styleUrl: './features-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeaturesSectionComponent {
  readonly features: Feature[] = [
    {
      tagKey: 'LANDING.FEATURES.F1_TAG',
      titleKey: 'LANDING.FEATURES.F1_TITLE',
      descKey: 'LANDING.FEATURES.F1_DESC',
      items: ['LANDING.FEATURES.F1_I1', 'LANDING.FEATURES.F1_I2', 'LANDING.FEATURES.F1_I3'],
      photo:
        'https://images.unsplash.com/photo-1509062522246-3755977927d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=800',
      isAi: false,
    },
    {
      tagKey: 'LANDING.FEATURES.F2_TAG',
      titleKey: 'LANDING.FEATURES.F2_TITLE',
      descKey: 'LANDING.FEATURES.F2_DESC',
      items: ['LANDING.FEATURES.F2_I1', 'LANDING.FEATURES.F2_I2', 'LANDING.FEATURES.F2_I3'],
      photo:
        'https://images.unsplash.com/photo-1741699427768-fbb97fc21425?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=800',
      isAi: false,
    },
    {
      tagKey: 'LANDING.FEATURES.F3_TAG',
      titleKey: 'LANDING.FEATURES.F3_TITLE',
      descKey: 'LANDING.FEATURES.F3_DESC',
      items: ['LANDING.FEATURES.F3_I1', 'LANDING.FEATURES.F3_I2', 'LANDING.FEATURES.F3_I3'],
      photo:
        'https://images.unsplash.com/photo-1509869175650-a1d97972541a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=800',
      isAi: true,
    },
  ];
}
