// src/app/core/services/student-weakness.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { StudentWeaknessService } from './student-weakness.service';

describe('StudentWeaknessService', () => {
  let service: StudentWeaknessService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(StudentWeaknessService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load and normalize active weaknesses', () => {
    service.loadActiveWeaknesses().subscribe();
    const req = httpMock.expectOne((r) => r.url.includes('/Weaknesses/active'));
    expect(req.request.method).toBe('GET');
    req.flush([
      { topicName: 'التفاضل', proficiencyPercent: 42.6, subjectName: 'رياضيات' },
      { topicName: 'الديناميكا', proficiencyPercent: 30 },
    ]);

    const list = service.activeWeaknesses();
    expect(list.length).toBe(2);
    expect(list[0].proficiencyPercent).toBe(43);
    expect(list[1].subjectName).toBe('عام');
    expect(service.isLoadingActive()).toBeFalse();
  });

  it('should load resolved weaknesses with delta/previousProficiencyPercent when present', () => {
    service.loadResolvedWeaknesses().subscribe();
    const req = httpMock.expectOne((r) => r.url.includes('/Weaknesses/resolved'));
    req.flush([
      {
        topicName: 'الجبر',
        proficiencyPercent: 90,
        delta: 43,
        previousProficiencyPercent: 47,
      },
    ]);

    const list = service.resolvedWeaknesses();
    expect(list.length).toBe(1);
    expect(list[0].delta).toBe(43);
    expect(list[0].previousProficiencyPercent).toBe(47);
  });

  it('should clear the list (not fabricate content) on error', () => {
    service.activeWeaknesses.set([
      {
        id: 'w1',
        topicName: 'x',
        subjectName: 'y',
        proficiencyPercent: 10,
      },
    ]);
    service.loadActiveWeaknesses().subscribe();
    const req = httpMock.expectOne((r) => r.url.includes('/Weaknesses/active'));
    req.flush({ message: 'boom' }, { status: 500, statusText: 'Server Error' });

    expect(service.activeWeaknesses()).toEqual([]);
    expect(service.isLoadingActive()).toBeFalse();
  });
});
