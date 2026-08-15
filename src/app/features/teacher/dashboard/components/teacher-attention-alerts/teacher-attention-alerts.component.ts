// src/app/features/teacher/dashboard/components/teacher-attention-alerts/teacher-attention-alerts.component.ts
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'draya-teacher-attention-alerts',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './teacher-attention-alerts.component.html',
  styleUrl: './teacher-attention-alerts.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeacherAttentionAlertsComponent {}
