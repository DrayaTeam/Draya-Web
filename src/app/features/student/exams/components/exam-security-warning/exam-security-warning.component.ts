// src/app/features/student/exams/components/exam-security-warning/exam-security-warning.component.ts

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-exam-security-warning',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exam-security-warning.component.html',
  styleUrl: './exam-security-warning.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExamSecurityWarningComponent {}
