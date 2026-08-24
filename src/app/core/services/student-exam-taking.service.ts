import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, switchMap, tap } from 'rxjs';
import { ApiBaseService } from '../api/api-base.service';
import { SignalRService } from '../signalr/signalr.service';
import { ToastService } from './toast.service';
import { StudentWeaknessService } from './student-weakness.service';
import { ApiError } from '../models/api-error.model';
import { StudentWeaknessItem } from '../models/student-weakness.model';
import {
  AnswerSubmissionDto,
  AttemptResultResponseDto,
  ExamQuestion,
  ExamResultReport,
  ExamReviewItem,
  ExamWeaknessTopic,
  GradingJobStatusDto,
  StartAttemptFailureReason,
  StartAttemptResponseDto,
  StudentExamDto,
  StudentExamQuestionDto,
  SubmitAttemptRequestDto,
  SubmitAttemptResponseDto,
} from '../models/student-exam-taking.model';

function toExamWeaknessTopics(
  items: readonly StudentWeaknessItem[],
  classroomId?: string | null,
  attemptPct?: number,
  examTopic?: string,
): ExamWeaknessTopic[] {
  return items.slice(0, 3).map((w) => {
    let accuracy = w.proficiencyPercent;
    if (
      examTopic &&
      (w.topicName.trim().toLowerCase() === examTopic.trim().toLowerCase() ||
        examTopic.trim().toLowerCase().includes(w.topicName.trim().toLowerCase()))
    ) {
      if (typeof attemptPct === 'number' && attemptPct > 0) {
        accuracy = attemptPct;
      }
    } else if (accuracy > 0 && accuracy <= 5) {
      accuracy = Math.min(100, Math.round((accuracy / 5) * 100));
    } else if (accuracy > 0 && accuracy <= 10) {
      accuracy = Math.min(100, Math.round((accuracy / 10) * 100));
    }

    return {
      id: w.id,
      title: w.topicName,
      accuracyPercentage: accuracy,
      aiTip: `نسبة إتقانك لهذا الموضوع ${accuracy}%. استخدم زر المراجعة التفاعلية في صفحة تقاريري لمزيد من التوصيات.`,
      reviewLectureUrl: classroomId ? `/student/classroom/${classroomId}` : '',
    };
  });
}

/** Tolerant shape of GET /exams/{examId}/student-view — untyped in swagger. */
export interface ExamStudentViewDto {
  exam?: { id: string; title?: string; questionsCount?: number };
  attempts?: {
    id: string;
    finalScore?: number | null;
    needsTeacherReview?: boolean;
    submittedAt?: string | null;
  }[];
}

// Poll cadence for the async grading pipeline. Named (rather than inlined) so the
// budget can be tuned without hunting through the polling loops.
const GRADING_JOB_POLL_INTERVAL_MS = 1500;
const GRADING_JOB_MAX_POLLS = 6;
const RESULTS_POLL_INTERVAL_MS = 2000;
const RESULTS_POLL_MAX_TRIES = 4;

function mapExamQuestions(
  questions: StudentExamQuestionDto[] | undefined,
  topic: string | undefined,
): ExamQuestion[] {
  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    return [];
  }

  return questions.map((q, idx) => {
    const rawOptions = q.options || [];
    // NOTE: the student-facing payload intentionally does not include an answer key
    // (StudentExamQuestionOptionDto has no `isCorrect`). Correctness is only ever
    // known once grading completes and /attempts/{id}/results is fetched.
    const questionType = q.type || (rawOptions.length > 0 ? 'MultipleChoice' : 'Essay');

    return {
      id: q.id || `q_${idx + 1}`,
      index: idx + 1,
      text: q.text || `سؤال رقم ${idx + 1}`,
      type: questionType,
      subjectTag:
        q.type || q.difficulty || topic || (questionType === 'Essay' ? 'مقالي' : 'اختيار من متعدد'),
      isFlagged: false,
      selectedOptionId: undefined,
      answerText: undefined,
      options: rawOptions.map((o, optIdx) => ({
        id: o.id || `opt_${optIdx + 1}`,
        text: o.text || `الخيار ${optIdx + 1}`,
      })),
    };
  });
}

