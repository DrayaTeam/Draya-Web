// src/app/features/student/teachers/components/teacher-card/teacher-card.component.ts
import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { TeacherDirectoryItem } from '../../../../../core/models/teacher.model';

@Component({
  selector: 'draya-teacher-card',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './teacher-card.component.html',
  styleUrl: './teacher-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeacherCardComponent {
  readonly teacher = input.required<TeacherDirectoryItem>();

  readonly viewPackages = output<TeacherDirectoryItem>();

  onViewPackages(): void {
    this.viewPackages.emit(this.teacher());
  }
}
