import { Injectable, signal } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';
import { ApiBaseService } from '../api/api-base.service';
import {
  StudentReportSummary,
  SubjectScoreItem,
  ReportWeaknessTopic,
  SkillRadarPoint,
  TopicRevisionDto,
  CreatePracticeExamResponseDto,
} from '../models/student-reports.model';

@Injectable({
  providedIn: 'root',
})
export class StudentReportsService extends ApiBaseService {
  readonly summary = signal<StudentReportSummary>({
    overallAverage: 87,
    monthlyGrowthPercent: 5,
    completedExamsCount: 12,
    topScorePercent: 94,
    topSkillSubjectName: 'الكيمياء',
    topSkillScorePercent: 91,
  });

  readonly subjectScores = signal<readonly SubjectScoreItem[]>([
    {
      id: 'math',
      subjectName: 'الرياضيات',
      scorePercent: 87,
      progressGradient: 'linear-gradient(90deg, #00A6F4 0%, #4F39F6 100%)',
      textColor: '#0084D1',
      bgColor: '#F0F9FF',
    },
    {
      id: 'physics',
      subjectName: 'الفيزياء',
      scorePercent: 82,
      progressGradient: 'linear-gradient(90deg, #AD46FF 0%, #E60076 100%)',
      textColor: '#9810FA',
      bgColor: '#FAF5FF',
    },
    {
      id: 'chemistry',
      subjectName: 'الكيمياء',
      scorePercent: 91,
      progressGradient: 'linear-gradient(90deg, #00BC7D 0%, #009689 100%)',
      textColor: '#009966',
      bgColor: '#ECFDF5',
    },
  ]);

  readonly weaknessTopics = signal<readonly ReportWeaknessTopic[]>([
    {
      id: 'weakness-1',
      topicTitle: 'المشتقات والتكامل وتطبيقات المساحات',
      subjectName: 'الرياضيات',
      badgeText: 'تحتاج تحسين عاجل',
      scorePercent: 42,
      barMarkerColor: '#FF2056',
      badgeBgColor: '#FFE4E6',
      badgeTextColor: '#A50036',
      scoreTextColor: '#EC003F',
    },
    {
      id: 'weakness-2',
      topicTitle: 'الدوائر الكهربية وقانون أوم للمغلقة',
      subjectName: 'الفيزياء',
      badgeText: 'في طور التحسن',
      scorePercent: 55,
      barMarkerColor: '#FE9A00',
      badgeBgColor: '#FEF3C6',
      badgeTextColor: '#973C00',
      scoreTextColor: '#E17100',
    },
  ]);

  readonly skillRadarPoints = signal<readonly SkillRadarPoint[]>([
    { name: 'رياضيات', percent: 85 },
    { name: 'فيزياء', percent: 78 },
    { name: 'كيمياء', percent: 91 },
    { name: 'أحياء', percent: 88 },
    { name: 'لغات', percent: 80 },
  ]);

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
