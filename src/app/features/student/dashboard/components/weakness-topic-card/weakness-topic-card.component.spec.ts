// src/app/features/student/dashboard/components/weakness-topic-card/weakness-topic-card.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { WeaknessTopicCardComponent } from './weakness-topic-card.component';
import { WeaknessTopicItem } from '../../../../../core/models/student-dashboard.model';

describe('WeaknessTopicCardComponent', () => {
  let component: WeaknessTopicCardComponent;
  let fixture: ComponentFixture<WeaknessTopicCardComponent>;

  const mockTopic: WeaknessTopicItem = {
    id: 'wk-1',
    topicTitle: 'المشتقات والاتصال الرياضي',
    scorePercent: 42,
    barColor: '#FF2056',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeaknessTopicCardComponent],
      providers: [provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(WeaknessTopicCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('topic', mockTopic);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render topic title and score percentage', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.topic-title')?.textContent).toContain('المشتقات والاتصال الرياضي');
    expect(compiled.querySelector('.score-percent')?.textContent).toContain('42%');
  });
});
