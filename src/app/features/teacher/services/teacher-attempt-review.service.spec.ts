// src/app/features/teacher/services/teacher-attempt-review.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TeacherAttemptReviewService } from './teacher-attempt-review.service';

describe('TeacherAttemptReviewService', () => {
  let service: TeacherAttemptReviewService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TeacherAttemptReviewService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should extract .items from the PagedResult envelope returned by /teachers/pending-reviews', () => {
    // Confirmed with backend: this endpoint returns PagedResult<PendingReviewClassroomDto>,
    // i.e. the classrooms live under `.items`, not at the response root. Calling
    // .reduce() on the root object used to crash the dashboard with
    // "t.reduce is not a function" before this was unwrapped.
    let result: unknown[] = [];
    service.getPendingReviews().subscribe((res) => (result = res));

    const req = httpMock.expectOne((r) => r.url.includes('/teachers/pending-reviews'));
    expect(req.request.method).toBe('GET');
    req.flush({
      items: [{ classroomId: 'c1', classroomName: 'Web Dev', exams: [] }],
      totalCount: 1,
      pageNumber: 1,
      pageSize: 10,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    });

    expect(result).toEqual([{ classroomId: 'c1', classroomName: 'Web Dev', exams: [] }]);
  });

  it('should return an empty list (not throw) when pending reviews fails', () => {
    let result: unknown[] = ['sentinel'];
    service.getPendingReviews().subscribe((res) => (result = res));

    const req = httpMock.expectOne((r) => r.url.includes('/teachers/pending-reviews'));
    req.flush({ message: 'boom' }, { status: 500, statusText: 'Server Error' });

    expect(result).toEqual([]);
  });

  it('should normalize a malformed/empty pending reviews response to an array', () => {
    let result: unknown[] = ['sentinel'];
    service.getPendingReviews().subscribe((res) => (result = res));

    const req = httpMock.expectOne((r) => r.url.includes('/teachers/pending-reviews'));
    req.flush(null);

    expect(result).toEqual([]);
  });

  it('should fetch attempt results from /attempts/{attemptId}/results', () => {
    let result: unknown = null;
    service.getAttemptResults('att-1').subscribe((res) => (result = res));

    const req = httpMock.expectOne((r) => r.url.includes('/attempts/att-1/results'));
    expect(req.request.method).toBe('GET');
    req.flush({ attemptId: 'att-1', finalScore: 80, answers: [] });

    expect((result as { attemptId?: string })?.attemptId).toBe('att-1');
  });

  it('should PUT the override score and return true on success', () => {
    let result = false;
    service.overrideAnswerScore('att-1', 'ans-1', 4.5).subscribe((res) => (result = res));

    const req = httpMock.expectOne((r) => r.url.includes('/attempts/att-1/answers/ans-1/override'));
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ newScore: 4.5 });
    req.flush(null);

    expect(result).toBeTrue();
  });

  it('should return false (not throw) when the override request fails', () => {
    let result = true;
    service.overrideAnswerScore('att-1', 'ans-1', 4.5).subscribe((res) => (result = res));

    const req = httpMock.expectOne((r) => r.url.includes('/attempts/att-1/answers/ans-1/override'));
    req.flush({ message: 'boom' }, { status: 404, statusText: 'Not Found' });

    expect(result).toBeFalse();
  });
});
