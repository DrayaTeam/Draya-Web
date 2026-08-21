// src/app/core/services/student-exam-taking.service.ts

import { Injectable, computed, signal } from '@angular/core';
import { Observable, catchError, map, of, switchMap, tap } from 'rxjs';
import { ApiBaseService } from '../api/api-base.service';
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
  readonly examTitle = signal<string>('جارٍ تحميل تفاصيل الامتحان...');
  readonly examLevelText = signal<string>('بيئة اختبار تفاعلية مؤمنة');
  readonly remainingSeconds = signal<number>(2700); // 45:00
  readonly isLoading = signal<boolean>(false);
  readonly currentAttemptId = signal<string | null>(null);
  readonly currentExamId = signal<string>('exam-1');

  readonly currentQuestionIndex = signal<number>(0);
  readonly isSubmitted = signal<boolean>(false);
  readonly isGradingInProgress = signal<boolean>(false);
  readonly gradingStage = signal<'submitting' | 'ai_evaluating' | 'completed' | 'pending_review'>('completed');
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
    examId: 'exam-1',
    examTitle: 'امتحان الجبر والتباديل والتوافيق — 2026',
    scorePercentage: 66.6,
    gradeLabel: 'مقبول — يحتاج تحسين',
    isPassed: true,
    submittedAt: '20 يوليو 2026',
    weaknessTopics: [
      {
        id: 'w1',
        title: 'التباديل وحساب المضاريب',
        accuracyPercentage: 33,
        aiTip: 'أخطاء متكررة في فهم قيم ن الممكنة لمضروب العدد.',
        reviewLectureUrl: '#',
      },
      {
        id: 'w2',
        title: 'التوافيق وحل مسائل اللجان المشتركة',
        accuracyPercentage: 50,
        aiTip: 'صعوبة في تحديد الفرق بين التباديل والتوافيق في سياق الاختيار العشوائي.',
        reviewLectureUrl: '#',
      },
    ],
    reviewQuestions: [
      {
        questionIndex: 1,
        questionText: 'إذا كان ن ل ر = 120 ، فما هي قيم ن ، ر الممكنة؟',
        isCorrect: false,
        studentAnswerText: 'ن = 5 ، ر = 3',
        correctAnswerText: 'ن = 6 ، ر = 3',
      },
      {
        questionIndex: 2,
        questionText: 'عدد طرق اختيار لجنة مكونة من 3 أشخاص من بين 8 أشخاص يساوي:',
        isCorrect: true,
        studentAnswerText: '56 طريقة',
        correctAnswerText: '56 طريقة',
      },
      {
        questionIndex: 3,
        questionText: 'في مفكوك (س + أ) ^ ن ، يكون رتبة الحد الأوسط إذا كان ن زوجياً هي:',
        isCorrect: true,
        studentAnswerText: '(ن / 2) + 1',
        correctAnswerText: '(ن / 2) + 1',
      },
    ],
  });

  private timerInterval: ReturnType<typeof setInterval> | null = null;
  readonly violations = signal<number>(0);

  /**
   * Loads real exam questions and details from the database.
   */
  loadExamSession(examId: string): Observable<boolean> {
    this.isLoading.set(true);
    this.currentExamId.set(examId);

    this.post<StartAttemptResponseDto>(`/attempts/start`, { examId })
      .pipe(catchError(() => of(null)))
      .subscribe((att) => {
        const id = att?.attemptId || att?.id;
        if (id) {
          this.currentAttemptId.set(id);
        }
      });

    return this.get<StudentExamDto>(`/students/exams/${examId}`).pipe(
      catchError(() => this.get<StudentExamDto>(`/exams/${examId}`)),
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

    // Set initial report state in pending review mode
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
      reviewQuestions: questionsList.map((q) => {
        const isEssay =
          (q.type || '').toLowerCase().includes('essay') || (q.options || []).length === 0;
        const chosen = isEssay
          ? q.answerText?.trim() || 'لم يتم إدخال إجابة'
          : q.options.find((o) => o.id === q.selectedOptionId)?.text || 'لم يتم الإجابة';
        return {
          questionIndex: q.index,
          questionText: q.text,
          isCorrect: false,
          isPendingGrading: true,
          studentAnswerText: chosen,
          correctAnswerText: isEssay
            ? 'تخضع لمعايير التقييم الذكي بالذكاء الاصطناعي'
            : 'سيتم إعلان الإجابة النموذجية فور اعتماد النتيجة',
        };
      }),
    });

    // Fire backend submission if targetAttemptId exists
    if (targetAttemptId && !targetAttemptId.startsWith('att_')) {
      const payload: SubmitAttemptRequestDto = {
        idempotencyKey: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        answers: questionsList.map((q): AnswerSubmissionDto => ({
          examQuestionId: q.id,
          selectedOptionId: q.selectedOptionId || undefined,
          answerText: q.answerText || (q.selectedOptionId ? undefined : ''),
        })),
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
                console.warn('AI Grade endpoint notification (falling back to attempt polling):', err?.message || err);
                return of(subRes?.gradingJobId || null);
              }),
            ),
          ),
          catchError((err) => {
            console.warn('Submit attempt notification:', err?.message || err);
            return of(null);
          }),
        )
        .subscribe({
          next: (jobId) => {
            if (jobId) {
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
        this.gradingStage.set('completed');
        this.gradingProgressPercent.set(100);
      }, 1500);
    }

    return 0;
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
        const hasGrading = res && !res.isGradingPending && res.reviewQuestions.some((q) => !q.isPendingGrading);
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
        const isAnyGraded = answersList.some((a) => !!a.gradingResult);
        const questionsList = this.questions();

        let earnedTotal = 0;
        let maxTotal = 0;

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
            const earnedScore = grading?.score ?? 0;
            const maxScore = grading?.maxScore ?? (isEssay ? 10 : 1);

            earnedTotal += earnedScore;
            maxTotal += maxScore;

            const isCorrect = isGraded
              ? maxScore > 0
                ? earnedScore / maxScore >= 0.5
                : earnedScore > 0
              : false;

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

            if (!isEssay && questionDef?.correctOptionId) {
              const correctOpt = questionDef.options.find(
                (o) => o.id === questionDef.correctOptionId,
              );
              if (correctOpt) {
                correctAnswerText = correctOpt.text;
              }
            } else if (!isGraded) {
              correctAnswerText = 'سيتم إعلان الإجابة فور اكتمال التقييم';
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
              isPendingGrading: !isGraded,
            };
          });
        } else {
          mappedReviewQuestions = this.examResult().reviewQuestions as ExamReviewItem[];
        }

        // Percentage calculation
        let pct = 0;
        if (isAnyGraded && maxTotal > 0) {
          pct = Math.min(100, Math.round((earnedTotal / maxTotal) * 100));
        } else if (res.finalScore !== undefined && res.finalScore !== null) {
          pct = Math.min(100, Math.round(res.finalScore));
        }

        const isGradingPending = !isAnyGraded && (res.needsTeacherReview || !res.finalScore);

        let gradeLabel = 'قيد التقييم والمراجعة ⏳';
        if (!isGradingPending) {
          if (pct >= 85) gradeLabel = 'ممتاز جداً 🌟';
          else if (pct >= 65) gradeLabel = 'جيد جداً 👍';
          else if (pct >= 50) gradeLabel = 'مقبول — يحتاج مراجعة';
          else gradeLabel = 'راسب — ضعيف جداً';
        }

        const wrongQuestions = mappedReviewQuestions.filter((q) => !q.isCorrect && !q.isPendingGrading);
        const dynamicWeaknessTopics =
          wrongQuestions.length > 0
            ? wrongQuestions.slice(0, 3).map((q, idx) => ({
                id: `w${idx + 1}`,
                title: `مراجعة: ${q.questionText.length > 50 ? q.questionText.slice(0, 50) + '...' : q.questionText}`,
                accuracyPercentage: Math.max(0, Math.round(pct * 0.6)),
                aiTip:
                  q.explanation ||
                  `تم اختيار "${q.studentAnswerText}" — يوصى بمراجعة المفاهيم المتعلقة بهذا السؤال.`,
                reviewLectureUrl: '/student/courses',
              }))
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
        this.examResult.set(updated);
        return updated;
      }),
      catchError(() => of(null)),
    );
  }
}
