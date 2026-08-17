// src/app/features/student/dashboard/components/course-progress-card/course-progress-card.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { CourseProgressCardComponent } from './course-progress-card.component';
import { EnrolledCourseItem } from '../../../../../core/models/student-dashboard.model';

describe('CourseProgressCardComponent', () => {
  let component: CourseProgressCardComponent;
  let fixture: ComponentFixture<CourseProgressCardComponent>;

  const mockCourse: EnrolledCourseItem = {
    id: 'crs-1',
    title: 'الجبر وحساب المثلثات',
    teacherName: 'أ. محمد علي',
    subjectName: 'الرياضيات',
    completedLessons: 12,
    totalLessons: 18,
    progressPercent: 68,
    thumbnailUrl: 'https://images.unsplash.com/photo-1635070041078',
    progressGradient: 'linear-gradient(90deg, #00A6F4 0%, #4F39F6 100%)',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourseProgressCardComponent],
      providers: [provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(CourseProgressCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('course', mockCourse);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render title and progress percentage', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.course-title')?.textContent).toContain('الجبر وحساب المثلثات');
    expect(compiled.querySelector('.progress-percent')?.textContent).toContain('68%');
  });

  it('should emit resumeWatching on button click', () => {
    spyOn(component.resumeWatching, 'emit');
    const btn = fixture.nativeElement.querySelector('.btn-resume');
    btn.click();
    expect(component.resumeWatching.emit).toHaveBeenCalledWith(mockCourse);
  });
});
