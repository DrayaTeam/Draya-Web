// src/app/features/teacher/exams/pending-reviews/pending-reviews.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { TeacherPendingReviewsPageComponent } from './pending-reviews.component';

describe('TeacherPendingReviewsPageComponent', () => {
  let fixture: ComponentFixture<TeacherPendingReviewsPageComponent>;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeacherPendingReviewsPageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideTranslateService(),
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(TeacherPendingReviewsPageComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create and load pending reviews grouped by classroom', () => {
    const req = httpMock.expectOne((r) => r.url.includes('/teachers/pending-reviews'));
    req.flush({
      items: [
        {
          classroomId: 'c1',
          classroomName: 'Web Dev 101',
          exams: [
            {
              examId: 'e1',
              examTitle: 'Midterm',
              pendingReviews: [
                { attemptId: 'a1', studentId: 's1', studentName: 'Ahmed', score: 45 },
              ],
            },
          ],
        },
      ],
      totalCount: 1,
      pageNumber: 1,
      pageSize: 10,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    });

    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.componentInstance.totalPendingCount()).toBe(1);
    expect(fixture.componentInstance.expandedClassroomId()).toBe('c1');
  });

  it('should render an empty state when there is nothing pending', () => {
    const req = httpMock.expectOne((r) => r.url.includes('/teachers/pending-reviews'));
    req.flush({
      items: [],
      totalCount: 0,
      pageNumber: 1,
      pageSize: 10,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.empty-state')).toBeTruthy();
  });

  it('navigates to the attempt-review page when a pending attempt is clicked', () => {
    const req = httpMock.expectOne((r) => r.url.includes('/teachers/pending-reviews'));
    req.flush({
      items: [
        {
          classroomId: 'c1',
          classroomName: 'Web Dev 101',
          exams: [
            {
              examId: 'e1',
              examTitle: 'Midterm',
              pendingReviews: [
                { attemptId: 'a1', studentId: 's1', studentName: 'Ahmed', score: 45 },
              ],
            },
          ],
        },
      ],
      totalCount: 1,
      pageNumber: 1,
      pageSize: 10,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    });
    fixture.detectChanges();

    const navigateSpy = spyOn(router, 'navigate');
    fixture.componentInstance.openAttempt('a1');

    expect(navigateSpy).toHaveBeenCalledWith(['/teacher/attempts', 'a1', 'review']);
  });
});
