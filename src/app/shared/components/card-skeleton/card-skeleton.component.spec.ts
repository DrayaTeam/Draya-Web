import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DrayaCardSkeletonComponent } from './card-skeleton.component';

describe('DrayaCardSkeletonComponent', () => {
  let component: DrayaCardSkeletonComponent;
  let fixture: ComponentFixture<DrayaCardSkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DrayaCardSkeletonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DrayaCardSkeletonComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('type', 'exam');
    fixture.componentRef.setInput('count', 3);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should generate the correct number of skeleton items', () => {
    expect(component.items().length).toBe(3);
  });
});
