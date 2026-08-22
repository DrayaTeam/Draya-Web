// src/app/features/student/checkout/checkout.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';

import { CheckoutComponent } from './checkout.component';
import { ToastService } from '../../../core/services/toast.service';
import { StudentEnrollmentService } from '../../../core/services/student-enrollment.service';
import { StudentCoursesService } from '../../../core/services/student-courses.service';

describe('Student CheckoutComponent', () => {
  let component: CheckoutComponent;
  let fixture: ComponentFixture<CheckoutComponent>;
  let enrollmentService: StudentEnrollmentService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckoutComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideTranslateService(),
        MessageService,
        ToastService,
        StudentEnrollmentService,
        StudentCoursesService,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => (key === 'id' ? 'cls-101' : null),
              },
              queryParams: {},
            },
          },
        },
      ],
    }).compileComponents();

    enrollmentService = TestBed.inject(StudentEnrollmentService);
    spyOn(enrollmentService, 'getPackageDetails').and.returnValue(
      of({
        id: 'cls-101',
        name: 'كورس الرياضيات للثانوية العامة',
        teacherName: 'أ. أحمد السيد',
        subject: 'الرياضيات',
        price: 450,
        description: 'وصف الكورس',
        features: [],
        chapters: [],
      }),
    );

    fixture = TestBed.createComponent(CheckoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load real package data via signals immediately', () => {
    expect(component).toBeTruthy();
    expect(component.pkgName()).toBe('كورس الرياضيات للثانوية العامة');
    expect(component.teacherName()).toBe('أ. أحمد السيد');
    expect(component.originalPrice()).toBe(450);
    expect(component.finalPrice()).toBe(450);
    expect(component.isPackageLoading()).toBeFalse();
  });

  it('should apply discount code properly', () => {
    component.promoCode = 'draya';
    component.applyPromo();
    expect(component.discount()).toBe(68); // ~15% of 450
    expect(component.finalPrice()).toBe(382);
  });
});
