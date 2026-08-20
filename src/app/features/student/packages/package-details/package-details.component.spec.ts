// src/app/features/student/packages/package-details/package-details.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { PackageDetailsComponent } from './package-details.component';
import {
  StudentEnrollmentService,
  PackageDetailsView,
} from '../../../../core/services/student-enrollment.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ClassroomFeedbackSummaryDto } from '../../../../core/models/student-courses.model';

describe('PackageDetailsComponent', () => {
  let component: PackageDetailsComponent;
  let fixture: ComponentFixture<PackageDetailsComponent>;
  let enrollmentServiceMock: jasmine.SpyObj<StudentEnrollmentService>;
  let toastServiceMock: jasmine.SpyObj<ToastService>;

  const mockPackage: PackageDetailsView = {
    id: 'pkg-1',
    name: 'باقة الفيزياء الشاملة',
    teacherName: 'أ. محمد أحمد',
    subject: 'فيزياء',
    price: 350,
    description: 'شرح المنهج كاملاً مع حل بنك الأسئلة',
    features: ['مذكرات PDF', 'فيديوهات مسجلة'],
    chapters: [
      {
        id: 'ch-1',
        title: 'الوحدة الأولى: الكهربية التيارية',
        lessons: [
          {
            id: 'les-1',
            title: 'قانون أوم وقوانين كيرشوف',
            type: 'video',
            duration: '45 دقيقة',
            fileUrl: 'https://example.com/video.mp4',
          },
        ],
      },
    ],
  };

  const mockFeedbackSummary: ClassroomFeedbackSummaryDto = {
    averageRating: 4.8,
    totalCount: 5,
    items: [
      {
        feedbackId: 'fb-1',
        studentName: 'أحمد علي',
        rating: 5,
        comment: 'شرح رائع ومتقن!',
        createdAt: new Date().toISOString(),
      },
    ],
    pageNumber: 1,
    pageSize: 10,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  beforeEach(async () => {
    enrollmentServiceMock = jasmine.createSpyObj<StudentEnrollmentService>(
      'StudentEnrollmentService',
      [
        'getPackageDetails',
        'getEnrolledClassrooms',
        'getClassroomFeedback',
        'submitClassroomFeedback',
        'enrollWithCode',
        'checkoutClassroom',
      ],
    );

    enrollmentServiceMock.getPackageDetails.and.returnValue(of(mockPackage));
    enrollmentServiceMock.getEnrolledClassrooms.and.returnValue(
      of({ items: [], page: 1, pageSize: 10, totalCount: 0, totalPages: 0 }),
    );
    enrollmentServiceMock.getClassroomFeedback.and.returnValue(of(mockFeedbackSummary));
    enrollmentServiceMock.submitClassroomFeedback.and.returnValue(
      of({ success: true, message: 'شكراً لتقييمك' }),
    );
    enrollmentServiceMock.enrollWithCode.and.returnValue(
      of({ success: true, message: 'تم التفعيل' }),
    );

    toastServiceMock = jasmine.createSpyObj<ToastService>('ToastService', [
      'success',
      'error',
      'warning',
      'info',
    ]);

    await TestBed.configureTestingModule({
      imports: [PackageDetailsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: StudentEnrollmentService, useValue: enrollmentServiceMock },
        { provide: ToastService, useValue: toastServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PackageDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component and load package details', () => {
    expect(component).toBeTruthy();
    expect(component.pkg()?.name).toBe('باقة الفيزياء الشاملة');
    expect(component.loading()).toBeFalse();
  });

  it('should switch between curriculum and feedback tabs', () => {
    expect(component.activeTab()).toBe('curriculum');
    component.selectTab('feedback');
    expect(component.activeTab()).toBe('feedback');
  });

  it('should submit feedback rating and update list', () => {
    component.setRating(5);
    component.feedbackComment.set('محتوى ممتاز ومفيد جداً');
    component.submitFeedback();

    expect(enrollmentServiceMock.submitClassroomFeedback).toHaveBeenCalled();
    expect(toastServiceMock.success).toHaveBeenCalled();
    expect(component.hasSubmittedFeedback()).toBeTrue();
  });

  it('should toggle chapter expansion', () => {
    expect(component.isChapterExpanded('ch-1')).toBeTrue();
    component.toggleChapter('ch-1');
    expect(component.isChapterExpanded('ch-1')).toBeFalse();
  });

  it('should handle empty feedback gracefully with 0 score and empty items', () => {
    enrollmentServiceMock.getClassroomFeedback.and.returnValue(
      of({
        averageRating: 0,
        totalCount: 0,
        items: [],
        pageNumber: 1,
        pageSize: 10,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      }),
    );
    component.loadFeedback('pkg-1');
    expect(component.feedbackItems().length).toBe(0);
    expect(component.feedbackSummary()?.averageRating).toBe(0);
  });
});
