// src/app/features/teacher/dashboard/components/teacher-pending-reviews/teacher-pending-reviews.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { TeacherPendingReviewsComponent } from './teacher-pending-reviews.component';

describe('TeacherPendingReviewsComponent', () => {
  let fixture: ComponentFixture<TeacherPendingReviewsComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeacherPendingReviewsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideTranslateService(),
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(TeacherPendingReviewsComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create and load pending reviews', () => {
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
    expect(compiled.querySelector('.empty-row')).toBeTruthy();
  });
});
