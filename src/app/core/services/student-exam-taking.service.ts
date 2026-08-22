import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, switchMap, tap } from 'rxjs';
import { ApiBaseService } from '../api/api-base.service';
import { SignalRService } from '../signalr/signalr.service';
import { ToastService } from './toast.service';
import {
  AnswerSubmissionDto,
  AttemptResultResponseDto,
  ExamQuestion,
  ExamResultReport,
  ExamReviewItem,
  GradingJobStatusDto,
  StartAttemptResponseDto,
  StudentExamDto,
  SubmitAttemptRequestDto,
  SubmitAttemptResponseDto,
} from '../models/student-exam-taking.model';

@Injectable({
  providedIn: 'root',
})
export class StudentExamTakingService extends ApiBaseService {
  private readonly signalR = inject(SignalRService);
  private readonly toastService = inject(ToastService);

  readonly examTitle = signal<string>('جارٍ تحميل تفاصيل الامتحان...');
  readonly examLevelText = signal<string>('بيئة اختبار تفاعلية مؤمنة');
  readonly remainingSeconds = signal<number>(2700); // 45:00
  readonly isLoading = signal<boolean>(false);
  readonly currentAttemptId = signal<string | null>(null);
  readonly currentExamId = signal<string>('exam-1');

  readonly currentQuestionIndex = signal<number>(0);
  readonly isSubmitted = signal<boolean>(false);
  readonly isGradingInProgress = signal<boolean>(false);
  readonly gradingStage = signal<'submitting' | 'ai_evaluating' | 'completed' | 'pending_review'>(
    'completed',
  );
  readonly gradingProgressPercent = signal<number>(0);

