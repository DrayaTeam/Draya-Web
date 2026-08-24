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

  it('should call the confirmed lowercase /weaknesses/active endpoint', () => {
    service.loadActiveWeaknesses().subscribe();
    const req = httpMock.expectOne((r) => r.url.includes('/weaknesses/active'));
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should read currentProficiencyPercent (the real wire field), not proficiencyPercent', () => {
    // Regression test: swagger confirms WeaknessDto sends currentProficiencyPercent,
    // not proficiencyPercent. Reading the wrong field name silently produced 0%
    // for every single active weakness regardless of the real score.
    service.loadActiveWeaknesses().subscribe();
    const req = httpMock.expectOne((r) => r.url.includes('/weaknesses/active'));
    req.flush([
      { id: 'w1', topicId: 't1', topicName: 'التفاضل', currentProficiencyPercent: 42.6 },
      { id: 'w2', topicId: 't2', topicName: 'الديناميكا', currentProficiencyPercent: 30 },
    ]);

    const list = service.activeWeaknesses();
    expect(list.length).toBe(2);
    expect(list[0].proficiencyPercent).toBe(43);
    expect(list[1].proficiencyPercent).toBe(30);
    expect(service.isLoadingActive()).toBeFalse();
  });

  it('should call the confirmed lowercase /weaknesses/resolved endpoint and map delta/previousProficiencyPercent', () => {
    service.loadResolvedWeaknesses().subscribe();
    const req = httpMock.expectOne((r) => r.url.includes('/weaknesses/resolved'));
    req.flush([
      {
        id: 'w3',
        topicId: 't3',
        topicName: 'الجبر',
        currentProficiencyPercent: 90,
        previousProficiencyPercent: 47,
        delta: 43,
      },
    ]);

    const list = service.resolvedWeaknesses();
    expect(list.length).toBe(1);
    expect(list[0].proficiencyPercent).toBe(90);
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
    const req = httpMock.expectOne((r) => r.url.includes('/weaknesses/active'));
    req.flush({ message: 'boom' }, { status: 500, statusText: 'Server Error' });

    expect(service.activeWeaknesses()).toEqual([]);
    expect(service.isLoadingActive()).toBeFalse();
  });

  it('should fetch weakness progression history from /weaknesses/{id}/history', () => {
    let result: unknown[] = [];
    service.getWeaknessHistory('w1').subscribe((res) => (result = res));

    const req = httpMock.expectOne((r) => r.url.includes('/weaknesses/w1/history'));
    expect(req.request.method).toBe('GET');
    req.flush([
      {
        historyId: 'h1',
        previousProficiencyPercent: 40,
        newProficiencyPercent: 60,
        previousIsActive: true,
        newIsActive: true,
        createdAt: '2026-08-01T00:00:00Z',
      },
    ]);

    expect(result.length).toBe(1);
  });

  it('should return an empty history list (not throw) when the request fails', () => {
    let result: unknown[] = [{ sentinel: true }];
    service.getWeaknessHistory('w1').subscribe((res) => (result = res));

    const req = httpMock.expectOne((r) => r.url.includes('/weaknesses/w1/history'));
    req.flush({ message: 'boom' }, { status: 404, statusText: 'Not Found' });

    expect(result).toEqual([]);
  });
});
