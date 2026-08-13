// src/app/core/services/student-exam-taking.service.ts

import { Injectable, computed, signal } from '@angular/core';
import {
  ExamQuestion,
  ExamResultReport,
} from '../models/student-exam-taking.model';

@Injectable({
  providedIn: 'root',
})
export class StudentExamTakingService {
  readonly examTitle = signal<string>('امتحان الجبر والتباديل والتوافيق — 2026');
  readonly examLevelText = signal<string>('المستوى: الثانوية العامة · بيئة اختبار مؤمنة');
  readonly remainingSeconds = signal<number>(2699); // 44:59

  readonly currentQuestionIndex = signal<number>(0);
  readonly isSubmitted = signal<boolean>(false);

  readonly questions = signal<readonly ExamQuestion[]>([
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
      selectedOptionId: 'q2-opt1',
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
      selectedOptionId: 'q3-opt1',
      correctOptionId: 'q3-opt1',
      isFlagged: false,
      options: [
        { id: 'q3-opt1', text: '(ن / 2) + 1' },
        { id: 'q3-opt2', text: '(ن + 1) / 2' },
        { id: 'q3-opt3', text: 'ن / 2' },
        { id: 'q3-opt4', text: 'ن + 2' },
      ],
    },
  ]);

  readonly currentQuestion = computed(() => {
    const idx = this.currentQuestionIndex();
    const list = this.questions();
    return list[idx] || list[0];
  });

  readonly totalQuestionsCount = computed(() => this.questions().length);

  readonly isFirstQuestion = computed(() => this.currentQuestionIndex() === 0);

  readonly isLastQuestion = computed(
    () => this.currentQuestionIndex() === this.totalQuestionsCount() - 1
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

  selectOption(questionId: string, optionId: string): void {
    this.questions.update((list) =>
      list.map((q) =>
        q.id === questionId ? { ...q, selectedOptionId: optionId } : q
      )
    );
  }

  toggleFlagQuestion(questionId: string): void {
    this.questions.update((list) =>
      list.map((q) =>
        q.id === questionId ? { ...q, isFlagged: !q.isFlagged } : q
      )
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

  submitExam(): void {
    this.isSubmitted.set(true);
  }
}
