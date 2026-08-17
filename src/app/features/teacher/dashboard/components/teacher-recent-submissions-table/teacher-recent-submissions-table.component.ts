// src/app/features/teacher/dashboard/components/teacher-recent-submissions-table/teacher-recent-submissions-table.component.ts
import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { RecentSubmission } from '../../../models/teacher-dashboard.model';

@Component({
  selector: 'draya-teacher-recent-submissions-table',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './teacher-recent-submissions-table.component.html',
  styleUrl: './teacher-recent-submissions-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeacherRecentSubmissionsTableComponent {
  readonly submissions = input.required<RecentSubmission[]>();
}
