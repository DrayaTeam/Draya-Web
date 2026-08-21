import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { EmptyStateComponent } from './empty-state.component';

describe('EmptyStateComponent', () => {
  let component: EmptyStateComponent;
  let fixture: ComponentFixture<EmptyStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyStateComponent],
      providers: [provideRouter([]), provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(EmptyStateComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('titleKey', 'EMPTY.TITLE');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render title correctly', () => {
    const el: HTMLElement = fixture.nativeElement;
    const title = el.querySelector('.empty-state-title');
    expect(title).toBeTruthy();
  });

  it('should emit primaryActionClick when primary button clicked', () => {
    fixture.componentRef.setInput('primaryActionLabelKey', 'ACTION.CLICK');
    fixture.detectChanges();

    spyOn(component.primaryActionClick, 'emit');
    const btn = fixture.nativeElement.querySelector('.empty-btn-primary');
    btn.click();
    expect(component.primaryActionClick.emit).toHaveBeenCalled();
  });
});
