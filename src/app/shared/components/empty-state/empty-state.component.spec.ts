// src/app/shared/components/empty-state/empty-state.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { DrayaEmptyStateComponent } from './empty-state.component';

describe('DrayaEmptyStateComponent', () => {
  let component: DrayaEmptyStateComponent;
  let fixture: ComponentFixture<DrayaEmptyStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DrayaEmptyStateComponent],
      providers: [provideRouter([]), provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(DrayaEmptyStateComponent);
    component = fixture.componentInstance;
  });

  it('should create with required inputs', () => {
    fixture.componentRef.setInput('titleKey', 'COMMON.NO_DATA');
    fixture.componentRef.setInput('descriptionKey', 'COMMON.NO_DATA_DESC');
    fixture.detectChanges();

    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.empty-title')).toBeTruthy();
    expect(compiled.querySelector('.empty-description')).toBeTruthy();
  });

  it('should emit primaryActionClick when primary button is clicked', () => {
    fixture.componentRef.setInput('titleKey', 'COMMON.NO_DATA');
    fixture.componentRef.setInput('descriptionKey', 'COMMON.NO_DATA_DESC');
    fixture.componentRef.setInput('primaryActionLabelKey', 'COMMON.RETRY');
    fixture.detectChanges();

    spyOn(component.primaryActionClick, 'emit');
    const button = fixture.nativeElement.querySelector('.btn-action-primary');
    button.click();

    expect(component.primaryActionClick.emit).toHaveBeenCalled();
  });

  it('should emit secondaryActionClick when secondary button is clicked', () => {
    fixture.componentRef.setInput('titleKey', 'COMMON.NO_DATA');
    fixture.componentRef.setInput('descriptionKey', 'COMMON.NO_DATA_DESC');
    fixture.componentRef.setInput('secondaryActionLabelKey', 'COMMON.CANCEL');
    fixture.detectChanges();

    spyOn(component.secondaryActionClick, 'emit');
    const button = fixture.nativeElement.querySelector('.btn-action-secondary');
    button.click();

    expect(component.secondaryActionClick.emit).toHaveBeenCalled();
  });
});
