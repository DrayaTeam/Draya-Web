import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StudentCoursesService } from '../../../core/services/student-courses.service';
import { SubscribedPackageCardComponent } from './components/subscribed-package-card/subscribed-package-card.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { SubscribedPackage } from '../../../core/models/student-courses.model';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'draya-student-courses',
  standalone: true,
  imports: [CommonModule, SubscribedPackageCardComponent, EmptyStateComponent],
  templateUrl: './student-courses.component.html',
  styleUrl: './student-courses.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentCoursesComponent implements OnInit {
  private readonly coursesService = inject(StudentCoursesService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  readonly headerInfo = this.coursesService.headerInfo;
  readonly packages = this.coursesService.filteredPackages;

  ngOnInit(): void {
    this.coursesService.loadCourses();
  }

  onOpenPackage(pkg: SubscribedPackage): void {
    this.toastService.info('متابعة الباقة', `جارٍ فتح محتوى وفصول ${pkg.title}...`);
    this.router.navigate(['/student/packages', pkg.id]);
  }
}