function isEssayQuestion(type: string | undefined, optionsCount: number): boolean {
  return (type || '').toLowerCase().includes('essay') || optionsCount === 0;
}

/** Best-effort classification of a failed POST /attempts/start, since the backend
 *  reports failure via HTTP status + free-text message rather than a stable error code.
 *  Exported for direct unit testing — going through the HTTP mock would require also
 *  wiring the error interceptor that normally produces this ApiError shape. */
export function interpretStartAttemptError(err: ApiError | undefined): StartAttemptFailureReason {
  const message = (err?.message || '').toLowerCase();
  if (message.includes('expired') || message.includes('انتهت')) {
    return 'exam-expired';
  }
  // Checked before the "already"/"submitted" branch below: a message like
  // "attempt already in progress" would otherwise match "already" first.
  if (message.includes('in progress') || message.includes('in-progress')) {
    return 'attempt-in-progress';
  }
  if (
    message.includes('already') ||
    message.includes('no attempts') ||
    message.includes('allowed attempts') ||
    message.includes('submitted')
  ) {
    return 'no-attempts-remaining';
  }
  return 'unknown';
}

@Injectable({
  providedIn: 'root',
})
export class StudentExamTakingService extends ApiBaseService {
  private readonly signalR = inject(SignalRService);
  private readonly toastService = inject(ToastService);
  private readonly weaknessService = inject(StudentWeaknessService);

  readonly examTitle = signal<string>('جارٍ تحميل تفاصيل الامتحان...');
  readonly examLevelText = signal<string>('بيئة اختبار تفاعلية مؤمنة');
  readonly remainingSeconds = signal<number>(2700); // 45:00
  readonly isLoading = signal<boolean>(false);
  readonly currentAttemptId = signal<string | null>(null);
  readonly currentExamId = signal<string>('');
  readonly currentClassroomId = signal<string | null>(null);

  readonly currentQuestionIndex = signal<number>(0);
  readonly isSubmitted = signal<boolean>(false);
  readonly isGradingInProgress = signal<boolean>(false);
  readonly gradingStage = signal<'submitting' | 'ai_evaluating' | 'completed' | 'pending_review'>(
    'completed',
  );
  readonly gradingProgressPercent = signal<number>(0);

  readonly questions = signal<readonly ExamQuestion[]>([]);

  /** Set when POST /attempts/start fails — lets the UI show a specific reason
   *  (expired / no attempts left / already in progress) instead of a generic error. */
  readonly startAttemptFailureReason = signal<StartAttemptFailureReason | null>(null);

  readonly currentQuestion = computed(() => {
    const idx = this.currentQuestionIndex();
    const list = this.questions();
    return list[idx] || null;
  });

  readonly totalQuestionsCount = computed(() => this.questions().length);

  readonly isFirstQuestion = computed(() => this.currentQuestionIndex() === 0);

  readonly isLastQuestion = computed(() => {
    const count = this.totalQuestionsCount();
    return count > 0 ? this.currentQuestionIndex() === count - 1 : false;
  });

  readonly formattedTimer = computed(() => {
    const total = this.remainingSeconds();
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    const padMins = mins.toString().padStart(2, '0');
    const padSecs = secs.toString().padStart(2, '0');
    return `${padMins}:${padSecs}`;
  });

  readonly examResult = signal<ExamResultReport>({
    examId: '',
    examTitle: '',
    scorePercentage: 0,
    gradeLabel: 'قيد التقييم والمراجعة ⏳',
    isPassed: false,
    isGradingPending: true,
    submittedAt: '',
    weaknessTopics: [],
    reviewQuestions: [],
  });

  private timerInterval: ReturnType<typeof setInterval> | null = null;
  readonly violations = signal<number>(0);
  readonly isAttemptAlreadyCompleted = signal<boolean>(false);

