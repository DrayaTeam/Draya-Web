// src/app/features/student/reports/components/resolved-weakness-item/resolved-weakness-item.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResolvedWeaknessItemComponent } from './resolved-weakness-item.component';
import { StudentWeaknessItem } from '../../../../../core/models/student-weakness.model';

describe('ResolvedWeaknessItemComponent', () => {
  let component: ResolvedWeaknessItemComponent;
  let fixture: ComponentFixture<ResolvedWeaknessItemComponent>;

  const mockWeakness: StudentWeaknessItem = {
    id: 'w1',
    topicName: 'الجبر',
    subjectName: 'رياضيات',
    proficiencyPercent: 90,
    delta: 43,
    previousProficiencyPercent: 47,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResolvedWeaknessItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ResolvedWeaknessItemComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('weakness', mockWeakness);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the topic name and improvement delta', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.topic-title')?.textContent).toContain('الجبر');
    expect(compiled.querySelector('.delta-pill')?.textContent).toContain('43');
  });
});
