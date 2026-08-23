import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { TeacherUrgentAlert } from '../../../models/teacher-dashboard.model';

@Component({
  selector: 'draya-teacher-attention-alerts',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './teacher-attention-alerts.component.html',
  styleUrl: './teacher-attention-alerts.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeacherAttentionAlertsComponent {
  readonly alerts = input<TeacherUrgentAlert[]>([]);
}