  constructor() {
    super();

    // ── SignalR Real-Time AI Grading Listener ──────────────────────────────
    // Listens to real-time events from SignalR and immediately fetches final grading results
    effect(() => {
      const gradingEvent = this.signalR.gradingCompleted();
      if (!gradingEvent) return;

      const currentAttempt = this.currentAttemptId() || this.examResult().attemptId;
      const eventAttemptId = gradingEvent.attemptId || gradingEvent.studentExamAttemptId;
      if (
        currentAttempt &&
        eventAttemptId &&
        (eventAttemptId === currentAttempt ||
          eventAttemptId.toLowerCase() === currentAttempt.toLowerCase())
      ) {
        if (gradingEvent.status === 'Completed' || gradingEvent.status === 'CompletedWithWarning') {
          this.toastService.success(
            'اكتمل التقييم الذكي 🎉',
            'تم الانتهاء من تصحيح إجاباتك وإعداد تقرير الأداء بنجاح.',
          );
          this.gradingStage.set('completed');
          this.gradingProgressPercent.set(100);
          this.isGradingInProgress.set(false);
          this.fetchAttemptResults(currentAttempt).subscribe();
        } else if (gradingEvent.status === 'Failed') {
          this.toastService.warning(
            'تنبيه التقييم ⚠️',
            'تم استلام نتيجة التقييم الأولية وسيقوم المعلم باعتماد الدرجات النهائية.',
          );
          this.gradingStage.set('pending_review');
          this.isGradingInProgress.set(false);
        }
      }
    });
  }

  /**
   * Resets all exam state, attempts, questions, and timers to allow starting fresh exams.
   */
  resetExamSession(): void {
    this.stopTimer();
    this.isSubmitted.set(false);
    this.isAttemptAlreadyCompleted.set(false);
    this.startAttemptFailureReason.set(null);
    this.currentAttemptId.set(null);
    this.currentQuestionIndex.set(0);
    this.isGradingInProgress.set(false);
    this.gradingStage.set('completed');
    this.gradingProgressPercent.set(0);
    this.violations.set(0);
    this.questions.set([]);
    this.examResult.set({
      examId: '',
      examTitle: '',
      scorePercentage: 0,
      gradeLabel: 'قيد التقييم والمراجعة ⏳',
      isPassed: false,
      isGradingPending: true,
      submittedAt: '',
      weaknessTopics: [],
      reviewQuestions: [],
    });
  }

  /**
   * Starts (or resumes) an attempt and loads the exam's questions.
   * POST /api/v1/attempts/start then GET /api/v1/students/exams/{id}.
   */
  loadExamSession(examId: string): Observable<boolean> {
    this.resetExamSession();
    this.isLoading.set(true);
    this.currentExamId.set(examId);

    if (!examId) {
      this.isLoading.set(false);
      this.startAttemptFailureReason.set('unknown');
      return of(false);
    }

    const startAttempt$ = this.post<StartAttemptResponseDto>(`/attempts/start`, { examId }).pipe(
      tap((att) => {
        const id = att?.attemptId || att?.id;
        if (id) {
          this.currentAttemptId.set(id);
        }
      }),
      catchError((err: ApiError) => {
        const reason = interpretStartAttemptError(err);
        this.startAttemptFailureReason.set(reason);
        if (reason === 'no-attempts-remaining') {
          this.isAttemptAlreadyCompleted.set(true);
        }
        console.warn('Attempt start failed:', reason, err?.message);
        return of(null);
      }),
    );

    return startAttempt$.pipe(
      switchMap(() => this.get<StudentExamDto>(`/students/exams/${examId}`)),
      tap((exam) => {
        this.isLoading.set(false);
        if (exam?.title) {
          this.examTitle.set(exam.title);
        }
        if (exam?.topic) {
          this.examLevelText.set(`الموضوع: ${exam.topic} · بيئة اختبار تفاعلية مؤمنة`);
        }

        this.questions.set(mapExamQuestions(exam?.questions, exam?.topic));
        this.currentQuestionIndex.set(0);

        const durSeconds =
          exam?.durationMinutes && exam.durationMinutes > 0 ? exam.durationMinutes * 60 : 2700;
        this.startTimer(durSeconds);
      }),
      map(() => true),
      catchError(() => {
        this.isLoading.set(false);
        this.questions.set([]);
        this.startTimer();
        return of(false);
      }),
    );
  }

