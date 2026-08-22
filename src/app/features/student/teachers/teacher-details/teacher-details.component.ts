// src/app/features/student/teachers/teacher-details/teacher-details.component.ts
import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  StudentEnrollmentService,
  TeacherDetailsView,
} from '../../../../core/services/student-enrollment.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'draya-teacher-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './teacher-details.component.html',
  styleUrl: './teacher-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeacherDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly enrollmentService = inject(StudentEnrollmentService);
  private readonly toast = inject(ToastService);

  readonly loading = signal<boolean>(true);
  readonly teacher = signal<TeacherDetailsView | null>(null);
  readonly defaultAvatar = 'assets/images/default-teacher-avatar.svg';

  onAvatarError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target && target.src !== this.defaultAvatar) {
      target.src = this.defaultAvatar;
    }
  }

  ngOnInit(): void {
    const teacherId = this.route.snapshot.paramMap.get('id') || 'tch-1';
    this.enrollmentService.getTeacherDetails(teacherId).subscribe({
      next: (data) => {
        this.teacher.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  onSelectPackage(pkgId: string): void {
    this.router.navigate(['/student/packages', pkgId]);
  }
}
