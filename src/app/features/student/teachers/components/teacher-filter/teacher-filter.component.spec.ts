// src/app/features/student/teachers/components/teacher-filter/teacher-filter.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { TeacherFilterComponent } from './teacher-filter.component';
import { SubjectFilterOption } from '../../../../../core/models/teacher.model';

describe('TeacherFilterComponent', () => {
  let component: TeacherFilterComponent;
  let fixture: ComponentFixture<TeacherFilterComponent>;

  const mockOptions: readonly SubjectFilterOption[] = [
    { id: 'all', labelKey: 'STUDENT.TEACHERS.FILTER_ALL', defaultLabel: 'كل المواد' },
    { id: 'math', labelKey: 'STUDENT.TEACHERS.FILTER_MATH', defaultLabel: 'الرياضيات', emoji: '📐' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeacherFilterComponent],
      providers: [provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(TeacherFilterComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('options', mockOptions);
    fixture.componentRef.setInput('selectedCategory', 'all');
    fixture.componentRef.setInput('searchQuery', '');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render subject filter pills', () => {
    const pills = fixture.nativeElement.querySelectorAll('.filter-pill-btn');
    expect(pills.length).toBe(2);
  });

  it('should emit categoryChange when pill clicked', () => {
    spyOn(component.categoryChange, 'emit');
    const pills = fixture.nativeElement.querySelectorAll('.filter-pill-btn');
    pills[1].click();
    expect(component.categoryChange.emit).toHaveBeenCalledWith('math');
  });

  it('should emit searchChange on input', () => {
    spyOn(component.searchChange, 'emit');
    component.onInputSearch('أحمد');
    expect(component.searchChange.emit).toHaveBeenCalledWith('أحمد');
  });
});
