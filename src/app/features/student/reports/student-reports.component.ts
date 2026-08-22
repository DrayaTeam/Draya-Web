import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StudentReportsService } from '../../../core/services/student-reports.service';
import { AuthService } from '../../auth/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { ReportKpiCardComponent } from './components/report-kpi-card/report-kpi-card.component';
import { ReportWeaknessTopicComponent } from './components/report-weakness-topic/report-weakness-topic.component';
import { DrayaEmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ReportWeaknessTopic, TopicRevisionDto } from '../../../core/models/student-reports.model';

@Component({
  selector: 'app-student-reports',
  standalone: true,
  imports: [
    CommonModule,
    ReportKpiCardComponent,
    ReportWeaknessTopicComponent,
    DrayaEmptyStateComponent,
  ],
  templateUrl: './student-reports.component.html',
  styleUrl: './student-reports.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentReportsComponent implements OnInit {
  protected readonly reportsService = inject(StudentReportsService);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  readonly summary = this.reportsService.summary;
  readonly subjectScores = this.reportsService.subjectScores;
  readonly weaknessTopics = this.reportsService.weaknessTopics;
  readonly skillPoints = this.reportsService.skillRadarPoints;
  readonly isLoading = this.reportsService.isLoading;

  // AI Interactive Revision Modal State
  readonly showRevisionModal = signal<boolean>(false);
  readonly loadingRevision = signal<boolean>(false);
  readonly generatingPractice = signal<boolean>(false);
  readonly activeRevision = signal<TopicRevisionDto | null>(null);
  readonly currentTopicTitle = signal<string>('');

  ngOnInit(): void {
    this.reportsService.loadReports().subscribe({
      next: () => void 0,
      error: () => void 0,
    });
  }

  onStartReview(topic: ReportWeaknessTopic): void {
    const studentId = this.authService.currentUser()?.userId || 'me';
    this.currentTopicTitle.set(topic.topicTitle);
    this.showRevisionModal.set(true);
    this.loadingRevision.set(true);

    this.reportsService.getTopicRevision(studentId, topic.topicTitle).subscribe({
      next: (rev) => {
        const enrichedRevision: TopicRevisionDto = {
          topicName: rev?.topicName || topic.topicTitle,
          recommendation:
            rev?.recommendation ||
            topic.recommendation ||
            `يركز هذا الموضوع على المفاهيم الجوهرية لـ "${topic.topicTitle}". ننصح بمراجعة القوانين الأساسية وحل مسائل تدريبية.`,
          aiExplanation:
            rev?.aiExplanation ||
            `تم تحليل إجاباتك السابقة واكتشاف فرص واعدة لرفع دقة الحل في هذا الموضوع.`,
          keyFormulas: rev?.keyFormulas || [
            'مراجعة القوانين والنظريات الأساسية',
            'التطبيق التدريجي على نماذج الأسئلة',
          ],
          exampleIncorrectAnswers:
            rev?.exampleIncorrectAnswers || topic.exampleIncorrectAnswers,
        };
        this.activeRevision.set(enrichedRevision);
        this.loadingRevision.set(false);
      },
      error: () => {
        this.activeRevision.set({
          topicName: topic.topicTitle,
          recommendation:
            topic.recommendation ||
            `يركز هذا الموضوع على المفاهيم الجوهرية لـ "${topic.topicTitle}". ننصح بمراجعة القوانين الأساسية وحل مسائل تدريبية.`,
          aiExplanation: `تم تحليل إجاباتك السابقة واكتشاف فرص واعدة لرفع دقة الحل في هذا الموضوع.`,
          keyFormulas: [
            'مراجعة القوانين والنظريات الأساسية',
            'التطبيق التدريجي على نماذج الأسئلة',
          ],
          exampleIncorrectAnswers: topic.exampleIncorrectAnswers,
        });
        this.loadingRevision.set(false);
      },
    });
  }

  closeRevisionModal(): void {
    this.showRevisionModal.set(false);
    this.activeRevision.set(null);
  }

  onLaunchPracticeExam(): void {
    const studentId = this.authService.currentUser()?.userId || 'me';
    const topic = this.currentTopicTitle();
    this.generatingPractice.set(true);
    this.toastService.info('تجهيز الاختبار بالذكاء الاصطناعي 🚀', 'جارٍ إعداد اختبار مخصص لنقاط تحسينك...');

    this.reportsService.createPracticeExam(studentId, topic).subscribe({
      next: (res) => {
        this.generatingPractice.set(false);
        this.closeRevisionModal();
        if (res?.examId) {
          this.router.navigate(['/student/exams', res.examId, 'active']);
        } else {
          this.router.navigate(['/student/exams']);
        }
      },
      error: () => {
        this.generatingPractice.set(false);
        this.closeRevisionModal();
        this.router.navigate(['/student/exams']);
      },
    });
  }
}
