import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExamReviewItem } from '../../../../../core/models/student-exam-taking.model';
import { MarkdownRendererComponent } from '../../../../../shared/components/markdown-renderer/markdown-renderer.component';

@Component({
  selector: 'app-exam-question-review-card',
  standalone: true,
  imports: [CommonModule, MarkdownRendererComponent],
  templateUrl: './exam-question-review-card.component.html',
  styleUrl: './exam-question-review-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExamQuestionReviewCardComponent {
  readonly reviewItem = input.required<ExamReviewItem>();
}
