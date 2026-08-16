// src/app/features/student/channel/student-channel.component.spec.ts

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { signal, WritableSignal } from '@angular/core';
import { of } from 'rxjs';
import { StudentChannelComponent } from './student-channel.component';
import { StudentQaChannelService } from '../../../core/services/student-qa-channel.service';
import { StudentCoursesService } from '../../../core/services/student-courses.service';
import { ToastService } from '../../../core/services/toast.service';
import {
  QuestionItem,
  QuestionReplyItem,
  QuestionSortBy,
  QuestionFilterBy,
} from '../../../core/models/student-channel.model';
import { SubscribedPackage } from '../../../core/models/student-courses.model';

describe('StudentChannelComponent', () => {
  let component: StudentChannelComponent;
  let fixture: ComponentFixture<StudentChannelComponent>;
  let qaServiceMock: {
    questions: WritableSignal<QuestionItem[]>;
    filteredQuestions: WritableSignal<QuestionItem[]>;
    totalQuestionsCount: WritableSignal<number>;
    loading: WritableSignal<boolean>;
    sendingQuestion: WritableSignal<boolean>;
    sendingReply: WritableSignal<boolean>;
    activeQuestion: WritableSignal<QuestionItem | null>;
    activeReplies: WritableSignal<QuestionReplyItem[]>;
    loadingReplies: WritableSignal<boolean>;
    currentSortBy: WritableSignal<QuestionSortBy>;
    currentFilterBy: WritableSignal<QuestionFilterBy>;
    searchQuery: WritableSignal<string>;
    startSignalRConnection: jasmine.Spy;
    stopSignalRConnection: jasmine.Spy;
    joinClassroomHub: jasmine.Spy;
    leaveClassroomHub: jasmine.Spy;
    loadQuestions: jasmine.Spy;
    loadQuestionDetails: jasmine.Spy;
    askQuestion: jasmine.Spy;
    sendReply: jasmine.Spy;
    toggleVote: jasmine.Spy;
    editQuestion: jasmine.Spy;
    deleteQuestion: jasmine.Spy;
    editReply: jasmine.Spy;
    deleteReply: jasmine.Spy;
  };

  const mockQuestion: QuestionItem = {
    id: 'q-101',
    classroomId: 'cls-1',
    authorId: 'user-1',
    authorName: 'طالب مجتهد',
    content: 'سؤال تجريبي',
    createdAt: new Date().toISOString(),
    voteCount: 3,
    replyCount: 1,
    hasTeacherAnswer: false,
    hasVoted: false,
    isAuthor: true,
  };

  const mockReply: QuestionReplyItem = {
    id: 'rep-201',
    questionId: 'q-101',
    authorId: 'user-1',
    authorName: 'طالب مجتهد',
    content: 'رد تجريبي',
    createdAt: new Date().toISOString(),
    isTeacherAnswer: false,
    isAuthor: true,
  };

  beforeEach(async () => {
    qaServiceMock = {
      questions: signal<QuestionItem[]>([mockQuestion]),
      filteredQuestions: signal<QuestionItem[]>([mockQuestion]),
      totalQuestionsCount: signal<number>(1),
      loading: signal<boolean>(false),
      sendingQuestion: signal<boolean>(false),
      sendingReply: signal<boolean>(false),
      activeQuestion: signal<QuestionItem | null>(mockQuestion),
      activeReplies: signal<QuestionReplyItem[]>([mockReply]),
      loadingReplies: signal<boolean>(false),
      currentSortBy: signal<QuestionSortBy>('recent'),
      currentFilterBy: signal<QuestionFilterBy>('all'),
      searchQuery: signal<string>(''),
      startSignalRConnection: jasmine.createSpy('startSignalRConnection'),
      stopSignalRConnection: jasmine.createSpy('stopSignalRConnection'),
      joinClassroomHub: jasmine.createSpy('joinClassroomHub'),
      leaveClassroomHub: jasmine.createSpy('leaveClassroomHub'),
      loadQuestions: jasmine.createSpy('loadQuestions').and.returnValue(of(null)),
      loadQuestionDetails: jasmine.createSpy('loadQuestionDetails').and.returnValue(of(null)),
      askQuestion: jasmine.createSpy('askQuestion').and.returnValue(of(null)),
      sendReply: jasmine.createSpy('sendReply').and.returnValue(of(null)),
      toggleVote: jasmine.createSpy('toggleVote'),
      editQuestion: jasmine.createSpy('editQuestion').and.returnValue(of(undefined)),
      deleteQuestion: jasmine.createSpy('deleteQuestion').and.returnValue(of(undefined)),
      editReply: jasmine.createSpy('editReply').and.returnValue(of(undefined)),
      deleteReply: jasmine.createSpy('deleteReply').and.returnValue(of(undefined)),
    };

    const mockCoursesService = {
      subscribedPackages: signal<SubscribedPackage[]>([
        {
          id: 'cls-1',
          title: 'باقة الفيزياء الشاملة',
          teacherName: 'أ. محمد أحمد',
          subjectName: 'فيزياء',
          totalLessons: 10,
          completedLessons: 5,
          progressPercent: 50,
          statusText: 'سارية',
          isActive: true,
          studyGroupName: 'مجموعة أ',
          bannerImageUrl: '',
          progressGradient: '',
        },
      ]),
      loadCourses: jasmine.createSpy('loadCourses'),
    };

    const toastServiceMock = jasmine.createSpyObj<ToastService>('ToastService', [
      'success',
      'error',
      'warning',
      'info',
    ]);

    await TestBed.configureTestingModule({
      imports: [StudentChannelComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: StudentQaChannelService, useValue: qaServiceMock },
        { provide: StudentCoursesService, useValue: mockCoursesService },
        { provide: ToastService, useValue: toastServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentChannelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should open edit question modal with question text', () => {
    component.openEditQuestionModal(mockQuestion);
    expect(component.showEditQuestionModal()).toBeTrue();
    expect(component.editingQuestion()?.id).toBe(mockQuestion.id);
    expect(component.editQuestionText()).toBe(mockQuestion.content);
  });

  it('should submit edit question and show toast', () => {
    component.openEditQuestionModal(mockQuestion);
    component.editQuestionText.set('سؤال معدل بالكامل');
    component.submitEditQuestion();

    expect(qaServiceMock.editQuestion).toHaveBeenCalledWith('cls-1', mockQuestion.id, 'سؤال معدل بالكامل');
    expect(component.showEditQuestionModal()).toBeFalse();
  });

  it('should open and confirm delete question', () => {
    component.openDeleteQuestionModal(mockQuestion);
    expect(component.showDeleteQuestionModal()).toBeTrue();

    component.confirmDeleteQuestion();
    expect(qaServiceMock.deleteQuestion).toHaveBeenCalledWith('cls-1', mockQuestion.id);
    expect(component.showDeleteQuestionModal()).toBeFalse();
  });

  it('should open edit reply modal and submit changes', () => {
    component.openEditReplyModal(mockReply);
    expect(component.showEditReplyModal()).toBeTrue();

    component.editReplyText.set('رد معدل');
    component.submitEditReply();

    expect(qaServiceMock.editReply).toHaveBeenCalledWith('cls-1', mockQuestion.id, mockReply.id, 'رد معدل');
    expect(component.showEditReplyModal()).toBeFalse();
  });

  it('should open and confirm delete reply', () => {
    component.openDeleteReplyModal(mockReply);
    expect(component.showDeleteReplyModal()).toBeTrue();

    component.confirmDeleteReply();
    expect(qaServiceMock.deleteReply).toHaveBeenCalledWith('cls-1', mockQuestion.id, mockReply.id);
    expect(component.showDeleteReplyModal()).toBeFalse();
  });
});
