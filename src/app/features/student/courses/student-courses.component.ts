import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  signal,
  computed,
} from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StudentCoursesService } from '../../../core/services/student-courses.service';
import { SubscribedPackageCardComponent } from './components/subscribed-package-card/subscribed-package-card.component';
import { DrayaEmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { DrayaCardSkeletonComponent } from '../../../shared/components/card-skeleton/card-skeleton.component';
import { DrayaPaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { SubscribedPackage } from '../../../core/models/student-courses.model';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'draya-student-courses',
  standalone: true,
  imports: [
    CommonModule,
    SubscribedPackageCardComponent,
    DrayaEmptyStateComponent,
    DrayaCardSkeletonComponent,
    DrayaPaginationComponent,
  ],
  templateUrl: './student-courses.component.html',
  styleUrl: './student-courses.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentCoursesComponent implements OnInit {
  protected readonly coursesService = inject(StudentCoursesService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  readonly headerInfo = this.coursesService.headerInfo;
  readonly packages = this.coursesService.filteredPackages;
  readonly loading = this.coursesService.loading;

  // Pagination
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(8);

  readonly paginatedPackages = computed(() => {
    const list = this.packages();
    const start = (this.currentPage() - 1) * this.pageSize();
    return list.slice(start, start + this.pageSize());
  });

  ngOnInit(): void {
    this.coursesService.loadCourses();
  }

  onOpenPackage(pkg: SubscribedPackage): void {
    this.toastService.info('متابعة الباقة', `جارٍ فتح محتوى وفصول ${pkg.title}...`);
    this.router.navigate(['/student/packages', pkg.id]);
  }
}
