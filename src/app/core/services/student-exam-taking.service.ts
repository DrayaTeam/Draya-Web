// src/app/core/services/student-exam-taking.service.ts

import { Injectable, computed, signal } from '@angular/core';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { ApiBaseService } from '../api/api-base.service';
import {
  AnswerSubmissionDto,
  AttemptResultResponseDto,
  ExamQuestion,
  ExamResultReport,
  StudentExamDto,
  SubmitAttemptRequestDto,
  SubmitAttemptResponseDto,
} from '../models/student-exam-taking.model';

const DEFAULT_QUESTIONS: ExamQuestion[] = [
  {
    id: 'q1',
    index: 1,
    text: 'إذا كان ن ل ر = 120 ، فما هي قيم ن ، ر الممكنة لحل هذه المعادلة التباديلية؟',
    subjectTag: 'الجبر',
    selectedOptionId: undefined,
    correctOptionId: 'opt2',
    isFlagged: false,
    options: [
      { id: 'opt1', text: 'ن = 5 ، ر = 3' },
      { id: 'opt2', text: 'ن = 6 ، ر = 3' },
      { id: 'opt3', text: 'ن = 5 ، ر = 4' },
      { id: 'opt4', text: 'ن = 6 ، ر = 2' },
    ],
  },
  {
    id: 'q2',
    index: 2,
    text: 'عدد طرق اختيار لجنة مكونة من 3 أشخاص من بين 8 أشخاص يساوي:',
    subjectTag: 'الجبر',
    selectedOptionId: undefined,
    correctOptionId: 'q2-opt1',
    isFlagged: false,
    options: [
      { id: 'q2-opt1', text: '56 طريقة' },
      { id: 'q2-opt2', text: '336 طريقة' },
      { id: 'q2-opt3', text: '24 طريقة' },
      { id: 'q2-opt4', text: '40 طريقة' },
    ],
  },
  {
    id: 'q3',
    index: 3,
    text: 'في مفكوك (س + أ) ^ ن ، يكون رتبة الحد الأوسط إذا كان ن زوجياً هي:',
    subjectTag: 'الجبر',
    selectedOptionId: undefined,
    correctOptionId: 'q3-opt1',
    isFlagged: false,
    options: [
      { id: 'q3-opt1', text: '(ن / 2) + 1' },
      { id: 'q3-opt2', text: '(ن + 1) / 2' },
      { id: 'q3-opt3', text: 'ن / 2' },
      { id: 'q3-opt4', text: 'ن + 2' },
    ],
  },
];

@Injectable({
  providedIn: 'root',
})
export class StudentExamTakingService extends ApiBaseService {
  readonly examTitle = signal<string>('امتحان الجبر والتباديل والتوافيق — 2026');
  readonly examLevelText = signal<string>('المستوى: الثانوية العامة · بيئة اختبار مؤمنة');
  readonly remainingSeconds = signal<number>(2700); // 45:00
  readonly isLoading = signal<boolean>(false);
  readonly currentAttemptId = signal<string | null>(null);
  readonly currentExamId = signal<string>('exam-1');

  readonly currentQuestionIndex = signal<number>(0);
  readonly isSubmitted = signal<boolean>(false);

  readonly questions = signal<readonly ExamQuestion[]>(DEFAULT_QUESTIONS);

  readonly currentQuestion = computed(() => {
    const idx = this.currentQuestionIndex();
    const list = this.questions();
    return list[idx] || list[0];
  });

  readonly totalQuestionsCount = computed(() => this.questions().length);

  readonly isFirstQuestion = computed(() => this.currentQuestionIndex() === 0);

