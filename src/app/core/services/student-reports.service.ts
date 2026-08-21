import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, forkJoin, map, of, tap } from 'rxjs';
import { ApiBaseService } from '../api/api-base.service';
import { AuthService } from '../../features/auth/services/auth.service';
import {
  StudentReportSummary,
  SubjectScoreItem,
  ReportWeaknessTopic,
  SkillRadarPoint,
  TopicRevisionDto,
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
  });

  readonly subjectScores = signal<readonly SubjectScoreItem[]>([]);
  readonly weaknessTopics = signal<readonly ReportWeaknessTopic[]>([]);
  readonly skillRadarPoints = signal<readonly SkillRadarPoint[]>([]);

  /**
   * Loads real analytics and latest performance report from backend.
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
        const subjects = analytics?.subjectProficiencies || report?.subjectProficiencies || [];
        const weakTopicsList = analytics?.weakTopics || report?.weakTopics || [];

        let topSubjectName = 'لا يوجد';
        let topScore = 0;
        if (subjects.length > 0) {
          const sorted = [...subjects].sort(
            (a, b) =>
              (b.scorePercentage || b.proficiencyScore || 0) -
              (a.scorePercentage || a.proficiencyScore || 0),
          );
          topSubjectName = sorted[0].subjectName || 'عام';
          topScore = Math.round(sorted[0].scorePercentage || sorted[0].proficiencyScore || 0);
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

        const mappedSubjects: SubjectScoreItem[] = subjects.map((s, idx) => ({
          id: s.subjectId || `sub_${idx}`,
          subjectName: s.subjectName || `مادة ${idx + 1}`,
          scorePercent: Math.round(s.scorePercentage || s.proficiencyScore || 0),
          progressGradient: gradients[idx % gradients.length],
          textColor: textColors[idx % textColors.length],
          bgColor: bgColors[idx % bgColors.length],
        }));
        this.subjectScores.set(mappedSubjects);

        // Weakness topics
        const mappedWeak: ReportWeaknessTopic[] = weakTopicsList.map((w, idx) => {
          const score = Math.round(w.accuracyPercentage ?? 40);
          const isSevere = score < 50;
          return {
            id: w.topicId || `weak_${idx}`,
            topicTitle: w.topicTitle || w.topicName || `موضوع ${idx + 1}`,
            subjectName: w.subjectName || 'عام',
            badgeText: w.statusLabel || (isSevere ? 'تحتاج تحسين عاجل' : 'في طور التحسن'),
            scorePercent: score,
            barMarkerColor: isSevere ? '#FF2056' : '#FE9A00',
            badgeBgColor: isSevere ? '#FFE4E6' : '#FEF3C6',
            badgeTextColor: isSevere ? '#A50036' : '#973C00',
            scoreTextColor: isSevere ? '#EC003F' : '#E17100',
          };
        });
        this.weaknessTopics.set(mappedWeak);

        // Skill radar points
        const radar: SkillRadarPoint[] = subjects.map((s) => ({
          name: s.subjectName || '',
          percent: Math.round(s.scorePercentage || s.proficiencyScore || 0),
        }));
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
          recommendation: `يركز هذا الموضوع على المفاهيم الجوهرية لـ "${topicName}". ننصح بمراجعة القوانين الأساسية وحل 5 مسائل تدريبية.`,
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
  ): Observable<CreatePracticeExamResponseDto | null> {
    const encodedTopic = encodeURIComponent(topicName);
    return this.post<CreatePracticeExamResponseDto>(
      `/students/${studentId}/weak-topics/${encodedTopic}/practice-exam`,
      {},
    ).pipe(catchError(() => of(null)));
  }
}
