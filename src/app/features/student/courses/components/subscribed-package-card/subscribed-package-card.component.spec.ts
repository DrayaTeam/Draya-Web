// src/app/features/student/courses/components/subscribed-package-card/subscribed-package-card.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubscribedPackageCardComponent } from './subscribed-package-card.component';
import { SubscribedPackage } from '../../../../../core/models/student-courses.model';

describe('SubscribedPackageCardComponent', () => {
  let component: SubscribedPackageCardComponent;
  let fixture: ComponentFixture<SubscribedPackageCardComponent>;

  const mockPackage: SubscribedPackage = {
    id: 'pkg-1',
    title: 'باقة الجبر وحساب المثلثات للشهادة الثانوية',
    teacherName: 'أ. أحمد السيد',
    subjectName: 'الرياضيات',
    statusText: 'سارية ومفعّلة',
    isActive: true,
    completedLessons: 12,
    totalLessons: 18,
    progressPercent: 68,
    studyGroupName: 'مجموعة أ - علمي رياضة',
    bannerImageUrl: 'https://images.unsplash.com/photo-1635070041078',
    progressGradient: 'linear-gradient(90deg, #00A6F4 0%, #4F39F6 100%)',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscribedPackageCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SubscribedPackageCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('package', mockPackage);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render title and study group', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.package-title')?.textContent).toContain(
      'باقة الجبر وحساب المثلثات للشهادة الثانوية',
    );
    expect(compiled.querySelector('.group-name-value')?.textContent).toContain('مجموعة أ - علمي رياضة');
  });

  it('should emit openPackageDetails on button click', () => {
    spyOn(component.openPackageDetails, 'emit');
    const btn = fixture.nativeElement.querySelector('.btn-continue-package');
    btn.click();
    expect(component.openPackageDetails.emit).toHaveBeenCalledWith(mockPackage);
  });
});
