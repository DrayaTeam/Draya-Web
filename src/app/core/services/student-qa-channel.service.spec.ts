// src/app/core/services/student-qa-channel.service.spec.ts

import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { StudentQaChannelService } from './student-qa-channel.service';
import { AuthService } from '../../features/auth/services/auth.service';
import { environment } from '../../../environments/environment';

describe('StudentQaChannelService', () => {
  let service: StudentQaChannelService;
  let httpMock: HttpTestingController;
  const baseUrl = environment.apiBaseUrl;

  const mockAuthService = {
    accessToken: jasmine.createSpy('accessToken').and.returnValue('mock-jwt-token'),
    currentUser: jasmine.createSpy('currentUser').and.returnValue({
      userId: 'user-123',
      fullName: 'أحمد محمود',
      role: 'Student',
    }),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        StudentQaChannelService,
        { provide: AuthService, useValue: mockAuthService },
      ],
    });

    service = TestBed.inject(StudentQaChannelService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should edit question and update local state', () => {
    service.questions.set([
      {
        id: 'q-1',
        classroomId: 'cls-1',
        authorId: 'user-123',
        content: 'Original Question',
        createdAt: new Date().toISOString(),
        voteCount: 0,
        replyCount: 0,
        hasTeacherAnswer: false,
        hasVoted: false,
        isAuthor: true,
      },
    ]);

    service.editQuestion('cls-1', 'q-1', 'Updated Question').subscribe();

    const req = httpMock.expectOne(`${baseUrl}/classrooms/cls-1/questions/q-1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ content: 'Updated Question' });
    req.flush(null);

    expect(service.questions()[0].content).toBe('Updated Question');
  });

  it('should delete question and remove it from local state', () => {
    service.questions.set([
      {
        id: 'q-1',
        classroomId: 'cls-1',
        authorId: 'user-123',
        content: 'To Be Deleted',
        createdAt: new Date().toISOString(),
        voteCount: 0,
        replyCount: 0,
        hasTeacherAnswer: false,
        hasVoted: false,
        isAuthor: true,
      },
    ]);
    service.totalQuestionsCount.set(1);

    service.deleteQuestion('cls-1', 'q-1').subscribe();

    const req = httpMock.expectOne(`${baseUrl}/classrooms/cls-1/questions/q-1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);

    expect(service.questions().length).toBe(0);
    expect(service.totalQuestionsCount()).toBe(0);
  });

  it('should edit reply and update activeReplies', () => {
    service.activeReplies.set([
      {
        id: 'rep-1',
        questionId: 'q-1',
        authorId: 'user-123',
        content: 'Original Reply',
        createdAt: new Date().toISOString(),
        isTeacherAnswer: false,
        isAuthor: true,
      },
    ]);

    service.editReply('cls-1', 'q-1', 'rep-1', 'Updated Reply').subscribe();

    const req = httpMock.expectOne(`${baseUrl}/classrooms/cls-1/questions/q-1/replies/rep-1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ content: 'Updated Reply' });
    req.flush(null);

    expect(service.activeReplies()[0].content).toBe('Updated Reply');
  });

  it('should delete reply and remove it from activeReplies', () => {
    service.questions.set([
      {
        id: 'q-1',
        classroomId: 'cls-1',
        authorId: 'user-123',
        content: 'Q with reply',
        createdAt: new Date().toISOString(),
        voteCount: 0,
        replyCount: 1,
        hasTeacherAnswer: false,
        hasVoted: false,
        isAuthor: true,
      },
    ]);
    service.activeReplies.set([
      {
        id: 'rep-1',
        questionId: 'q-1',
        authorId: 'user-123',
        content: 'Reply to delete',
        createdAt: new Date().toISOString(),
        isTeacherAnswer: false,
        isAuthor: true,
      },
    ]);

    service.deleteReply('cls-1', 'q-1', 'rep-1').subscribe();

    const req = httpMock.expectOne(`${baseUrl}/classrooms/cls-1/questions/q-1/replies/rep-1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);

    expect(service.activeReplies().length).toBe(0);
    expect(service.questions()[0].replyCount).toBe(0);
  });
});
