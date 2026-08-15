// src/app/features/student/dashboard/components/upcoming-exam-card/upcoming-exam-card.component.ts
import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { UpcomingExamItem } from '../../../../../core/models/student-dashboard.model';

@Component({
  selector: 'draya-upcoming-exam-card',
  standalone: true,
  imports: [],
  templateUrl: './upcoming-exam-card.component.html',
  styleUrl: './upcoming-exam-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpcomingExamCardComponent {
  readonly exam = input.required<UpcomingExamItem>();
}
