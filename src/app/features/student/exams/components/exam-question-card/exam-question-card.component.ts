// src/app/features/student/exams/components/exam-question-card/exam-question-card.component.ts

import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExamQuestion } from '../../../../../core/models/student-exam-taking.model';

@Component({
  selector: 'app-exam-question-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exam-question-card.component.html',
  styleUrl: './exam-question-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExamQuestionCardComponent {
  readonly question = input.required<ExamQuestion>();
  readonly totalQuestionsCount = input.required<number>();
  readonly isFirstQuestion = input.required<boolean>();
  readonly isLastQuestion = input.required<boolean>();

  readonly selectOption = output<{ questionId: string; optionId: string }>();
  readonly updateAnswerText = output<{ questionId: string; text: string }>();
  readonly toggleFlag = output<string>();
  readonly nextQuestion = output<void>();
  readonly prevQuestion = output<void>();
  readonly submitExam = output<void>();

  isFillInBlank(): boolean {
    const q = this.question();
    const t = (q.type || '').toLowerCase();
    const tag = (q.subjectTag || '').toLowerCase();
    return (
      t.includes('fill') || t.includes('blank') || tag.includes('أكمل') || tag.includes('فراغ')
    );
  }

  isShortAnswer(): boolean {
    const q = this.question();
    const t = (q.type || '').toLowerCase();
    const tag = (q.subjectTag || '').toLowerCase();
    return t.includes('short') || tag.includes('قصيرة');
  }

  isOpenEnded(): boolean {
    const q = this.question();
    const t = (q.type || '').toLowerCase();
    const tag = (q.subjectTag || '').toLowerCase();
    return (
      t.includes('essay') ||
      t.includes('fill') ||
      t.includes('blank') ||
      t.includes('short') ||
      tag.includes('essay') ||
      tag.includes('مقال') ||
      tag.includes('أكمل') ||
      tag.includes('قصيرة') ||
      q.options.length === 0
    );
  }

  onSelect(optionId: string): void {
    this.selectOption.emit({ questionId: this.question().id, optionId });
  }

  onTextInput(event: Event): void {
    const val = (event.target as HTMLTextAreaElement | HTMLInputElement)?.value ?? '';
    this.updateAnswerText.emit({ questionId: this.question().id, text: val });
  }
}
