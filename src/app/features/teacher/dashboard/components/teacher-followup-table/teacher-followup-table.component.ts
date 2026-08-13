// src/app/features/teacher/dashboard/components/teacher-followup-table/teacher-followup-table.component.ts
import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { StudentNeedFollowup } from '../../../models/teacher-dashboard.model';

@Component({
  selector: 'draya-teacher-followup-table',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './teacher-followup-table.component.html',
  styleUrl: './teacher-followup-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeacherFollowupTableComponent {
  readonly students = input.required<StudentNeedFollowup[]>();
}