  /**
   * Fetches full exam details from GET /api/v1/students/exams/{id}
   */
  getExamDetails(examId: string): Observable<StudentExamDto | null> {
    return this.get<StudentExamDto>(`/students/exams/${examId}`).pipe(
      tap((exam) => {
        if (!exam) return;
        if (exam.title) this.examTitle.set(exam.title);
        if (exam.topic) this.examLevelText.set(`الموضوع: ${exam.topic}`);
        if (exam.classroomId) this.currentClassroomId.set(exam.classroomId);
        const mapped = mapExamQuestions(exam.questions, exam.topic);
        if (mapped.length > 0) {
          this.questions.set(mapped);
        }
      }),
      catchError(() => of(null)),
    );
  }

  /**
   * Fetches exam + attempt history in one call — GET /api/v1/exams/{examId}/student-view.
   * Used to let a student pick which past attempt to revisit.
   */
  fetchExamStudentView(examId: string): Observable<ExamStudentViewDto | null> {
    return this.get<ExamStudentViewDto>(`/exams/${examId}/student-view`).pipe(
      catchError(() => of(null)),
    );
  }

  startTimer(initialSeconds?: number): void {
    this.stopTimer();
    if (initialSeconds && initialSeconds > 0) {
      this.remainingSeconds.set(initialSeconds);
    } else if (this.remainingSeconds() <= 0) {
      this.remainingSeconds.set(2700);
    }
    this.timerInterval = setInterval(() => {
      this.remainingSeconds.update((s) => {
        if (s <= 1) {
          this.stopTimer();
          if (!this.isSubmitted()) {
            this.submitExam();
          }
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  recordViolation(): number {
    const next = this.violations() + 1;
    this.violations.set(next);
    return next;
  }

  selectOption(questionId: string, optionId: string): void {
    this.questions.update((list) =>
      list.map((q) => (q.id === questionId ? { ...q, selectedOptionId: optionId } : q)),
    );
  }

  setAnswerText(questionId: string, text: string): void {
    this.questions.update((list) =>
      list.map((q) => (q.id === questionId ? { ...q, answerText: text } : q)),
    );
  }

  toggleFlagQuestion(questionId: string): void {
    this.questions.update((list) =>
      list.map((q) => (q.id === questionId ? { ...q, isFlagged: !q.isFlagged } : q)),
    );
  }

  goToQuestion(index: number): void {
    if (index >= 0 && index < this.questions().length) {
      this.currentQuestionIndex.set(index);
    }
  }

  nextQuestion(): void {
    if (!this.isLastQuestion()) {
      this.currentQuestionIndex.update((i) => i + 1);
    }
  }

  prevQuestion(): void {
    if (!this.isFirstQuestion()) {
      this.currentQuestionIndex.update((i) => i - 1);
    }
  }

  private buildAnswerPayload(): AnswerSubmissionDto[] {
    return this.questions()
      .filter((q) => !!q.id)
      .map((q): AnswerSubmissionDto => {
        const isEssay = isEssayQuestion(q.type, q.options.length);

        if (isEssay) {
          const text = q.answerText?.trim();
          return {
            examQuestionId: q.id,
            answerText: text && text.length > 0 ? text : null,
            selectedOptionId: null,
          };
        }
        return {
          examQuestionId: q.id,
          selectedOptionId: q.selectedOptionId || null,
          answerText: null,
        };
      });
  }

  /**
   * Submits the student's answers to POST /api/v1/attempts/{attemptId}/submit
   * and initiates AI grading with polling and state tracking.
   *
   * There is no client-side scoring here — correctness for MCQs and essays alike
   * is only known once the server grades the attempt (POST .../grade then
   * GET .../results), because the student payload never carries an answer key.
   */
  submitExam(customAttemptId?: string): void {
    this.stopTimer();
    const targetAttemptId = customAttemptId || this.currentAttemptId();

    if (!targetAttemptId) {
      this.toastService.error(
        'تعذر تسليم الامتحان ⚠️',
        'لم يتم رصد محاولة نشطة لهذا الامتحان على الخادم. يرجى إعادة تحميل الصفحة والمحاولة مجدداً.',
      );
      return;
    }

    this.isSubmitted.set(true);
    this.isGradingInProgress.set(true);
    this.gradingStage.set('submitting');
    this.gradingProgressPercent.set(30);

    const questionsList = this.questions();

    // Placeholder review rows so the UI has something to render immediately;
    // every field here is provisional until fetchAttemptResults() overwrites it.
    const pendingReviewQuestions: ExamReviewItem[] = questionsList.map((q) => {
      const isEssay = isEssayQuestion(q.type, q.options.length);
      const chosen = isEssay
        ? q.answerText?.trim() || 'لم يتم إدخال إجابة'
        : q.options.find((o) => o.id === q.selectedOptionId)?.text || 'لم يتم الإجابة';

      return {
        questionIndex: q.index,
        questionText: q.text,
        isCorrect: false,
        isPendingGrading: true,
        studentAnswerText: chosen,
        correctAnswerText: 'سيتم إعلان الإجابة النموذجية فور اعتماد النتيجة',
        earnedScore: 0,
        maxScore: isEssay ? 10 : 1,
      };
    });

    this.examResult.set({
      attemptId: targetAttemptId,
      examId: this.currentExamId(),
      examTitle: this.examTitle(),
      scorePercentage: 0,
      gradeLabel: 'قيد التقييم والتصحيح الذكي ⏳',
      isPassed: false,
      isGradingPending: true,
      submittedAt: new Date().toLocaleDateString('ar-EG', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      weaknessTopics: [],
      reviewQuestions: pendingReviewQuestions,
    });

    const payload: SubmitAttemptRequestDto = {
      idempotencyKey: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      answers: this.buildAnswerPayload(),
    };

    this.post<SubmitAttemptResponseDto>(`/attempts/${targetAttemptId}/submit`, payload)
      .pipe(
        tap(() => {
          this.gradingStage.set('ai_evaluating');
          this.gradingProgressPercent.set(60);
        }),
        switchMap((subRes) =>
          this.post<GradingJobStatusDto>(`/attempts/${targetAttemptId}/grade`, {
            idempotencyKey: `grade_${Date.now()}`,
          }).pipe(
            map((gradeRes) => gradeRes?.id || subRes?.gradingJobId),
            catchError((err: ApiError) => {
              console.warn(
                'AI Grade endpoint notification (falling back to attempt polling):',
                err?.message,
              );
              return of(subRes?.gradingJobId || null);
            }),
          ),
        ),
        catchError((err: ApiError) => {
          const errorMsg = err?.message || 'تعذر تسليم الامتحان';
          console.warn('Submit attempt notification:', errorMsg);

          if (errorMsg.toLowerCase().includes('expired')) {
            this.toastService.error(
              'انتهت مدة الامتحان ⏱️',
              'انتهت المدة الزمنية المسموح بها لهذا الاختبار على الخادم ولم يعد من الممكن التسليم المتأخر.',
            );
          } else if (errorMsg.includes('already been submitted')) {
            this.toastService.info('تم التسليم مسبقاً', 'تم استلام إجابات هذا الاختبار مسبقاً.');
          } else {
            this.toastService.warning('تنبيه تسليم الامتحان', errorMsg);
          }

          return of('SUBMIT_FAILED');
        }),
      )
      .subscribe({
        next: (jobId) => {
          if (jobId === 'SUBMIT_FAILED') {
            // Try fetching existing results once, in case the submission actually landed.
            this.fetchAttemptResults(targetAttemptId).subscribe(() => {
              this.isGradingInProgress.set(false);
              this.gradingStage.set('pending_review');
              this.gradingProgressPercent.set(100);
            });
          } else if (jobId) {
            this.pollGradingJob(jobId, targetAttemptId);
          } else {
            this.pollAttemptResultsDirectly(targetAttemptId);
          }
        },
      });
  }

  /**
   * Polls background AI grading job until status is Completed.
   */
  pollGradingJob(
    jobId: string,
    attemptId: string,
    maxAttempts = GRADING_JOB_MAX_POLLS,
    intervalMs = GRADING_JOB_POLL_INTERVAL_MS,
  ): void {
    let attempts = 0;
    let interval: ReturnType<typeof setInterval> | null = null;

    const checkJob = () => {
      attempts++;
      this.gradingProgressPercent.set(Math.min(95, 55 + attempts * 7));
      this.get<GradingJobStatusDto>(`/attempts/jobs/${jobId}`)
        .pipe(catchError(() => of(null)))
        .subscribe((job) => {
          if (
            job?.status === 'Completed' ||
            job?.status === 'CompletedWithWarning' ||
            attempts >= maxAttempts
          ) {
            if (interval) {
              clearInterval(interval);
              interval = null;
            }
            this.fetchAttemptResults(attemptId).subscribe((res) => {
              this.isGradingInProgress.set(false);
              this.gradingStage.set(res?.isGradingPending ? 'pending_review' : 'completed');
              this.gradingProgressPercent.set(100);
            });
          }
        });
    };

    checkJob();
    interval = setInterval(checkJob, intervalMs);
  }

  /**
   * Direct attempt result polling when job ID is unavailable or direct fallback is needed.
   */
  pollAttemptResultsDirectly(
    attemptId: string,
    maxTries = RESULTS_POLL_MAX_TRIES,
    intervalMs = RESULTS_POLL_INTERVAL_MS,
  ): void {
    let tries = 0;
    let interval: ReturnType<typeof setInterval> | null = null;

    const check = () => {
      tries++;
      this.gradingProgressPercent.set(Math.min(95, 60 + tries * 9));
      this.fetchAttemptResults(attemptId).subscribe((res) => {
        const hasGrading =
          res && !res.isGradingPending && res.reviewQuestions.some((q) => !q.isPendingGrading);
        if (hasGrading || tries >= maxTries) {
          if (interval) {
            clearInterval(interval);
            interval = null;
          }
          this.isGradingInProgress.set(false);
          this.gradingStage.set(hasGrading ? 'completed' : 'pending_review');
          this.gradingProgressPercent.set(100);
        }
      });
    };

    check();
    interval = setInterval(check, intervalMs);
  }

  /**
   * Fetches attempt grading results from GET /api/v1/attempts/{attemptId}/results.
   * Maps server-graded answers and AI rationale back to the UI. This is the ONLY
   * source of truth for correctness — nothing here is computed from a client-held
   * answer key.
   */
  fetchAttemptResults(attemptId: string): Observable<ExamResultReport | null> {
    return this.get<AttemptResultResponseDto>(`/attempts/${attemptId}/results`).pipe(
      map((res) => {
        if (!res) return null;

        const answersList = res.answers || [];
        const questionsList = this.questions();

        let earnedTotal = 0;
        let maxTotal = 0;
        let hasAnyGraded = false;

        let mappedReviewQuestions: ExamReviewItem[] = [];
        if (answersList.length > 0) {
          mappedReviewQuestions = answersList.map((ans, idx) => {
            const questionDef = questionsList.find((q) => q.id === ans.examQuestionId);
            const questionText = ans.questionText || questionDef?.text || `سؤال رقم ${idx + 1}`;
            const isEssay = isEssayQuestion(
              ans.questionType || questionDef?.type,
              questionDef?.options?.length ?? 0,
            );

            const grading = ans.gradingResult;
            const isGraded = !!grading;

            let isCorrect = false;
            let isPendingGrading = true;
            let earnedScore = 0;
            let maxScore = isEssay ? 10 : 1;

            if (isGraded) {
              hasAnyGraded = true;
              earnedScore = grading.score ?? 0;
              maxScore = grading.maxScore ?? maxScore;
              isCorrect = maxScore > 0 ? earnedScore / maxScore >= 0.5 : earnedScore > 0;
              isPendingGrading = false;
              earnedTotal += earnedScore;
              maxTotal += maxScore;
            }

            let studentAnswerText = ans.answerText || '';
            if (!studentAnswerText && ans.selectedOptionId && questionDef?.options) {
              const selectedOpt = questionDef.options.find((o) => o.id === ans.selectedOptionId);
              studentAnswerText = selectedOpt?.text || 'الخيار المحدد';
            }
            if (!studentAnswerText) {
              studentAnswerText = 'لم يتم الإجابة';
            }

            let correctAnswerText = isEssay
              ? isCorrect
                ? 'إجابة مقبولة ومطابقة لمعايير التقييم'
                : isGraded
                  ? 'إجابة بحاجة لتحسين — يرجى مراجعة المعايير والملاحظات'
                  : 'تخضع لتقييم الذكاء الاصطناعي'
              : 'الإجابة النموذجية';

            if (!isEssay) {
              if (ans.correctAnswerText) {
                correctAnswerText = ans.correctAnswerText;
              } else if (ans.correctOptionId) {
                const correctOpt = questionDef?.options?.find((o) => o.id === ans.correctOptionId);
                if (correctOpt) {
                  correctAnswerText = correctOpt.text || 'الإجابة النموذجية';
                }
              } else if (!isGraded) {
                correctAnswerText = 'سيتم إعلان الإجابة فور اكتمال التقييم';
              }
            }

            return {
              questionIndex: questionDef?.index ?? idx + 1,
              questionText,
              isCorrect,
              studentAnswerText,
              correctAnswerText,
              explanation: grading?.rationale || undefined,
              earnedScore,
              maxScore,
              isAiGraded: grading?.isAiGraded,
              needsTeacherReview: grading?.needsTeacherReview,
              isPendingGrading,
            };
          });
        } else if (this.examResult().reviewQuestions.length > 0) {
          mappedReviewQuestions = this.examResult().reviewQuestions as ExamReviewItem[];
        }

        const hasPendingQuestions = mappedReviewQuestions.some((q) => q.isPendingGrading);
        const isGradingPending =
          !hasAnyGraded ||
          (hasPendingQuestions &&
            (res.needsTeacherReview || res.finalScore === null || res.finalScore === undefined));

        // Percentage calculation
        let pct = 0;
        if (hasAnyGraded && maxTotal > 0) {
          pct = Math.min(100, Math.round((earnedTotal / maxTotal) * 100));
        } else if (res.finalScore !== undefined && res.finalScore !== null && res.finalScore > 0) {
          pct = Math.min(100, Math.round(res.finalScore));
        }

        let gradeLabel = 'قيد التقييم والمراجعة ⏳';
        if (!isGradingPending) {
          if (pct >= 85) gradeLabel = 'ممتاز جداً 🌟';
          else if (pct >= 65) gradeLabel = 'جيد جداً 👍';
          else if (pct >= 50) gradeLabel = 'مقبول — يحتاج مراجعة';
          else gradeLabel = 'راسب — ضعيف جداً';
        } else if (hasPendingQuestions) {
          gradeLabel = 'قيد مراجعة المعلم للإجابات المقالية ⏳';
        }

        const updated: ExamResultReport = {
          attemptId,
          examId: res.examId || this.currentExamId(),
          examTitle: res.examTitle || this.examTitle(),
          scorePercentage: pct,
          studentScore: earnedTotal || res.finalScore,
          totalScore: maxTotal || res.maxScore || answersList.length,
          gradeLabel,
          isPassed: !isGradingPending && pct >= 50,
          isGradingPending,
          // Weaknesses are no longer derived from wrong answers here — the result
          // page refreshes them from the authoritative GET /Weaknesses/active
          // endpoint once grading completes (see student-weakness.service.ts).
          weaknessTopics: [],
          reviewQuestions: mappedReviewQuestions,
          submittedAt: res.submittedAt
            ? new Date(res.submittedAt).toLocaleDateString('ar-EG', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })
            : this.examResult().submittedAt,
        };

        if (!isGradingPending || hasAnyGraded) {
          this.isGradingInProgress.set(false);
          this.gradingStage.set(isGradingPending ? 'pending_review' : 'completed');
          this.gradingProgressPercent.set(100);
        }

        this.examResult.set(updated);

        // Once grading is actually done, refresh from the authoritative weakness
        // endpoint and patch the result in place — this call is fire-and-forget
        // relative to the synchronous map() above; it does not block or delay
        // showing the score/answers.
        if (!isGradingPending) {
          this.weaknessService.loadActiveWeaknesses().subscribe((list) => {
            this.examResult.update((r) => ({
              ...r,
              weaknessTopics: toExamWeaknessTopics(
                list,
                this.currentClassroomId(),
                pct,
                res.examTitle || this.examTitle(),
              ),
            }));
          });
        }

        return updated;
      }),
      catchError(() => of(null)),
    );
  }
}
