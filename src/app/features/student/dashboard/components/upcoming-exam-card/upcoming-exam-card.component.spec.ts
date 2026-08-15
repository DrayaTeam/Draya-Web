// src/app/features/student/dashboard/components/upcoming-exam-card/upcoming-exam-card.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { UpcomingExamCardComponent } from './upcoming-exam-card.component';
import { UpcomingExamItem } from '../../../../../core/models/student-dashboard.model';

describe('UpcomingExamCardComponent', () => {
  let component: UpcomingExamCardComponent;
  let fixture: ComponentFixture<UpcomingExamCardComponent>;

  const mockExam: UpcomingExamItem = {
    id: 'ex-1',
    title: 'اختبار الباب الثالث (جبر)',
    timeText: 'غداً 10:00 ص',
    tagText: 'هام',
    borderMarkerColor: '#FF2056',
    isImportant: true,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpcomingExamCardComponent],
      providers: [provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(UpcomingExamCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('exam', mockExam);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render title and tag pill', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.exam-title')?.textContent).toContain('اختبار الباب الثالث (جبر)');
    expect(compiled.querySelector('.tag-pill')?.textContent).toContain('هام');
  });
});
