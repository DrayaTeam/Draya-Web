// src/app/features/student/channel/student-channel.component.ts

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentQaChannelService } from '../../../core/services/student-qa-channel.service';
import { StudentCoursesService } from '../../../core/services/student-courses.service';
import { ToastService } from '../../../core/services/toast.service';
import {
  QuestionItem,
  QuestionReplyItem,
  QuestionSortBy,
  QuestionFilterBy,
} from '../../../core/models/student-channel.model';

import { DrayaEmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { DrayaCardSkeletonComponent } from '../../../shared/components/card-skeleton/card-skeleton.component';

@Component({
  selector: 'app-student-channel',
  standalone: true,
  imports: [CommonModule, FormsModule, DrayaEmptyStateComponent, DrayaCardSkeletonComponent],
  templateUrl: './student-channel.component.html',
  styleUrl: './student-channel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentChannelComponent implements OnInit, OnDestroy {
  protected readonly qaService = inject(StudentQaChannelService);
  protected readonly coursesService = inject(StudentCoursesService);
  private readonly toastService = inject(ToastService);
  private readonly cdr = inject(ChangeDetectorRef);

  // Classrooms selection
  readonly classrooms = this.coursesService.subscribedPackages;
  readonly selectedClassroomId = signal<string>('');

  // Modal Dialogs - Ask
  readonly showAskModal = signal<boolean>(false);
  readonly newQuestionText = signal<string>('');
  readonly questionPhoto = signal<File | null>(null);
  readonly questionPhotoPreview = signal<string | null>(null);

  // Modal Dialogs - Thread & Reply
  readonly showThreadModal = signal<boolean>(false);
  readonly newReplyText = signal<string>('');
  readonly replyPhoto = signal<File | null>(null);
  readonly replyPhotoPreview = signal<string | null>(null);

  // Edit & Delete Modals - Question
  readonly showEditQuestionModal = signal<boolean>(false);
  readonly editingQuestion = signal<QuestionItem | null>(null);
  readonly editQuestionText = signal<string>('');

  readonly showDeleteQuestionModal = signal<boolean>(false);
  readonly deletingQuestion = signal<QuestionItem | null>(null);

  // Edit & Delete Modals - Reply
  readonly showEditReplyModal = signal<boolean>(false);
  readonly editingReply = signal<QuestionReplyItem | null>(null);
  readonly editReplyText = signal<string>('');

  readonly showDeleteReplyModal = signal<boolean>(false);
  readonly deletingReply = signal<QuestionReplyItem | null>(null);

  // Submitting States
  readonly isSubmittingAction = signal<boolean>(false);

  // Lightbox Zoom Image Modal
  readonly previewImageUrl = signal<string | null>(null);

  // Selected Classroom Computed
  readonly selectedClassroom = computed(() => {
    const id = this.selectedClassroomId();
    return this.classrooms().find((c) => c.id === id) || this.classrooms()[0] || null;
  });

  constructor() {
    effect(() => {
      const list = this.classrooms();
      const current = this.selectedClassroomId();
      if (list.length > 0) {
        if (!current || !list.some((c) => c.id === current)) {
          this.selectedClassroomId.set(list[0].id);
          this.loadClassroomChannel(list[0].id);
        }
      }
    });
  }

  ngOnInit(): void {
    this.coursesService.loadCourses();

    // Start Real-Time Hub Connection
    this.qaService.startSignalRConnection();
  }

  ngOnDestroy(): void {
    const currentClassroomId = this.selectedClassroomId();
    if (currentClassroomId) {
      this.qaService.leaveClassroomHub(currentClassroomId);
    }
    this.qaService.stopSignalRConnection();
  }

  onSelectClassroom(classroomId: string): void {
    if (this.selectedClassroomId() === classroomId) return;
    this.selectedClassroomId.set(classroomId);
    this.loadClassroomChannel(classroomId);
  }

  private loadClassroomChannel(classroomId: string): void {
    this.qaService.joinClassroomHub(classroomId);
    this.qaService.loadQuestions(classroomId).subscribe({
      next: () => void 0,
      error: () => void 0,
    });
  }

  // Filter & Sort
  onFilterChange(filter: QuestionFilterBy): void {
    this.qaService.currentFilterBy.set(filter);
    this.qaService.loadQuestions(this.selectedClassroomId(), { filterBy: filter }).subscribe({
      next: () => void 0,
      error: () => void 0,
    });
  }

  onSortChange(sort: QuestionSortBy): void {
    this.qaService.currentSortBy.set(sort);
    this.qaService.loadQuestions(this.selectedClassroomId(), { sortBy: sort }).subscribe({
      next: () => void 0,
      error: () => void 0,
    });
  }

  onSearch(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.qaService.searchQuery.set(val);
  }

  // Vote
  onToggleVote(event: Event, question: QuestionItem): void {
    event.stopPropagation();
    this.qaService.toggleVote(this.selectedClassroomId(), question.id);
  }

  // Ask Question
  openAskModal(): void {
    this.newQuestionText.set('');
    this.removeQuestionPhoto();
    this.showAskModal.set(true);
    this.cdr.markForCheck();
  }

  closeAskModal(): void {
    this.showAskModal.set(false);
    this.newQuestionText.set('');
    this.removeQuestionPhoto();
    this.cdr.markForCheck();
  }

  onQuestionPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    if (file.size > 5 * 1024 * 1024) {
      this.toastService.warning('تنبيه', 'حجم الصورة يجب ألا يتجاوز 5 ميجابايت.');
      return;
    }

    this.questionPhoto.set(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      this.questionPhotoPreview.set(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  removeQuestionPhoto(): void {
    this.questionPhoto.set(null);
    this.questionPhotoPreview.set(null);
  }

  submitQuestion(): void {
    const text = this.newQuestionText().trim();
    if (!text) {
      this.toastService.warning('تنبيه', 'يرجى كتابة نص السؤال أولاً.');
      return;
    }

    this.qaService.askQuestion(this.selectedClassroomId(), text, this.questionPhoto()).subscribe({
      next: () => {
        this.toastService.success('تم النشر', 'تم نشر سؤالك في القناة الدراسية بنجاح.');
        this.closeAskModal();
      },
      error: () => {
        this.toastService.error('خطأ', 'تعذر نشر السؤال، يرجى المحاولة مرة أخرى.');
      },
    });
  }

  // Thread Discussion
  openThread(question: QuestionItem): void {
    this.qaService.loadQuestionDetails(this.selectedClassroomId(), question.id).subscribe({
      next: () => void 0,
      error: () => void 0,
    });
    this.newReplyText.set('');
    this.removeReplyPhoto();
    this.showThreadModal.set(true);
  }

  closeThread(): void {
    this.showThreadModal.set(false);
    this.newReplyText.set('');
    this.removeReplyPhoto();
  }

  onReplyPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    if (file.size > 5 * 1024 * 1024) {
      this.toastService.warning('تنبيه', 'حجم الصورة يجب ألا يتجاوز 5 ميجابايت.');
      return;
    }

    this.replyPhoto.set(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      this.replyPhotoPreview.set(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  removeReplyPhoto(): void {
    this.replyPhoto.set(null);
    this.replyPhotoPreview.set(null);
  }

  submitReply(): void {
    const text = this.newReplyText().trim();
    const activeQ = this.qaService.activeQuestion();
    if (!text || !activeQ) {
      this.toastService.warning('تنبيه', 'يرجى كتابة نص الرد أولاً.');
      return;
    }

    this.qaService
      .sendReply(this.selectedClassroomId(), activeQ.id, text, this.replyPhoto())
      .subscribe({
        next: () => {
          this.toastService.success('تم الرد', 'تم إضافة ردك إلى النقاش بنجاح.');
          this.newReplyText.set('');
          this.removeReplyPhoto();
        },
        error: () => {
          this.toastService.error('خطأ', 'تعذر إرسال الرد، يرجى المحاولة لاحقاً.');
        },
      });
  }

  // Lightbox Preview
  openImagePreview(url: string, event: Event): void {
    event.stopPropagation();
    this.previewImageUrl.set(url);
  }

  closeImagePreview(): void {
    this.previewImageUrl.set(null);
  }

  // ==========================================
  // Edit & Delete Question Handlers
  // ==========================================

  openEditQuestionModal(question: QuestionItem, event?: Event): void {
    if (event) event.stopPropagation();
    this.editingQuestion.set(question);
    this.editQuestionText.set(question.content);
    this.showEditQuestionModal.set(true);
    this.cdr.markForCheck();
  }

  closeEditQuestionModal(): void {
    this.showEditQuestionModal.set(false);
    this.editingQuestion.set(null);
    this.editQuestionText.set('');
    this.cdr.markForCheck();
  }

  submitEditQuestion(): void {
    const q = this.editingQuestion();
    const text = this.editQuestionText().trim();
    if (!q || !text) {
      this.toastService.warning('تنبيه', 'يرجى كتابة نص السؤال.');
      return;
    }

    this.isSubmittingAction.set(true);
    this.qaService.editQuestion(this.selectedClassroomId(), q.id, text).subscribe({
      next: () => {
        this.isSubmittingAction.set(false);
        this.toastService.success('تم التعديل', 'تم تعديل السؤال بنجاح.');
        this.closeEditQuestionModal();
      },
      error: () => {
        this.isSubmittingAction.set(false);
        this.toastService.error('خطأ', 'تعذر تعديل السؤال، يرجى المحاولة لاحقاً.');
      },
    });
  }

  openDeleteQuestionModal(question: QuestionItem, event?: Event): void {
    if (event) event.stopPropagation();
    this.deletingQuestion.set(question);
    this.showDeleteQuestionModal.set(true);
    this.cdr.markForCheck();
  }

  closeDeleteQuestionModal(): void {
    this.showDeleteQuestionModal.set(false);
    this.deletingQuestion.set(null);
    this.cdr.markForCheck();
  }

  confirmDeleteQuestion(): void {
    const q = this.deletingQuestion();
    if (!q) return;

    this.isSubmittingAction.set(true);
    this.qaService.deleteQuestion(this.selectedClassroomId(), q.id).subscribe({
      next: () => {
        this.isSubmittingAction.set(false);
        this.toastService.success('تم الحذف', 'تم حذف السؤال بنجاح.');
        this.closeDeleteQuestionModal();
        if (this.showThreadModal() && this.qaService.activeQuestion()?.id === q.id) {
          this.closeThread();
        }
      },
      error: () => {
        this.isSubmittingAction.set(false);
        this.toastService.error('خطأ', 'تعذر حذف السؤال، يرجى المحاولة لاحقاً.');
      },
    });
  }

  // ==========================================
  // Edit & Delete Reply Handlers
  // ==========================================

  openEditReplyModal(reply: QuestionReplyItem, event?: Event): void {
    if (event) event.stopPropagation();
    this.editingReply.set(reply);
    this.editReplyText.set(reply.content);
    this.showEditReplyModal.set(true);
    this.cdr.markForCheck();
  }

  closeEditReplyModal(): void {
    this.showEditReplyModal.set(false);
    this.editingReply.set(null);
    this.editReplyText.set('');
    this.cdr.markForCheck();
  }

  submitEditReply(): void {
    const r = this.editingReply();
    const activeQ = this.qaService.activeQuestion();
    const text = this.editReplyText().trim();
    if (!r || !activeQ || !text) {
      this.toastService.warning('تنبيه', 'يرجى كتابة نص الرد.');
      return;
    }

    this.isSubmittingAction.set(true);
    this.qaService.editReply(this.selectedClassroomId(), activeQ.id, r.id, text).subscribe({
      next: () => {
        this.isSubmittingAction.set(false);
        this.toastService.success('تم التعديل', 'تم تعديل الرد بنجاح.');
        this.closeEditReplyModal();
      },
      error: () => {
        this.isSubmittingAction.set(false);
        this.toastService.error('خطأ', 'تعذر تعديل الرد، يرجى المحاولة لاحقاً.');
      },
    });
  }

  openDeleteReplyModal(reply: QuestionReplyItem, event?: Event): void {
    if (event) event.stopPropagation();
    this.deletingReply.set(reply);
    this.showDeleteReplyModal.set(true);
    this.cdr.markForCheck();
  }

  closeDeleteReplyModal(): void {
    this.showDeleteReplyModal.set(false);
    this.deletingReply.set(null);
    this.cdr.markForCheck();
  }

  confirmDeleteReply(): void {
    const r = this.deletingReply();
    const activeQ = this.qaService.activeQuestion();
    if (!r || !activeQ) return;

    this.isSubmittingAction.set(true);
    this.qaService.deleteReply(this.selectedClassroomId(), activeQ.id, r.id).subscribe({
      next: () => {
        this.isSubmittingAction.set(false);
        this.toastService.success('تم الحذف', 'تم حذف الرد بنجاح.');
        this.closeDeleteReplyModal();
      },
      error: () => {
        this.isSubmittingAction.set(false);
        this.toastService.error('خطأ', 'تعذر حذف الرد، يرجى المحاولة لاحقاً.');
      },
    });
  }
}
