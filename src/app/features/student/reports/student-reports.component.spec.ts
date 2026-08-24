// src/app/features/student/reports/student-reports.component.spec.ts

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StudentReportsComponent } from './student-reports.component';
import { ToastService } from '../../../core/services/toast.service';
import { MessageService } from 'primeng/api';

import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { StudentReportsService } from '../../../core/services/student-reports.service';
import { StudentWeaknessService } from '../../../core/services/student-weakness.service';
import { AuthService } from '../../auth/services/auth.service';
import { User } from '../../../core/models/user.model';

describe('StudentReportsComponent', () => {
  let component: StudentReportsComponent;
  let fixture: ComponentFixture<StudentReportsComponent>;
  let reportsService: StudentReportsService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentReportsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideTranslateService(),
        MessageService,
        ToastService,
        StudentReportsService,
      ],
    }).compileComponents();

    reportsService = TestBed.inject(StudentReportsService);
    spyOn(reportsService, 'loadReports').and.returnValue(of(true));
    reportsService.isLoading.set(false);

    const authService = TestBed.inject(AuthService);
    spyOn(authService, 'currentUser').and.returnValue({ userId: 'std-123' } as User);

    fixture = TestBed.createComponent(StudentReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render main title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.main-title')?.textContent).toContain(
      'سجل درجاتي وتحليلات الأداء',
    );
  });

  it('should render summary KPI cards', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const cards = compiled.querySelectorAll('app-report-kpi-card');
    expect(cards.length).toBe(3);
  });

  it('should open AI revision modal on topic review click', () => {
    component.onStartReview({
      id: 'test',
      topicTitle: 'المشتقات والتكامل',
      subjectName: 'الرياضيات',
      badgeText: 'تحسين',
      scorePercent: 40,
      barMarkerColor: '#FF0000',
      badgeBgColor: '#FFF',
      badgeTextColor: '#000',
      scoreTextColor: '#FF0000',
    });

    expect(component.showRevisionModal()).toBeTrue();
    expect(component.currentTopicTitle()).toBe('المشتقات والتكامل');

    component.closeRevisionModal();
    expect(component.showRevisionModal()).toBeFalse();
  });

  it('should trigger PDF download when activeRevision is present', () => {
    const toastService = TestBed.inject(ToastService);
    const toastSpy = spyOn(toastService, 'info');

    // Should do nothing when activeRevision is null
    component.activeRevision.set(null);
    component.onDownloadPdf();
    expect(toastSpy).not.toHaveBeenCalled();

    // Should create iframe and trigger toast when activeRevision is set
    component.activeRevision.set({
      topicName: 'المشتقات',
      recommendation: 'مراجعة الأساسيات',
      aiExplanation: 'شرح تفصيلي للموضوع',
      exampleIncorrectAnswers: ['إجابة خاطئة 1'],
      keyFormulas: ['القانون الأول'],
    });
    component.currentTopicTitle.set('المشتقات');

    component.onDownloadPdf();
    expect(toastSpy).toHaveBeenCalledWith(
      'جاري تجهيز ملف الـ PDF 📄',
      'تم فتح نافذة الطباعة والحفظ بصيغة PDF بنجاح.',
    );
  });

  it('should use cached review and not call getTopicRevision again', () => {
    const revisionSpy = spyOn(reportsService, 'getTopicRevision').and.returnValue(
      of({
        topicName: 'المشتقات والتكامل',
        recommendation: 'توصية',
      }),
    );

    const mockWeakness = {
      id: 'test-1',
      topicTitle: 'المشتقات والتكامل',
      subjectName: 'الرياضيات',
      badgeText: 'تحسين',
      scorePercent: 40,
      barMarkerColor: '#FF0000',
      badgeBgColor: '#FFF',
      badgeTextColor: '#000',
      scoreTextColor: '#FF0000',
    };

    // 1st call: not cached, calls endpoint
    component.onStartReview(mockWeakness);
    expect(revisionSpy).toHaveBeenCalledTimes(1);
    expect(component.isTopicReviewed('المشتقات والتكامل')).toBeTrue();

    // 2nd call: cached, must NOT call endpoint again
    revisionSpy.calls.reset();
    component.onStartReview(mockWeakness);
    expect(revisionSpy).not.toHaveBeenCalled();
    expect(component.activeRevision()?.topicName).toBe('المشتقات والتكامل');
  });

  it('should render proficiencyPercent as-is without cross-matching it against unrelated exam scores', () => {
    // Regression test: a prior version replaced a low proficiencyPercent with
    // a fuzzy-matched exam's unrelated scorePercent whenever it was <= 10.
    // A genuinely low topic proficiency must survive untouched.
    const weaknessService = TestBed.inject(StudentWeaknessService);
    weaknessService.activeWeaknesses.set([
      {
        id: 'w1',
        topicName: 'التفاضل',
        subjectName: 'رياضيات',
        proficiencyPercent: 8,
      },
    ]);
    fixture.detectChanges();

    const topics = component.activeWeaknessTopics();
    expect(topics.length).toBe(1);
    expect(topics[0].scorePercent).toBe(8);
  });

  describe('radarChart', () => {
    it('is null when fewer than 3 subjects are present (not a meaningful radar shape)', () => {
      reportsService.skillRadarPoints.set([{ name: 'رياضيات', percent: 80 }]);
      fixture.detectChanges();

      expect(component.radarChart()).toBeNull();
    });

    it('renders one ring per level and one spoke/label per subject for real subject data', () => {
      // Regression test: this card used to render a hardcoded 5-axis pentagon
      // (رياضيات/فيزياء/كيمياء/أحياء/لغات) unconditionally, ignoring the
      // student's real subjects entirely.
      reportsService.skillRadarPoints.set([
        { name: 'رياضيات', percent: 90 },
        { name: 'فيزياء', percent: 60 },
        { name: 'كيمياء', percent: 40 },
      ]);
      fixture.detectChanges();

      const radar = component.radarChart();
      expect(radar).not.toBeNull();
      expect(radar?.ringPoints.length).toBe(4); // 25/50/75/100 rings
      expect(radar?.spokes.length).toBe(3);
      expect(radar?.labels.map((l) => l.text)).toEqual(['رياضيات', 'فيزياء', 'كيمياء']);
      // Each ring/skill polygon must have exactly one "x,y" pair per subject.
      expect(radar?.skillPolygonPoints.split(' ').length).toBe(3);
    });

    it('caps the web to the top 5 subjects by score when the student has more than 5', () => {
      // Regression test: with more than ~5 subjects the web gets crowded and
      // axis labels start colliding, so only the top 5 (by score) are shown.
      reportsService.skillRadarPoints.set([
        { name: 'أ', percent: 10 },
        { name: 'ب', percent: 90 },
        { name: 'ج', percent: 80 },
        { name: 'د', percent: 20 },
        { name: 'هـ', percent: 70 },
        { name: 'و', percent: 60 },
        { name: 'ز', percent: 30 },
      ]);
      fixture.detectChanges();

      const radar = component.radarChart();
      expect(radar?.labels.length).toBe(5);
      expect(radar?.labels.map((l) => l.text)).toEqual(['ب', 'ج', 'هـ', 'و', 'ز']);
    });
  });

  describe('trendChart / growthPill', () => {
    it('is null with no trend data instead of showing a fixed mock curve', () => {
      reportsService.trendPoints.set([]);
      fixture.detectChanges();

      expect(component.trendChart()).toBeNull();
      expect(component.growthPill()).toBeNull();
    });

    it('renders real month labels and a percentage-based series from trendPoints()', () => {
      // Regression test: this card used to render a hardcoded 3-point curve
      // labeled مايو/يونيو/يوليو regardless of the student's real history.
      reportsService.trendPoints.set([
        { month: '2026-06-01T00:00:00Z', averageScore: 4, averageMaxScore: 10 },
        { month: '2026-07-01T00:00:00Z', averageScore: 8.5, averageMaxScore: 10 },
      ]);
      reportsService.summary.update((s) => ({ ...s, monthlyGrowthPercent: 45 }));
      fixture.detectChanges();

      const chart = component.trendChart();
      expect(chart).not.toBeNull();
      expect(chart?.series[0].data as number[]).toEqual([40, 85]);
      expect(chart?.xaxis.categories?.[0]).not.toBe('مايو'); // real month, not the old hardcoded label

      const pill = component.growthPill();
      expect(pill?.tone).toBe('positive');
    });

    it('pads a single real month with a flat leading point instead of a lone floating dot', () => {
      // Regression test: with only one month on record there's nothing to
      // draw a trend between — the old SVG chart rendered an isolated dot in
      // the middle of the card. A synthetic unlabeled point at the same value
      // is prepended so the line reads as a flat baseline instead.
      reportsService.trendPoints.set([
        { month: '2026-08-01T00:00:00Z', averageScore: 6, averageMaxScore: 10 },
      ]);
      fixture.detectChanges();

      const chart = component.trendChart();
      expect(chart?.series[0].data as number[]).toEqual([60, 60]);
      expect(chart?.xaxis.categories).toEqual(['', jasmine.any(String)]);
    });

    it('shows a negative-tone pill when the real trend is declining, not a fixed positive one', () => {
      reportsService.trendPoints.set([
        { month: '2026-06-01T00:00:00Z', averageScore: 9, averageMaxScore: 10 },
        { month: '2026-07-01T00:00:00Z', averageScore: 5, averageMaxScore: 10 },
      ]);
      reportsService.summary.update((s) => ({ ...s, monthlyGrowthPercent: -40 }));
      fixture.detectChanges();

      expect(component.growthPill()?.tone).toBe('negative');
    });
  });
});
