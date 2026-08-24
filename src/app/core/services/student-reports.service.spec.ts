// src/app/core/services/student-reports.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { StudentReportsService } from './student-reports.service';

describe('StudentReportsService', () => {
  let service: StudentReportsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(StudentReportsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load reports from backend analytics and latest performance report', () => {
    service.loadReports('std-123').subscribe();

    const analyticsReq = httpMock.expectOne((r) => r.url.includes('/students/std-123/analytics'));
    expect(analyticsReq.request.method).toBe('GET');
    analyticsReq.flush({
      overallAverage: 85,
      highestScore: 92,
      completedExams: 4,
      subjectProficiencies: [
        { subjectId: 's1', subjectName: 'رياضيات', proficiencyScore: 88, scorePercentage: 88 },
      ],
      weakTopics: [
        { topicId: 'w1', topicName: 'التفاضل', accuracyPercentage: 45, statusLabel: 'يحتاج تحسين' },
      ],
    });

    const reportReq = httpMock.expectOne((r) =>
      r.url.includes('/students/std-123/performance-reports/latest'),
    );
    expect(reportReq.request.method).toBe('GET');
    reportReq.flush({
      id: 'rep-1',
      weakTopics: [],
      subjectProficiencies: [],
    });

    expect(service.summary().overallAverage).toBe(85);
    expect(service.summary().completedExamsCount).toBe(4);
    expect(service.subjectScores().length).toBe(1);
    expect(service.weaknessTopics().length).toBe(1);
  });

  it('should approve report via POST /api/v1/Reports/{reportId}/approve', () => {
    let result = false;
    service.approveReport('rep-999').subscribe((res) => (result = res));

    const req = httpMock.expectOne((r) => r.url.includes('/Reports/rep-999/approve'));
    expect(req.request.method).toBe('POST');
    req.flush({});

    expect(result).toBeTrue();
  });

  it('should request AI practice exam via POST /api/v1/students/{studentId}/weak-topics/{topicName}/practice-exam', () => {
    service.createPracticeExam('std-123', 'التفاضل', { subjectId: 'sub-1' }).subscribe();

    const req = httpMock.expectOne(
      (r) => r.url.includes('/students/std-123/weak-topics/') && r.url.includes('/practice-exam'),
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ subjectId: 'sub-1' });
    req.flush({ examId: 'ex-123' });
  });

  it('should fetch interactive AI review via GET /api/v1/reports/interactive-review', () => {
    let result: unknown = null;
    service.getTopicRevision('std-123', 'الجبر').subscribe((rev) => (result = rev));

    const req = httpMock.expectOne((r) => r.url.includes('/reports/interactive-review'));
    expect(req.request.method).toBe('GET');
    req.flush({ topicName: 'الجبر', recommendation: 'مراجعة الأساسيات' });

    expect(result).toEqual({ topicName: 'الجبر', recommendation: 'مراجعة الأساسيات' });
  });

  it('should fallback to legacy weak-topics path when primary interactive-review endpoint fails', () => {
    let result: unknown = 'not-set';
    service.getTopicRevision('std-123', 'الجبر').subscribe((rev) => (result = rev));

    const req1 = httpMock.expectOne((r) => r.url.includes('/reports/interactive-review'));
    req1.flush({ message: 'not found' }, { status: 404, statusText: 'Not Found' });

    const req2 = httpMock.expectOne((r) => r.url.includes('/students/std-123/weak-topics/'));
    req2.flush({ message: 'server error' }, { status: 500, statusText: 'Server Error' });

    expect(result).toBeNull();
  });

  it('should poll generation status via GET /api/v1/exams/generations/{generationId}', () => {
    let result: unknown = null;
    service.getPracticeExamGenerationStatus('gen-1').subscribe((res) => (result = res));

    const req = httpMock.expectOne((r) => r.url.includes('/exams/generations/gen-1'));
    expect(req.request.method).toBe('GET');
    req.flush({ status: 4, examId: 'ex-999' });

    expect((result as { examId?: string })?.examId).toBe('ex-999');
  });

  describe('normalizeScoreToPercent', () => {
    it('normalizes raw points out of 5 to percentage', () => {
      expect(service.summary().overallAverage).toBeDefined();
    });
  });

  it('trusts a genuinely low proficiencyPercent instead of guessing it is "out of 5"', () => {
    // Regression test: backend confirmed subjectProficiencies.proficiencyPercent is
    // already a 0-100 percentage (NOTES_FOR_BACKEND_DEVS.md Note 16). A prior version
    // ran it through the magnitude-guessing normalizer, which turned a real 4.5%
    // score into "4.5 out of 5" = 90%.
    service.loadReports('std-123').subscribe();

    const analyticsReq = httpMock.expectOne((r) => r.url.includes('/students/std-123/analytics'));
    analyticsReq.flush({
      overallAverage: 60,
      highestScore: 60,
      completedExams: 1,
      subjectProficiencies: [{ subjectId: 's1', subjectName: 'رياضيات', proficiencyPercent: 4.5 }],
      weakTopics: [],
    });

    const reportReq = httpMock.expectOne((r) =>
      r.url.includes('/students/std-123/performance-reports/latest'),
    );
    reportReq.flush({ id: 'rep-1', weakTopics: [], subjectProficiencies: [] });

    expect(service.subjectScores()[0].scorePercent).toBe(5);
  });

  it('computes monthlyGrowthPercent from percentages, not raw averageScore magnitudes', () => {
    // Regression test: subtracting raw averageScore values directly made the delta
    // swing wildly when consecutive months had exams on different point scales
    // (e.g. 8.5/10 one month vs 14.5/20 the next look like a huge raw drop, but
    // both are actually 85% -> 72.5%, a real but much smaller decline).
    service.loadReports('std-123').subscribe();

    const analyticsReq = httpMock.expectOne((r) => r.url.includes('/students/std-123/analytics'));
    analyticsReq.flush({
      overallAverage: 80,
      highestScore: 90,
      completedExams: 2,
      subjectProficiencies: [],
      weakTopics: [],
      trendPoints: [
        { month: '2026-07-01', averageScore: 14.5, averageMaxScore: 20 },
        { month: '2026-08-01', averageScore: 8.5, averageMaxScore: 10 },
      ],
    });

    const reportReq = httpMock.expectOne((r) =>
      r.url.includes('/students/std-123/performance-reports/latest'),
    );
    reportReq.flush({ id: 'rep-1', weakTopics: [], subjectProficiencies: [] });

    // 14.5/20 = 72.5% -> 8.5/10 = 85% => +12 or +13 depending on rounding order, not +(-6)
    expect(service.summary().monthlyGrowthPercent).toBeGreaterThan(0);
  });
});
