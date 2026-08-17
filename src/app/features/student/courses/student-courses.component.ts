// src/app/features/student/courses/student-courses.component.ts
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { StudentCoursesService } from '../../../core/services/student-courses.service';
import { SubscribedPackageCardComponent } from './components/subscribed-package-card/subscribed-package-card.component';
import { SubscribedPackage } from '../../../core/models/student-courses.model';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'draya-student-courses',
  standalone: true,
  imports: [SubscribedPackageCardComponent],
  templateUrl: './student-courses.component.html',
  styleUrl: './student-courses.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentCoursesComponent {
  private readonly coursesService = inject(StudentCoursesService);
  private readonly toastService = inject(ToastService);

  readonly headerInfo = this.coursesService.headerInfo;
  readonly packages = this.coursesService.filteredPackages;

  onOpenPackage(pkg: SubscribedPackage): void {
    this.toastService.info('متابعة الباقة', `جارٍ فتح محتوى ${pkg.title}...`);
  }
}
