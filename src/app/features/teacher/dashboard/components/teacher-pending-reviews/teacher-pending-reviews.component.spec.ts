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

  it('should create and count pending reviews across all classrooms/exams', () => {
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
                { attemptId: 'a2', studentId: 's2', studentName: 'Sara', score: 60 },
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
    expect(fixture.componentInstance.totalPendingCount()).toBe(2);
  });

  it('is always a link to the full pending-reviews page, regardless of count', () => {
    // Regression test: this card used to be a classroom/exam/attempt
    // accordion embedded directly in the sidebar. It must now always be a
    // single link out to /teacher/pending-reviews — clicking an item never
    // toggles anything in place anymore.
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

    const link = fixture.nativeElement.querySelector('a.pending-reviews-nav-card');
    expect(link).toBeTruthy();
    expect(link.getAttribute('href')).toBe('/teacher/pending-reviews');

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.empty-row')).toBeTruthy();
  });
});