  readonly isLastQuestion = computed(
    () => this.currentQuestionIndex() === this.totalQuestionsCount() - 1,
  );

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
   * Calls GET /api/v1/students/exams/{id} and falls back to GET /api/v1/exams/{id}.
   */
  loadExamSession(examId: string): Observable<boolean> {
    this.isLoading.set(true);
    this.currentExamId.set(examId);

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
            const questionType =
              q.type || (rawOptions.length > 0 ? 'MultipleChoice' : 'Essay');

            return {
              id: q.id || `q_${idx + 1}`,
              index: idx + 1,
              text: q.text || `سؤال رقم ${idx + 1}`,
              type: questionType,
              subjectTag: q.type || q.difficulty || exam.topic || (questionType === 'Essay' ? 'مقالي' : 'اختيار من متعدد'),
              isFlagged: false,
              selectedOptionId: undefined,
              answerText: undefined,
              correctOptionId: correctOpt?.id || (questionType === 'Essay' ? undefined : rawOptions[0]?.id),
              options: rawOptions.map((o, optIdx) => ({
                id: o.id || `opt_${optIdx + 1}`,
                text: o.text || `الخيار ${optIdx + 1}`,
              })),
            };
          });

          this.questions.set(mapped);
          this.currentQuestionIndex.set(0);
        }

        const durSeconds =
          exam?.durationMinutes && exam.durationMinutes > 0
            ? exam.durationMinutes * 60
            : 2700;
        this.startTimer(durSeconds);
      }),
      map(() => true),
      catchError(() => {
        this.isLoading.set(false);
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
      this.remainingSeconds.set(2700); // 45 minutes default
    }
    this.timerInterval = setInterval(() => {
      this.remainingSeconds.update((s) => {
        if (s <= 1) {
          this.stopTimer();
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
   * and computes the local result preview.
   */
  submitExam(customAttemptId?: string): number {
    this.stopTimer();
    this.isSubmitted.set(true);

    const questionsList = this.questions();
    let correctCount = 0;

    const reviewQuestions = questionsList.map((q) => {
      const isEssay =
        (q.type || '').toLowerCase().includes('essay') || (q.options || []).length === 0;
      const isCorrect = isEssay
        ? !!(q.answerText && q.answerText.trim().length > 0)
        : q.correctOptionId
          ? q.selectedOptionId === q.correctOptionId
          : true;
      if (isCorrect) correctCount++;

      const chosen = isEssay
        ? q.answerText?.trim() || 'لم يتم إدخال إجابة'
        : q.options.find((o) => o.id === q.selectedOptionId)?.text || 'لم يتم الإجابة';
      const correct = isEssay
        ? 'تخضع للتصحيح والتقييم'
        : q.options.find((o) => o.id === q.correctOptionId)?.text || chosen;

      return {
        questionIndex: q.index,
        questionText: q.text,
        isCorrect,
        studentAnswerText: chosen,
        correctAnswerText: correct,
      };
    });

    const finalScore =
      questionsList.length > 0 ? Math.round((correctCount / questionsList.length) * 100) : 100;
    const isPassed = finalScore >= 50;

    let gradeLabel = 'راسب — ضعيف جداً';
    if (finalScore >= 85) gradeLabel = 'ممتاز جداً 🌟';
    else if (finalScore >= 65) gradeLabel = 'جيد جداً 👍';
    else if (finalScore >= 50) gradeLabel = 'مقبول — يحتاج مراجعة';

    const wrongQuestions = reviewQuestions.filter((q) => !q.isCorrect);
    const dynamicWeaknessTopics =
      wrongQuestions.length > 0
        ? wrongQuestions.slice(0, 3).map((q, idx) => ({
            id: `w${idx + 1}`,
            title: `مراجعة: ${q.questionText.length > 50 ? q.questionText.slice(0, 50) + '...' : q.questionText}`,
            accuracyPercentage: Math.max(0, Math.round(finalScore * 0.6)),
            aiTip: `تم اختيار "${q.studentAnswerText}" — يوصى بمراجعة المفاهيم المتعلقة بهذا السؤال لتعزيز الفهم.`,
            reviewLectureUrl: '/student/courses',
          }))
        : [
            {
              id: 'w1',
              title: `إتقان مفاهيم ${this.examTitle()}`,
              accuracyPercentage: 100,
              aiTip: 'أداء استثنائي! تم الإجابة على جميع الأسئلة بصورة نموذجية ودقيقة.',
              reviewLectureUrl: '/student/courses',
            },
          ];

    const targetAttemptId = customAttemptId || this.currentAttemptId() || `att_${Date.now()}`;

    this.examResult.set({
      attemptId: targetAttemptId,
      examId: this.currentExamId(),
      examTitle: this.examTitle(),
      scorePercentage: finalScore,
      gradeLabel,
      isPassed,
      submittedAt: new Date().toLocaleDateString('ar-EG', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      weaknessTopics: dynamicWeaknessTopics,
      reviewQuestions,
    });

    // Fire backend submission if targetAttemptId exists
    if (targetAttemptId) {
      const payload: SubmitAttemptRequestDto = {
        idempotencyKey: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        answers: questionsList.map((q): AnswerSubmissionDto => ({
          examQuestionId: q.id,
          selectedOptionId: q.selectedOptionId || undefined,
          answerText: q.answerText || (q.selectedOptionId ? undefined : ''),
        })),
      };
      this.post<SubmitAttemptResponseDto>(`/attempts/${targetAttemptId}/submit`, payload)
        .pipe(catchError(() => of(null)))
        .subscribe({
          next: () => void 0,
          error: () => void 0,
        });
    }

    return finalScore;
  }

  /**
   * Fetches attempt grading results from GET /api/v1/attempts/{attemptId}/results.
   */
  fetchAttemptResults(attemptId: string): Observable<ExamResultReport | null> {
    return this.get<AttemptResultResponseDto>(`/attempts/${attemptId}/results`).pipe(
      map((res) => {
        if (!res) return null;
        const score = res.finalScore ?? 50;
        const total = res.answers?.length ? res.answers.length : 100;
        const pct = Math.min(100, Math.round((score / total) * 100)) || Math.round(score);

        let gradeLabel = 'مقبول — يحتاج مراجعة';
        if (pct >= 85) gradeLabel = 'ممتاز جداً 🌟';
        else if (pct >= 65) gradeLabel = 'جيد جداً 👍';
        else if (pct < 50) gradeLabel = 'راسب — ضعيف جداً';

        const updated: ExamResultReport = {
          ...this.examResult(),
          attemptId,
          scorePercentage: pct,
          studentScore: score,
          totalScore: total,
          gradeLabel,
          isPassed: pct >= 50,
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
