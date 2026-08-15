// src/app/features/student/courses/student-courses.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { StudentCoursesComponent } from './student-courses.component';
import { ToastService } from '../../../core/services/toast.service';

describe('StudentCoursesComponent', () => {
  let component: StudentCoursesComponent;
  let fixture: ComponentFixture<StudentCoursesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentCoursesComponent],
      providers: [MessageService, ToastService],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentCoursesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render page heading and subtitle', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.page-heading')?.textContent).toContain('باقاتي الدراسية النشطة');
    expect(compiled.querySelector('.challenge-pill-badge')?.textContent).toContain(
      'محتواك المفضل وتحديات التعلم',
    );
  });

  it('should render 2 subscribed package cards', () => {
    const cards = fixture.nativeElement.querySelectorAll('draya-subscribed-package-card');
    expect(cards.length).toBe(2);
  });
});
