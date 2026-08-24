// src/app/features/student/reports/components/report-weakness-topic/report-weakness-topic.component.spec.ts

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportWeaknessTopicComponent } from './report-weakness-topic.component';
import { ReportWeaknessTopic } from '../../../../../core/models/student-reports.model';

describe('ReportWeaknessTopicComponent', () => {
  let component: ReportWeaknessTopicComponent;
  let fixture: ComponentFixture<ReportWeaknessTopicComponent>;

  const mockTopic: ReportWeaknessTopic = {
    id: 'topic-1',
    topicTitle: 'المشتقات والتكامل وتطبيقات المساحات',
    subjectName: 'الرياضيات',
    badgeText: 'تحتاج تحسين عاجل',
    scorePercent: 42,
    barMarkerColor: '#FF2056',
    badgeBgColor: '#FFE4E6',
    badgeTextColor: '#A50036',
    scoreTextColor: '#EC003F',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportWeaknessTopicComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportWeaknessTopicComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('topic', mockTopic);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render topic title and badge', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.topic-title')?.textContent).toContain('المشتقات والتكامل');
    expect(compiled.querySelector('.badge-pill')?.textContent).toContain('تحتاج تحسين عاجل');
  });

  it('should emit startReview when button clicked', () => {
    spyOn(component.startReview, 'emit');
    const button = fixture.nativeElement.querySelector('.action-btn');
    button.click();
    expect(component.startReview.emit).toHaveBeenCalledWith(mockTopic);
  });

  it('should toggle button label and style when isReviewed is true', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('.action-btn') as HTMLElement;
    expect(button.textContent).toContain('مراجعة وتشخيص فوري');
    expect(button.classList.contains('action-btn-reviewed')).toBeFalse();

    fixture.componentRef.setInput('isReviewed', true);
    fixture.detectChanges();

    expect(button.textContent).toContain('عرض التشخيص والمراجعة');
    expect(button.classList.contains('action-btn-reviewed')).toBeTrue();
  });
});
