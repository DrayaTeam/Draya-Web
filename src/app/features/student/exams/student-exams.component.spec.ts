import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { StudentExamsComponent } from './student-exams.component';
import { ToastService } from '../../../core/services/toast.service';
import { StudentExamsService } from '../../../core/services/student-exams.service';
import { provideTranslateService } from '@ngx-translate/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

describe('StudentExamsComponent', () => {
  let component: StudentExamsComponent;
  let fixture: ComponentFixture<StudentExamsComponent>;
  let examsService: StudentExamsService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentExamsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTranslateService(),
        MessageService,
        ToastService,
        StudentExamsService,
        provideRouter([]),
      ],
    }).compileComponents();

    examsService = TestBed.inject(StudentExamsService);
    examsService.exams.set([
      {
        id: 'ex-1',
        title: 'امتحان الجبر',
        teacherName: 'أ. أحمد',
        subjectName: 'رياضيات',
        status: 'available',
        statusLabel: 'متاح للحل الآن',
        durationMinutes: 45,
        secondaryDetailText: 'جاهز للبدء',
        cornerTintBg: '#0EA5E9',
      },
      {
        id: 'ex-2',
        title: 'مراجعة الفيزياء',
        teacherName: 'أ. سارة',
        subjectName: 'فيزياء',
        status: 'scheduled',
        statusLabel: 'مجدول لاحقاً',
        durationMinutes: 60,
        secondaryDetailText: 'يبدأ غداً',
        cornerTintBg: '#8B5CF6',
      },
      {
        id: 'ex-3',
        title: 'امتحان الكيمياء',
        teacherName: 'أ. أحمد',
        subjectName: 'كيمياء',
        status: 'completed',
        statusLabel: 'مكتمل',
        durationMinutes: 90,
        secondaryDetailText: 'الدرجة: 85%',
        cornerTintBg: '#10B981',
      },
    ]);

    fixture = TestBed.createComponent(StudentExamsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render page heading and filter pills', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.page-heading')?.textContent).toContain(
      'الامتحانات والواجبات المجدولة',
    );
    expect(compiled.querySelectorAll('.filter-pill-btn').length).toBe(5);
  });

  it('should render 3 exam cards when items exist', () => {
    const cards = fixture.nativeElement.querySelectorAll('draya-exam-card');
    expect(cards.length).toBe(3);
  });

  it('should filter cards when filter pill is clicked', () => {
    component.setFilter('completed');
    fixture.detectChanges();
    const cards = fixture.nativeElement.querySelectorAll('draya-exam-card');
    expect(cards.length).toBe(1);
  });
});