  readonly questions = signal<readonly ExamQuestion[]>([]);

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
   * Loads real exam questions and details from the database.
   */
  loadExamSession(examId: string): Observable<boolean> {
    this.resetExamSession();
    this.isLoading.set(true);
    this.currentExamId.set(examId);

    const isGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(examId);

    const startAttempt$ = isGuid
      ? this.post<StartAttemptResponseDto>(`/attempts/start`, { examId }).pipe(
          tap((att) => {
            const id = att?.attemptId || att?.id;
            if (id) {
              this.currentAttemptId.set(id);
            }
          }),
          catchError((err) => {
            const status = err?.status;
            if (status === 400 || status === 500 || status === 409) {
              this.isAttemptAlreadyCompleted.set(true);
            }
            console.warn(
              'Attempt start server notification:',
              err?.error?.message || err?.message || err,
            );
            return of(null);
          }),
        )
      : of(null);

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

        if (exam?.questions && Array.isArray(exam.questions) && exam.questions.length > 0) {
          const mapped: ExamQuestion[] = exam.questions.map((q, idx) => {
            const rawOptions = (q.options || []) as {
              id?: string;
              text?: string;
              isCorrect?: boolean;
            }[];
            const correctOpt = rawOptions.find((o) => o.isCorrect);
            const questionType = q.type || (rawOptions.length > 0 ? 'MultipleChoice' : 'Essay');

            return {
              id: q.id || `q_${idx + 1}`,
              index: idx + 1,
              text: q.text || `سؤال رقم ${idx + 1}`,
              type: questionType,
              subjectTag:
                q.type ||
                q.difficulty ||
                exam.topic ||
                (questionType === 'Essay' ? 'مقالي' : 'اختيار من متعدد'),
              isFlagged: false,
              selectedOptionId: undefined,
              answerText: undefined,
              correctOptionId: correctOpt?.id,
              options: rawOptions.map((o, optIdx) => ({
                id: o.id || `opt_${optIdx + 1}`,
                text: o.text || `الخيار ${optIdx + 1}`,
              })),
            };
          });

          this.questions.set(mapped);
          this.currentQuestionIndex.set(0);
        } else {
          this.questions.set([]);
          this.currentQuestionIndex.set(0);
        }

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
        if (exam.questions && Array.isArray(exam.questions) && exam.questions.length > 0) {
          const mapped: ExamQuestion[] = exam.questions.map((q, idx) => {
            const rawOptions = (q.options || []) as {
              id?: string;
              text?: string;
              isCorrect?: boolean;
            }[];
            const correctOpt = rawOptions.find((o) => o.isCorrect);
            const questionType = q.type || (rawOptions.length > 0 ? 'MultipleChoice' : 'Essay');

            return {
              id: q.id || `q_${idx + 1}`,
              index: idx + 1,
              text: q.text || `سؤال رقم ${idx + 1}`,
              type: questionType,
              subjectTag:
                q.type ||
                q.difficulty ||
                exam.topic ||
                (questionType === 'Essay' ? 'مقالي' : 'اختيار من متعدد'),
              isFlagged: false,
              selectedOptionId: undefined,
              answerText: undefined,
              correctOptionId: correctOpt?.id,
              options: rawOptions.map((o, optIdx) => ({
                id: o.id || `opt_${optIdx + 1}`,
                text: o.text || `الخيار ${optIdx + 1}`,
              })),
            };
          });
          this.questions.set(mapped);
        }
      }),
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

  /**
   * Submits the student's answers to POST /api/v1/attempts/{attemptId}/submit
   * and initiates AI grading with polling and state tracking.
   */
  submitExam(customAttemptId?: string): number {
    this.stopTimer();
    this.isSubmitted.set(true);
    this.isGradingInProgress.set(true);
    this.gradingStage.set('submitting');
    this.gradingProgressPercent.set(30);

    const questionsList = this.questions();
    const targetAttemptId = customAttemptId || this.currentAttemptId() || `att_${Date.now()}`;

    let earnedTotal = 0;
    let maxTotal = 0;
    let hasAnyKey = false;

    const mappedReviewQuestions: ExamReviewItem[] = questionsList.map((q) => {
      const isEssay =
        (q.type || '').toLowerCase().includes('essay') || (q.options || []).length === 0;
      const chosen = isEssay
        ? q.answerText?.trim() || 'لم يتم إدخال إجابة'
        : q.options.find((o) => o.id === q.selectedOptionId)?.text || 'لم يتم الإجابة';

      let isCorrect = false;
      let isPendingGrading = true;
      let correctAnswerText = isEssay
        ? 'تخضع لمعايير التقييم الذكي بالذكاء الاصطناعي'
        : 'سيتم إعلان الإجابة النموذجية فور اعتماد النتيجة';

      if (!isEssay && q.correctOptionId) {
        hasAnyKey = true;
        isCorrect = q.selectedOptionId === q.correctOptionId;
        isPendingGrading = false;
        earnedTotal += isCorrect ? 1 : 0;
        maxTotal += 1;

        const correctOpt = q.options.find((o) => o.id === q.correctOptionId);
        if (correctOpt) {
          correctAnswerText = correctOpt.text;
        }
      }

      return {
        questionIndex: q.index,
        questionText: q.text,
        isCorrect,
        isPendingGrading,
        studentAnswerText: chosen,
        correctAnswerText,
        earnedScore: isCorrect ? 1 : 0,
        maxScore: isEssay ? 10 : 1,
      };
    });

    const hasPendingQuestions = mappedReviewQuestions.some((q) => q.isPendingGrading);
    const isGradingPending = !!targetAttemptId && (!hasAnyKey || hasPendingQuestions);

    let computedScorePct = 0;
    if (hasAnyKey && maxTotal > 0) {
      computedScorePct = Math.min(100, Math.round((earnedTotal / maxTotal) * 100));
    }

    let gradeLabel = 'قيد التقييم والتصحيح الذكي ⏳';
    if (!isGradingPending) {
      if (computedScorePct >= 85) gradeLabel = 'ممتاز جداً 🌟';
      else if (computedScorePct >= 65) gradeLabel = 'جيد جداً 👍';
      else if (computedScorePct >= 50) gradeLabel = 'مقبول — يحتاج مراجعة';
      else gradeLabel = 'راسب — ضعيف جداً';
    }

    const wrongQuestions = mappedReviewQuestions.filter((q) => !q.isCorrect && !q.isPendingGrading);
    const dynamicWeaknessTopics =
      wrongQuestions.length > 0
        ? wrongQuestions.slice(0, 3).map((q, idx) => {
            const isEssay = (q.maxScore || 1) > 1;
            const earned = q.earnedScore ?? 0;
            const max = q.maxScore ?? (isEssay ? 10 : 1);
            const qAccuracy =
              max > 0 ? Math.round((earned / max) * 100) : q.isCorrect ? 100 : 0;

            let customTip = q.explanation;
            if (
              !customTip ||
              customTip.toLowerCase().includes('deterministic') ||
              customTip.toLowerCase().includes('exact match')
            ) {
              customTip =
                q.correctAnswerText && q.correctAnswerText !== 'الإجابة النموذجية'
                  ? `الإجابة الصحيحة هي: "${q.correctAnswerText}" (إجابتك: "${q.studentAnswerText}")`
                  : `تم اختيار "${q.studentAnswerText}" — يوصى بمراجعة المفاهيم المتعلقة بهذا السؤال.`;
            }

            return {
              id: `w${idx + 1}`,
              title: `مراجعة: ${q.questionText.length > 50 ? q.questionText.slice(0, 50) + '...' : q.questionText}`,
              accuracyPercentage: qAccuracy,
              aiTip: customTip,
              reviewLectureUrl: '/student/courses',
            };
          })
        : isGradingPending
          ? []
          : [
              {
                id: 'w1',
                title: `إتقان مفاهيم ${this.examTitle()}`,
                accuracyPercentage: 100,
                aiTip: 'أداء استثنائي! تم الإجابة على جميع الأسئلة بصورة نموذجية ودقيقة.',
                reviewLectureUrl: '/student/courses',
              },
            ];

    this.examResult.set({
      attemptId: targetAttemptId,
      examId: this.currentExamId(),
      examTitle: this.examTitle(),
      scorePercentage: computedScorePct,
      studentScore: earnedTotal,
      totalScore: maxTotal,
      gradeLabel,
      isPassed: !isGradingPending && computedScorePct >= 50,
      isGradingPending,
      submittedAt: new Date().toLocaleDateString('ar-EG', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      weaknessTopics: dynamicWeaknessTopics,
      reviewQuestions: mappedReviewQuestions,
    });

    // Fire backend submission if targetAttemptId exists and is not a mock ID
    if (targetAttemptId && !targetAttemptId.startsWith('att_')) {
      const answers: AnswerSubmissionDto[] = questionsList
        .filter((q) => !!q.id)
        .map((q): AnswerSubmissionDto => {
          const isEssay =
            (q.type || '').toLowerCase().includes('essay') || (q.options || []).length === 0;

          if (isEssay) {
            const text = q.answerText?.trim();
            return {
              examQuestionId: q.id,
              answerText: text && text.length > 0 ? text : null,
              selectedOptionId: null,
            };
          } else {
            return {
              examQuestionId: q.id,
              selectedOptionId: q.selectedOptionId || null,
              answerText: null,
            };
          }
        });

      const payload: SubmitAttemptRequestDto = {
        idempotencyKey: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        answers,
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
              catchError((err) => {
                console.warn(
                  'AI Grade endpoint notification (falling back to attempt polling):',
                  err?.message || err,
                );
                return of(subRes?.gradingJobId || null);
              }),
            ),
          ),
          catchError((err) => {
            const errorMsg =
              err?.error?.message ||
              err?.error?.title ||
              err?.error?.detail ||
              err?.message ||
              'تعذر تسليم الامتحان';
            console.warn('Submit attempt notification:', errorMsg);

            if (typeof errorMsg === 'string' && errorMsg.toLowerCase().includes('expired')) {
              this.toastService.error(
                'انتهت مدة الامتحان ⏱️',
                'انتهت المدة الزمنية المسموح بها لهذا الاختبار على الخادم ولم يعد من الممكن التسليم المتأخر.',
              );
            } else if (
              typeof errorMsg === 'string' &&
              errorMsg.includes('already been submitted')
            ) {
              this.toastService.info('تم التسليم مسبقاً', 'تم استلام إجابات هذا الاختبار مسبقاً.');
            } else {
              this.toastService.warning('تنبيه تسليم الامتحان', errorMsg);
            }

            // Immediately finish grading spinner so student can view the review interface
            this.isGradingInProgress.set(false);
            this.gradingStage.set(isGradingPending ? 'pending_review' : 'completed');
            this.gradingProgressPercent.set(100);

            return of('SUBMIT_FAILED');
          }),
        )
        .subscribe({
          next: (jobId) => {
            if (jobId === 'SUBMIT_FAILED') {
              // Try fetching existing results once, if any exist
              this.fetchAttemptResults(targetAttemptId).subscribe(() => {
                this.isGradingInProgress.set(false);
                this.gradingStage.set('completed');
                this.gradingProgressPercent.set(100);
              });
            } else if (jobId) {
              this.pollGradingJob(jobId, targetAttemptId);
            } else {
              this.pollAttemptResultsDirectly(targetAttemptId);
            }
          },
        });
    } else {
      // Local simulation completion
      setTimeout(() => {
        this.isGradingInProgress.set(false);
        this.gradingStage.set(isGradingPending ? 'pending_review' : 'completed');
        this.gradingProgressPercent.set(100);
      }, 1500);
    }

    return computedScorePct;
  }

  /**
   * Polls background AI grading job until status is Completed.
   */
  pollGradingJob(jobId: string, attemptId: string, maxAttempts = 6): void {
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
    interval = setInterval(checkJob, 1500);
  }

  /**
   * Direct attempt result polling when job ID is unavailable or direct fallback is needed.
   */
  pollAttemptResultsDirectly(attemptId: string, maxTries = 4): void {
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
    interval = setInterval(check, 2000);
  }

  /**
   * Fetches attempt grading results from GET /api/v1/attempts/{attemptId}/results.
   * Maps server-graded answers and AI rationale back to the UI.
   */
  fetchAttemptResults(attemptId: string): Observable<ExamResultReport | null> {
    return this.get<AttemptResultResponseDto>(`/attempts/${attemptId}/results`).pipe(
      map((res) => {
        if (!res) return null;

        const answersList = res.answers || [];
        const questionsList = this.questions();

        let earnedTotal = 0;
        let maxTotal = 0;
        let hasAnyGradedOrLocalKey = false;

        let mappedReviewQuestions: ExamReviewItem[] = [];
        if (answersList.length > 0) {
          mappedReviewQuestions = answersList.map((ans, idx) => {
            const questionDef = questionsList.find((q) => q.id === ans.examQuestionId);
            const questionText = questionDef?.text || `سؤال رقم ${idx + 1}`;
            const isEssay =
              (questionDef?.type || '').toLowerCase().includes('essay') ||
              (questionDef?.options || []).length === 0;

            const grading = ans.gradingResult;
            const isGraded = !!grading;

            let isCorrect = false;
            let isPendingGrading = true;
            let earnedScore = 0;
            let maxScore = isEssay ? 10 : 1;

            if (isGraded) {
              hasAnyGradedOrLocalKey = true;
              earnedScore = grading.score ?? 0;
              maxScore = grading.maxScore ?? maxScore;
              isCorrect = maxScore > 0 ? earnedScore / maxScore >= 0.5 : earnedScore > 0;
              isPendingGrading = false;
              earnedTotal += earnedScore;
              maxTotal += maxScore;
            } else if (!isEssay && questionDef?.correctOptionId && ans.selectedOptionId) {
              hasAnyGradedOrLocalKey = true;
              isCorrect = ans.selectedOptionId === questionDef.correctOptionId;
              earnedScore = isCorrect ? 1 : 0;
              maxScore = 1;
              isPendingGrading = false;
              earnedTotal += earnedScore;
              maxTotal += 1;
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
              } else if (ans.correctOptionId || questionDef?.correctOptionId) {
                const correctOptId = ans.correctOptionId || questionDef?.correctOptionId;
                const correctOpt = questionDef?.options?.find((o) => o.id === correctOptId);
                if (correctOpt) {
                  correctAnswerText = correctOpt.text || 'الإجابة النموذجية';
                }
              } else if (!isGraded) {
                correctAnswerText = 'سيتم إعلان الإجابة فور اكتمال التقييم';
              }
            }

            let explanation = grading?.rationale || undefined;
            if (
              explanation &&
              (explanation.toLowerCase().includes('deterministic') ||
                explanation.toLowerCase().includes('exact match'))
            ) {
              explanation = undefined;
            }

            return {
              questionIndex: questionDef?.index ?? idx + 1,
              questionText,
              isCorrect,
              studentAnswerText,
              correctAnswerText,
              explanation,
              earnedScore,
              maxScore,
              isAiGraded: grading?.isAiGraded,
              needsTeacherReview: grading?.needsTeacherReview,
              isPendingGrading,
            };
          });
        } else if (this.examResult().reviewQuestions.length > 0) {
          mappedReviewQuestions = this.examResult().reviewQuestions as ExamReviewItem[];
        } else if (questionsList.length > 0) {
          mappedReviewQuestions = questionsList.map((q, idx) => {
            const isEssay =
              (q.type || '').toLowerCase().includes('essay') || (q.options || []).length === 0;
            const selectedOpt = q.options.find((o) => o.id === q.selectedOptionId);
            const correctOpt = q.options.find((o) => o.id === q.correctOptionId);
            const isCorrect = !isEssay && q.selectedOptionId === q.correctOptionId;

            return {
              questionIndex: q.index || idx + 1,
              questionText: q.text,
              isCorrect,
              studentAnswerText: isEssay
                ? q.answerText || 'لم يتم إدخال إجابة'
                : selectedOpt?.text || 'لم يتم اختيار إجابة',
              correctAnswerText: isEssay
                ? 'إجابة نموذجية معتمدة'
                : correctOpt?.text || 'الإجابة النموذجية',
              explanation: isEssay
                ? 'تخضع لمراجعة واعتماد المعلم والذكاء الاصطناعي.'
                : isCorrect
                  ? 'إجابة صحيحة.'
                  : 'إجابة خاطئة.',
              earnedScore: isEssay ? 0 : isCorrect ? 1 : 0,
              maxScore: isEssay ? 10 : 1,
              isAiGraded: isEssay,
              isPendingGrading: isEssay,
            };
          });
        }

        const hasPendingQuestions = mappedReviewQuestions.some((q) => q.isPendingGrading);
        const isGradingPending =
          !hasAnyGradedOrLocalKey ||
          (hasPendingQuestions &&
            (res.needsTeacherReview || res.finalScore === null || res.finalScore === undefined));

        // Percentage calculation
        let pct = 0;
        if (hasAnyGradedOrLocalKey && maxTotal > 0) {
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
        }

        const wrongQuestions = mappedReviewQuestions.filter(
          (q) => !q.isCorrect && !q.isPendingGrading,
        );
        const dynamicWeaknessTopics =
          wrongQuestions.length > 0
            ? wrongQuestions.slice(0, 3).map((q, idx) => {
                const isEssay = (q.maxScore || 1) > 1;
                const earned = q.earnedScore ?? 0;
                const max = q.maxScore ?? (isEssay ? 10 : 1);
                const qAccuracy =
                  max > 0 ? Math.round((earned / max) * 100) : q.isCorrect ? 100 : 0;

                let customTip = q.explanation;
                if (
                  !customTip ||
                  customTip.toLowerCase().includes('deterministic') ||
                  customTip.toLowerCase().includes('exact match')
                ) {
                  customTip =
                    q.correctAnswerText && q.correctAnswerText !== 'الإجابة النموذجية'
                      ? `الإجابة الصحيحة هي: "${q.correctAnswerText}" (إجابتك: "${q.studentAnswerText}")`
                      : `تم اختيار "${q.studentAnswerText}" — يوصى بمراجعة المفاهيم المتعلقة بهذا السؤال.`;
                }

                return {
                  id: `w${idx + 1}`,
                  title: `مراجعة: ${q.questionText.length > 50 ? q.questionText.slice(0, 50) + '...' : q.questionText}`,
                  accuracyPercentage: qAccuracy,
                  aiTip: customTip,
                  reviewLectureUrl: '/student/courses',
                };
              })
            : hasPendingQuestions
              ? [
                  {
                    id: 'w_pending',
                    title: `مراجعة وتقييم: ${this.examTitle()}`,
                    accuracyPercentage: 50,
                    aiTip: 'تم استلام إجاباتك المقالية وجارٍ فحصها واعتمادها من قِبل المعلم والذكاء الاصطناعي.',
                    reviewLectureUrl: '/student/courses',
                  },
                ]
              : [
                  {
                    id: 'w1',
                    title: `إتقان مفاهيم ${this.examTitle()}`,
                    accuracyPercentage: 100,
                    aiTip: 'أداء استثنائي! تم الإجابة على جميع الأسئلة بصورة نموذجية ودقيقة.',
                    reviewLectureUrl: '/student/courses',
                  },
                ];

        const updated: ExamResultReport = {
          attemptId,
          examId: res.examId || this.currentExamId(),
          examTitle: this.examTitle(),
          scorePercentage: pct,
          studentScore: earnedTotal || res.finalScore,
          totalScore: maxTotal || answersList.length,
          gradeLabel,
          isPassed: !isGradingPending && pct >= 50,
          isGradingPending,
          weaknessTopics: dynamicWeaknessTopics,
          reviewQuestions: mappedReviewQuestions,
          submittedAt: res.submittedAt
            ? new Date(res.submittedAt).toLocaleDateString('ar-EG', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })
            : this.examResult().submittedAt,
        };

        if (!isGradingPending || hasAnyGradedOrLocalKey) {
          this.isGradingInProgress.set(false);
          this.gradingStage.set(isGradingPending ? 'pending_review' : 'completed');
          this.gradingProgressPercent.set(100);
        }

        this.examResult.set(updated);
        return updated;
      }),
      catchError(() => of(null)),
    );
  }
}
