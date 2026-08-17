// src/app/features/student/dashboard/components/weakness-topic-card/weakness-topic-card.component.ts
import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { WeaknessTopicItem } from '../../../../../core/models/student-dashboard.model';

@Component({
  selector: 'draya-weakness-topic-card',
  standalone: true,
  imports: [],
  templateUrl: './weakness-topic-card.component.html',
  styleUrl: './weakness-topic-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeaknessTopicCardComponent {
  readonly topic = input.required<WeaknessTopicItem>();
}
