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
});
