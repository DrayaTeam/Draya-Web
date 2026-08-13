// src/app/features/student/teachers/teachers-directory.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { TeachersDirectoryComponent } from './teachers-directory.component';
import { ToastService } from '../../../core/services/toast.service';

describe('TeachersDirectoryComponent', () => {
  let component: TeachersDirectoryComponent;
  let fixture: ComponentFixture<TeachersDirectoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeachersDirectoryComponent],
      providers: [provideTranslateService(), MessageService, ToastService],
    }).compileComponents();

    fixture = TestBed.createComponent(TeachersDirectoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display initial teachers cards', () => {
    const cards = fixture.nativeElement.querySelectorAll('draya-teacher-card');
    expect(cards.length).toBe(4);
  });

  it('should update filter when search query changes', () => {
    component.onSearchQueryChange('سارة');
    fixture.detectChanges();
    const cards = fixture.nativeElement.querySelectorAll('draya-teacher-card');
    expect(cards.length).toBe(1);
  });
});
