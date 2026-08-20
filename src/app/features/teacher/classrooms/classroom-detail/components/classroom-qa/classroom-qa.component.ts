import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  effect,
  input,
  computed,
  HostListener,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { finalize } from 'rxjs/operators';
import { QaService } from '../../../../services/qa.service';
import {
  QuestionDto,
  QuestionFilters,
  QuestionReplyDto,
} from '../../../../../../core/models/qa.model';
import { ApiError } from '../../../../../../core/models/api-error.model';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../../../../features/auth';

@Component({
  selector: 'draya-classroom-qa',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, ButtonModule, TooltipModule],
  templateUrl: './classroom-qa.component.html',
  styleUrl: './classroom-qa.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClassroomQaComponent {
  readonly classroomId = input.required<string>();

  private readonly qaService = inject(QaService);
  private readonly messageService = inject(MessageService, { optional: true });
  private readonly auth = inject(AuthService);

  readonly currentUserPictureUrl = computed(() => {
    const user = this.auth.currentUser();
    return user?.profilePictureUrl || user?.pictureUrl || null;
  });

  readonly currentUserInitial = computed(() => {
    const name = this.auth.currentUser()?.fullName || '';
    return name.trim().charAt(0) || 'م';
  });


  readonly questions = signal<QuestionDto[]>([]);
  readonly isLoading = signal<boolean>(false);

  readonly filters = signal<QuestionFilters>({
    pageNumber: 1,
    pageSize: 20,
    sortBy: 'newest',
    filterBy: '',
  });

  readonly sortOptions = [
    { label: 'الأحدث', value: 'newest' },
    { label: 'الأقدم', value: 'oldest' },
  ];

  readonly filterOptions = [
    { label: 'الكل', value: '' },
    { label: 'بانتظار إجابة', value: 'unanswered' },
    { label: 'تمت الإجابة', value: 'answered' },
  ];

  // Thread expansion
  readonly expandedThreads = signal<Set<string>>(new Set());
  readonly threadReplies = signal<Map<string, QuestionReplyDto[]>>(new Map());
  readonly threadLoading = signal<Set<string>>(new Set());
  readonly replyContents = signal<Map<string, string>>(new Map());

  // New Question State
  readonly isNewQuestionMode = signal<boolean>(false);
  newQuestionContent = '';
  readonly isPosting = signal<boolean>(false);
  readonly selectedImageFile = signal<File | null>(null);
  readonly selectedImagePreview = signal<string | null>(null);

  // Edit Question State
  readonly editingQuestionId = signal<string | null>(null);
  editQuestionContent = '';

  // Edit Reply State
  readonly editingReplyId = signal<string | null>(null);
  editReplyContent = '';

  // Image attach state for replies
  readonly replySelectedImages = signal<Map<string, File>>(new Map());
  readonly replyImagePreviews = signal<Map<string, string>>(new Map());

  // Custom Dropdown State
  readonly activeDropdownId = signal<string | null>(null);

  // Pinned locally (since API doesn't support pinning yet)
  readonly localPinnedQuestions = signal<Set<string>>(new Set());

  // Computed sorted questions (pinned at top, then by selected sort)
  readonly sortedQuestions = computed(() => {
    const pinned = this.localPinnedQuestions();
    const sort = this.filters().sortBy;
    const filter = this.filters().filterBy;

    // 1. Filter locally
    let filtered = [...this.questions()];
    if (filter === 'unanswered') {
      filtered = filtered.filter((q) => q.replyCount === 0);
    } else if (filter === 'answered') {
      filtered = filtered.filter((q) => q.replyCount > 0);
    }

    // 2. Sort locally
    return filtered.sort((a, b) => {
      const aPinned = pinned.has(a.id);
      const bPinned = pinned.has(b.id);

      // 1. Pinned items always come first
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;

      // 2. Sort the rest by date (newest or oldest)
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();

      return sort === 'oldest' ? dateA - dateB : dateB - dateA;
    });
  });

  // Voting locks
  readonly votingQueue = signal<Set<string>>(new Set());

  constructor() {
    effect(() => {
      const id = this.classroomId();
      const f = this.filters();
      if (id) {
        this.loadQuestions(id, f);
      }
    });
  }

  loadQuestions(id: string, filters: QuestionFilters): void {
    this.isLoading.set(true);
    this.qaService
      .getQuestions(id, filters)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => {
          this.questions.set(res.items || []);
        },
        error: (err) => {
          console.error('Failed to load questions', err);
          this.messageService?.add({
            severity: 'error',
            summary: 'خطأ',
            detail: 'فشل تحميل الأسئلة. يرجى المحاولة لاحقاً.',
          });
        },
      });
  }

  updateFilterBy(filterValue: string): void {
    this.filters.update((f) => ({
      ...f,
      filterBy: filterValue as QuestionFilters['filterBy'],
      pageNumber: 1,
    }));
  }

  updateSortBy(sortValue: string): void {
    this.filters.update((f) => ({
      ...f,
      sortBy: sortValue as QuestionFilters['sortBy'],
      pageNumber: 1,
    }));
  }

  toggleThread(question: QuestionDto): void {
    const currentExpanded = new Set(this.expandedThreads());
    const isExpanded = currentExpanded.has(question.id);

    if (isExpanded) {
      currentExpanded.delete(question.id);
      this.expandedThreads.set(currentExpanded);
    } else {
      currentExpanded.add(question.id);
      this.expandedThreads.set(currentExpanded);
      this.loadReplies(question.id);
    }
  }

  private loadReplies(questionId: string): void {
    this.threadLoading.update((s) => new Set(s).add(questionId));

    this.qaService
      .getQuestionDetails(this.classroomId(), questionId)
      .pipe(
        finalize(() => {
          this.threadLoading.update((s) => {
            const next = new Set(s);
            next.delete(questionId);
            return next;
          });
        }),
      )
      .subscribe({
        next: (res) => {
          this.threadReplies.update((m) => {
            const nextMap = new Map(m);
            nextMap.set(questionId, res.replies);
            return nextMap;
          });
        },
        error: (err) => {
          console.error('Failed to load replies', err);
          this.messageService?.add({
            severity: 'error',
            summary: 'خطأ',
            detail: 'فشل تحميل الردود.',
          });
        },
      });
  }

  updateReplyContent(questionId: string, content: string): void {
    this.replyContents.update((m) => {
      const nextMap = new Map(m);
      nextMap.set(questionId, content);
      return nextMap;
    });
  }

  postReply(questionId: string): void {
    const content = this.replyContents().get(questionId)?.trim() || '';
    const imageFile = this.replySelectedImages().get(questionId);

    // Backend rejects empty/whitespace-only content on /with-photo.
    const finalContent = content || (imageFile ? 'صورة مرفقة' : '');
    if (!finalContent && !imageFile) return;

    this.threadLoading.update((s) => new Set(s).add(questionId));

    const request$ = imageFile
      ? this.qaService.createReplyWithPhoto(this.classroomId(), questionId, finalContent, imageFile)
      : this.qaService.createReply(this.classroomId(), questionId, finalContent);

    // Save image preview reference to patch locally
    const localImageUrl = this.replyImagePreviews().get(questionId);

    request$
      .pipe(
        finalize(() => {
          this.threadLoading.update((s) => {
            const next = new Set(s);
            next.delete(questionId);
            return next;
          });
        }),
      )
      .subscribe({
        next: (newReply) => {
          if (localImageUrl && !newReply.imageUrl) {
            newReply = { ...newReply, imageUrl: localImageUrl };
          }

          // Clear input
          this.updateReplyContent(questionId, '');
          this.removeReplyImage(questionId);

          // Update replies
          this.threadReplies.update((m) => {
            const nextMap = new Map(m);
            const currentReplies = nextMap.get(questionId) || [];
            nextMap.set(questionId, [...currentReplies, newReply]);
            return nextMap;
          });

          // Update question reply count
          this.questions.update((current) =>
            current.map((q) => (q.id === questionId ? { ...q, replyCount: q.replyCount + 1 } : q)),
          );

          this.messageService?.add({
            severity: 'success',
            summary: 'نجاح',
            detail: 'تم إضافة الرد بنجاح.',
          });
        },
        error: (err) => {
          console.error('Failed to post reply', err);
          this.messageService?.add({
            severity: 'error',
            summary: 'خطأ',
            detail: 'فشل إضافة الرد.',
          });
        },
      });
  }

  toggleNewQuestionMode(): void {
    this.isNewQuestionMode.set(!this.isNewQuestionMode());
    if (!this.isNewQuestionMode()) {
      this.newQuestionContent = '';
      this.removeSelectedImage();
    }
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.type.startsWith('image/')) {
        this.selectedImageFile.set(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          this.selectedImagePreview.set(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        this.messageService?.add({
          severity: 'warn',
          summary: 'صيغة غير مدعومة',
          detail: 'الرجاء اختيار صورة صالحة.',
        });
      }
      input.value = ''; // Reset input
    }
  }

  removeSelectedImage(): void {
    this.selectedImageFile.set(null);
    this.selectedImagePreview.set(null);
  }

  onReplyImageSelected(questionId: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.type.startsWith('image/')) {
        this.replySelectedImages.update((m) => {
          const next = new Map(m);
          next.set(questionId, file);
          return next;
        });

        const reader = new FileReader();
        reader.onload = (e) => {
          this.replyImagePreviews.update((m) => {
            const next = new Map(m);
            next.set(questionId, e.target?.result as string);
            return next;
          });
        };
        reader.readAsDataURL(file);
      } else {
        this.messageService?.add({
          severity: 'warn',
          summary: 'صيغة غير مدعومة',
          detail: 'الرجاء اختيار صورة صالحة.',
        });
      }
      input.value = ''; // Reset input
    }
  }

  removeReplyImage(questionId: string): void {
    this.replySelectedImages.update((m) => {
      const next = new Map(m);
      next.delete(questionId);
      return next;
    });
    this.replyImagePreviews.update((m) => {
      const next = new Map(m);
      next.delete(questionId);
      return next;
    });
  }

  postNewQuestion(): void {
    if (!this.newQuestionContent.trim() && !this.selectedImageFile()) return;

    this.isPosting.set(true);

    const imageFile = this.selectedImageFile();
    const trimmedContent = this.newQuestionContent.trim();
    // Backend rejects empty/whitespace-only content on /with-photo.
    const content = trimmedContent || (imageFile ? 'صورة مرفقة' : '');

    const request$ = imageFile
      ? this.qaService.createQuestionWithPhoto(this.classroomId(), content, imageFile)
      : this.qaService.createQuestion(this.classroomId(), content);

    request$.pipe(finalize(() => this.isPosting.set(false))).subscribe({
      next: (newQ) => {
        this.questions.update((q) => [newQ, ...q]);
        this.toggleNewQuestionMode();
        this.messageService?.add({
          severity: 'success',
          summary: 'نجاح',
          detail: 'تم نشر السؤال بنجاح.',
        });
      },
      error: (err: ApiError) => {
        console.error('Failed to post question', err);
        this.messageService?.add({
          severity: 'error',
          summary: 'خطأ',
          detail: err.message || 'فشل نشر السؤال. تأكد من اتصالك بالإنترنت.',
        });
      },
    });
  }

  // Edit Question Methods
  startEditQuestion(question: QuestionDto): void {
    this.editingQuestionId.set(question.id);
    this.editQuestionContent = question.content;
    this.activeDropdownId.set(null); // Close dropdown
  }

  cancelEditQuestion(): void {
    this.editingQuestionId.set(null);
    this.editQuestionContent = '';
  }

  saveEditQuestion(questionId: string): void {
    if (!this.editQuestionContent.trim()) return;

    this.qaService
      .updateQuestion(this.classroomId(), questionId, this.editQuestionContent)
      .subscribe({
        next: () => {
          this.questions.update((qs) =>
            qs.map((q) => (q.id === questionId ? { ...q, content: this.editQuestionContent } : q)),
          );
          this.cancelEditQuestion();
          this.messageService?.add({
            severity: 'success',
            summary: 'نجاح',
            detail: 'تم تعديل السؤال بنجاح.',
          });
        },
        error: (err) => {
          console.error('Failed to update question', err);
          this.messageService?.add({
            severity: 'error',
            summary: 'خطأ',
            detail: 'حدث خطأ أثناء تعديل السؤال.',
          });
        },
      });
  }

  deleteQuestion(questionId: string): void {
    this.activeDropdownId.set(null); // Close dropdown

    // Check if confirmation service is available (it should be injected)
    // If we want to use confirmation dialog, we should inject ConfirmationService
    // For now, if we don't have it, we just delete
    this.qaService.deleteQuestion(this.classroomId(), questionId).subscribe({
      next: () => {
        this.questions.update((qs) => qs.filter((q) => q.id !== questionId));
        this.messageService?.add({
          severity: 'success',
          summary: 'نجاح',
          detail: 'تم حذف السؤال بنجاح.',
        });
      },
      error: (err) => {
        console.error('Failed to delete question', err);
        this.messageService?.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'حدث خطأ أثناء حذف السؤال.',
        });
      },
    });
  }

  toggleVote(question: QuestionDto, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    // Prevent double clicking while request is in-flight
    if (this.votingQueue().has(question.id)) return;

    this.votingQueue.update((q) => new Set(q).add(question.id));

    this.qaService
      .toggleVote(this.classroomId(), question.id, question.hasVoted)
      .pipe(
        finalize(() => {
          this.votingQueue.update((q) => {
            const next = new Set(q);
            next.delete(question.id);
            return next;
          });
        }),
      )
      .subscribe({
        next: () => {
          this.questions.update((current) =>
            current.map((q) => {
              if (q.id === question.id) {
                return {
                  ...q,
                  hasVoted: !q.hasVoted,
                  voteCount: q.hasVoted ? Math.max(0, q.voteCount - 1) : q.voteCount + 1,
                };
              }
              return q;
            }),
          );
        },
        error: (err) => {
          console.error('Failed to toggle vote', err);
          this.messageService?.add({
            severity: 'error',
            summary: 'خطأ',
            detail: 'فشل تسجيل التصويت.',
          });
        },
      });
  }

  @HostListener('document:click')
  onClickOutside(): void {
    // If we click anywhere on the document, close the dropdown
    // The toggle buttons stop propagation so they won't trigger this instantly
    this.activeDropdownId.set(null);
  }

  toggleDropdown(id: string, event: Event): void {
    event.stopPropagation();
    this.activeDropdownId.set(this.activeDropdownId() === id ? null : id);
  }

  deleteReply(questionId: string, replyId: string): void {
    this.activeDropdownId.set(null);
    this.qaService.deleteReply(this.classroomId(), questionId, replyId).subscribe({
      next: () => {
        this.threadReplies.update((map) => {
          const next = new Map(map);
          const replies = next.get(questionId) || [];
          next.set(
            questionId,
            replies.filter((r) => r.id !== replyId),
          );
          return next;
        });

        // Also update the replyCount in the question
        this.questions.update((qs) =>
          qs.map((q) =>
            q.id === questionId ? { ...q, replyCount: Math.max(0, q.replyCount - 1) } : q,
          ),
        );

        this.messageService?.add({
          severity: 'success',
          summary: 'نجاح',
          detail: 'تم حذف الرد بنجاح.',
        });
      },
      error: (err) => {
        console.error('Failed to delete reply', err);
        this.messageService?.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'حدث خطأ أثناء حذف الرد.',
        });
      },
    });
  }

  // Edit Reply Methods
  startEditReply(questionId: string, reply: QuestionReplyDto): void {
    this.editingReplyId.set(reply.id);
    this.editReplyContent = reply.content;
    this.activeDropdownId.set(null); // Close dropdown
  }

  cancelEditReply(): void {
    this.editingReplyId.set(null);
    this.editReplyContent = '';
  }

  saveEditReply(questionId: string, replyId: string): void {
    if (!this.editReplyContent.trim()) return;

    this.qaService
      .updateReply(this.classroomId(), questionId, replyId, this.editReplyContent)
      .subscribe({
        next: () => {
          this.threadReplies.update((map) => {
            const next = new Map(map);
            const replies = next.get(questionId) || [];
            next.set(
              questionId,
              replies.map((r) => (r.id === replyId ? { ...r, content: this.editReplyContent } : r)),
            );
            return next;
          });
          this.cancelEditReply();
          this.messageService?.add({
            severity: 'success',
            summary: 'نجاح',
            detail: 'تم تعديل الرد بنجاح.',
          });
        },
        error: (err) => {
          console.error('Failed to update reply', err);
          this.messageService?.add({
            severity: 'error',
            summary: 'خطأ',
            detail: 'حدث خطأ أثناء تعديل الرد.',
          });
        },
      });
  }

  togglePin(questionId: string): void {
    this.localPinnedQuestions.update((s) => {
      const next = new Set(s);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  }
}
