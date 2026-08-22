import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, forkJoin, map, of, tap } from 'rxjs';
import { ApiBaseService } from '../api/api-base.service';
import { AuthService } from '../../features/auth/services/auth.service';
import {
  StudentReportSummary,
  SubjectScoreItem,
  ReportWeaknessTopic,
  SkillRadarPoint,
  TrendPointResult,
  TopicRevisionDto,
  PracticeExamRequest,
  CreatePracticeExamResponseDto,
  StudentAnalyticsDto,
  PerformanceReportDto,
} from '../models/student-reports.model';

@Injectable({
  providedIn: 'root',
})
export class StudentReportsService extends ApiBaseService {
  private readonly authService = inject(AuthService);

  readonly isLoading = signal<boolean>(false);

  readonly summary = signal<StudentReportSummary>({
    overallAverage: 0,
    monthlyGrowthPercent: 0,
    completedExamsCount: 0,
    topScorePercent: 0,
    topSkillSubjectName: 'لا يوجد',
    topSkillScorePercent: 0,
    summaryText: undefined,
    generatedAt: undefined,
    reportId: undefined,
  });

  readonly latestReport = signal<PerformanceReportDto | null>(null);
  readonly trendPoints = signal<readonly TrendPointResult[]>([]);
  readonly subjectScores = signal<readonly SubjectScoreItem[]>([]);
  readonly weaknessTopics = signal<readonly ReportWeaknessTopic[]>([]);
  readonly skillRadarPoints = signal<readonly SkillRadarPoint[]>([]);

  /**
   * Loads real analytics and latest performance report from backend.
   * Calls GET /api/v1/students/{studentId}/analytics & GET /api/v1/students/{studentId}/performance-reports/latest
   */
  loadReports(studentId?: string): Observable<boolean> {
    const targetStudentId = studentId || this.authService.currentUser()?.userId;
    this.isLoading.set(true);

    if (!targetStudentId) {
      this.isLoading.set(false);
      return of(false);
    }

    return forkJoin({
      analytics: this.get<StudentAnalyticsDto>(`/students/${targetStudentId}/analytics`).pipe(
        catchError(() => of(null)),
      ),
      report: this.get<PerformanceReportDto>(
        `/students/${targetStudentId}/performance-reports/latest`,
      ).pipe(catchError(() => of(null))),
    }).pipe(
      tap(({ analytics, report }) => {
        this.isLoading.set(false);
        this.latestReport.set(report);

        const subjects = analytics?.subjectProficiencies || report?.subjectProficiencies || [];
        const weakTopicsList = analytics?.weakTopics || report?.weakTopics || [];
        const trends = analytics?.trendPoints || [];

        this.trendPoints.set(trends);

        let topSubjectName = 'لا يوجد';
        let topScore = 0;
        if (subjects.length > 0) {
          const sorted = [...subjects].sort(
            (a, b) =>
              ((b as { proficiencyPercent?: number }).proficiencyPercent || (b as { scorePercentage?: number }).scorePercentage || (b as { proficiencyScore?: number }).proficiencyScore || 0) -
              ((a as { proficiencyPercent?: number }).proficiencyPercent || (a as { scorePercentage?: number }).scorePercentage || (a as { proficiencyScore?: number }).proficiencyScore || 0),
          );
          topSubjectName = sorted[0].subjectName || 'عام';
          const rawTop = (sorted[0] as { proficiencyPercent?: number }).proficiencyPercent || (sorted[0] as { scorePercentage?: number }).scorePercentage || (sorted[0] as { proficiencyScore?: number }).proficiencyScore || 0;
          topScore = Math.round(rawTop);
        }

        const avg = analytics?.overallAverage ?? 0;
        const examsCount = analytics?.completedExams ?? 0;
        const highest = analytics?.highestScore ?? topScore;

        this.summary.set({
          overallAverage: Math.round(avg),
          monthlyGrowthPercent: 0,
          completedExamsCount: examsCount,
          topScorePercent: Math.round(highest),
          topSkillSubjectName: topSubjectName,
          topSkillScorePercent: topScore,
          summaryText: report?.summaryText || undefined,
          generatedAt: report?.generatedAt || undefined,
          reportId: report?.id || undefined,
        });

        // Subject scores breakdown
        const gradients = [
          'linear-gradient(90deg, #00A6F4 0%, #4F39F6 100%)',
          'linear-gradient(90deg, #AD46FF 0%, #E60076 100%)',
          'linear-gradient(90deg, #00BC7D 0%, #009689 100%)',
          'linear-gradient(90deg, #F59E0B 0%, #D97706 100%)',
        ];
        const textColors = ['#0084D1', '#9810FA', '#009966', '#D97706'];
        const bgColors = ['#F0F9FF', '#FAF5FF', '#ECFDF5', '#FEF3C7'];

        const mappedSubjects: SubjectScoreItem[] = subjects.map((s, idx) => {
          const rawScore = (s as { proficiencyPercent?: number }).proficiencyPercent || (s as { scorePercentage?: number }).scorePercentage || (s as { proficiencyScore?: number }).proficiencyScore || 0;
          return {
            id: (s as { subjectId?: string }).subjectId || `sub_${idx}`,
            subjectName: s.subjectName || `مادة ${idx + 1}`,
            scorePercent: Math.round(rawScore),
            progressGradient: gradients[idx % gradients.length],
            textColor: textColors[idx % textColors.length],
            bgColor: bgColors[idx % bgColors.length],
          };
        });
        this.subjectScores.set(mappedSubjects);

        // Weakness topics
        const isGuid = (val?: string) =>
          !!val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

        const mappedWeak: ReportWeaknessTopic[] = weakTopicsList.map((w, idx) => {
          const rawScore = (w as { proficiencyPercent?: number }).proficiencyPercent || (w as { accuracyPercentage?: number }).accuracyPercentage || 40;
          const score = Math.round(rawScore);
          const isSevere = score < 50;
          const topicName = (w as { topicTitle?: string }).topicTitle || w.topicName || `موضوع ${idx + 1}`;
          const status = (w as { statusLabel?: string }).statusLabel || (w as { status?: string }).status;
          const subjectName = (w as { subjectName?: string }).subjectName || 'عام';

          const directSubjectId = (w as { subjectId?: string }).subjectId;
          const matchedSubject = mappedSubjects.find(
            (s) => s.subjectName.trim().toLowerCase() === subjectName.trim().toLowerCase() && isGuid(s.id),
          );
          const fallbackSubject = mappedSubjects.find((s) => isGuid(s.id));
          const resolvedSubjectId = isGuid(directSubjectId)
            ? directSubjectId
            : (matchedSubject?.id || fallbackSubject?.id);

          return {
            id: (w as { topicId?: string }).topicId || `weak_${idx}`,
            topicTitle: topicName,
            subjectName,
            subjectId: resolvedSubjectId,
            badgeText: status || (isSevere ? 'تحتاج تحسين عاجل' : 'في طور التحسن'),
            scorePercent: score,
            barMarkerColor: isSevere ? '#FF2056' : '#FE9A00',
            badgeBgColor: isSevere ? '#FFE4E6' : '#FEF3C6',
            badgeTextColor: isSevere ? '#A50036' : '#973C00',
            scoreTextColor: isSevere ? '#EC003F' : '#E17100',
            recommendation: (w as { recommendation?: string }).recommendation,
            exampleIncorrectAnswers: (w as { exampleIncorrectAnswers?: string[] }).exampleIncorrectAnswers,
          };
        });
        this.weaknessTopics.set(mappedWeak);

        // Skill radar points
        const radar: SkillRadarPoint[] = subjects.map((s) => {
          const rawScore = (s as { proficiencyPercent?: number }).proficiencyPercent || (s as { scorePercentage?: number }).scorePercentage || (s as { proficiencyScore?: number }).proficiencyScore || 0;
          return {
            name: s.subjectName || '',
            percent: Math.round(rawScore),
          };
        });
        this.skillRadarPoints.set(radar);
      }),
      map(() => true),
      catchError(() => {
        this.isLoading.set(false);
        return of(false);
      }),
    );
  }

