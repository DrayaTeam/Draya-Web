// src/app/features/student/teachers/components/teacher-card/teacher-card.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { TeacherCardComponent } from './teacher-card.component';
import { TeacherDirectoryItem } from '../../../../../core/models/teacher.model';

describe('TeacherCardComponent', () => {
  let component: TeacherCardComponent;
  let fixture: ComponentFixture<TeacherCardComponent>;

  const mockTeacher: TeacherDirectoryItem = {
    id: 'tch-1',
    name: 'أ. أحمد السيد',
    subjectCategory: 'math',
    subjectName: 'الرياضيات',
    rating: 4.9,
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a',
    isVerified: true,
    bio: 'خبرة في التدريس',
    packagesCount: 3,
    studentsCount: 1240,
    cardGradient: 'linear-gradient(135deg, #fff 0%, #fff 100%)',
    blurBlobColor: '#0EA5E9',
    badgeBgColor: '#DFF2FE',
    badgeBorderColor: '#B8E6FE',
    badgeTextColor: '#00598A',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeacherCardComponent],
      providers: [provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(TeacherCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('teacher', mockTeacher);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render teacher name and details', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.teacher-name')?.textContent).toContain('أ. أحمد السيد');
    expect(compiled.querySelector('.subject-badge')?.textContent).toContain('الرياضيات');
  });

  it('should emit viewPackages output when button is clicked', () => {
    spyOn(component.viewPackages, 'emit');
    const button = fixture.nativeElement.querySelector('.btn-view-packages');
    button.click();
    expect(component.viewPackages.emit).toHaveBeenCalledWith(mockTeacher);
  });
});
