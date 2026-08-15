// src/app/features/student/channel/student-channel.component.ts

import {
  ChangeDetectionStrategy,
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
  QuestionSortBy,
  QuestionFilterBy,
} from '../../../core/models/student-channel.model';

@Component({
  selector: 'app-student-channel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-channel.component.html',
  styleUrl: './student-channel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentChannelComponent implements OnInit, OnDestroy {
  protected readonly qaService = inject(StudentQaChannelService);
  protected readonly coursesService = inject(StudentCoursesService);
  private readonly toastService = inject(ToastService);

  // Classrooms selection
  readonly classrooms = this.coursesService.subscribedPackages;
  readonly selectedClassroomId = signal<string>('');

  // Modal Dialogs
  readonly showAskModal = signal<boolean>(false);
  readonly newQuestionText = signal<string>('');

  readonly showThreadModal = signal<boolean>(false);
  readonly newReplyText = signal<string>('');

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
    this.qaService.loadQuestions(classroomId).subscribe();
  }

  // Filter & Sort
  onFilterChange(filter: QuestionFilterBy): void {
    this.qaService.currentFilterBy.set(filter);
    this.qaService.loadQuestions(this.selectedClassroomId(), { filterBy: filter }).subscribe();
  }

  onSortChange(sort: QuestionSortBy): void {
    this.qaService.currentSortBy.set(sort);
    this.qaService.loadQuestions(this.selectedClassroomId(), { sortBy: sort }).subscribe();
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
    this.showAskModal.set(true);
  }

  closeAskModal(): void {
    this.showAskModal.set(false);
    this.newQuestionText.set('');
  }

  submitQuestion(): void {
    const text = this.newQuestionText().trim();
    if (!text) {
      this.toastService.warning('تنبيه', 'يرجى كتابة نص السؤال أولاً.');
      return;
    }

    this.qaService.askQuestion(this.selectedClassroomId(), text).subscribe({
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
    this.qaService.loadQuestionDetails(this.selectedClassroomId(), question.id).subscribe();
    this.newReplyText.set('');
    this.showThreadModal.set(true);
  }

  closeThread(): void {
    this.showThreadModal.set(false);
    this.newReplyText.set('');
  }

  submitReply(): void {
    const text = this.newReplyText().trim();
    const activeQ = this.qaService.activeQuestion();
    if (!text || !activeQ) {
      this.toastService.warning('تنبيه', 'يرجى كتابة نص الرد أولاً.');
      return;
    }

    this.qaService.sendReply(this.selectedClassroomId(), activeQ.id, text).subscribe({
      next: () => {
        this.toastService.success('تم الرد', 'تم إضافة ردك إلى النقاش بنجاح.');
        this.newReplyText.set('');
      },
      error: () => {
        this.toastService.error('خطأ', 'تعذر إرسال الرد، يرجى المحاولة لاحقاً.');
      },
    });
  }
}