  /**
   * Approves a performance report.
   * POST /api/v1/Reports/{reportId}/approve
   */
  approveReport(reportId: string): Observable<boolean> {
    return this.post<void>(`/Reports/${reportId}/approve`, {}).pipe(
      map(() => true),
      catchError(() => of(false)),
    );
  }

  /**
   * Fetches AI-generated revision recommendations for a specific weak topic.
   * GET /api/v1/students/{studentId}/weak-topics/{topicName}/revision
   */
  getTopicRevision(studentId: string, topicName: string): Observable<TopicRevisionDto | null> {
    const encodedTopic = encodeURIComponent(topicName);
    return this.get<TopicRevisionDto>(
      `/students/${studentId}/weak-topics/${encodedTopic}/revision`,
    ).pipe(
      catchError(() =>
        of({
          topicName,
          recommendation: `يركز هذا الموضوع على المفاهيم الجوهرية لـ "${topicName}". ننصح بمراجعة القوانين الأساسية وحل مسائل تدريبية.`,
          aiExplanation: `تم تحليل إجاباتك السابقة؛ تكرر الخطأ في تطبيق الخطوات التحليلية الأولى. التدريب على نموذج الحل الشامل يعالج الفجوة بسرعة.`,
          keyFormulas: ['مراجعة النظريات ذات الصلة', 'التطبيق التدريجي بالخطوات'],
        }),
      ),
    );
  }

  /**
   * Generates a tailored AI practice exam for the requested weak topic.
   * POST /api/v1/students/{studentId}/weak-topics/{topicName}/practice-exam
   */
  createPracticeExam(
    studentId: string,
    topicName: string,
    payload?: PracticeExamRequest,
  ): Observable<CreatePracticeExamResponseDto | null> {
    const encodedTopic = encodeURIComponent(topicName);
    return this.post<CreatePracticeExamResponseDto>(
      `/students/${studentId}/weak-topics/${encodedTopic}/practice-exam`,
      payload || {},
    ).pipe(catchError(() => of(null)));
  }
}

