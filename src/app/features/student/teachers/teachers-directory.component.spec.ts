// src/app/features/student/teachers/teachers-directory.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';
import { TeachersDirectoryComponent } from './teachers-directory.component';
import { ToastService } from '../../../core/services/toast.service';

describe('TeachersDirectoryComponent', () => {
  let component: TeachersDirectoryComponent;
  let fixture: ComponentFixture<TeachersDirectoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeachersDirectoryComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideTranslateService(),
        MessageService,
        ToastService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TeachersDirectoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render skeleton cards while loading', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const skeletons = compiled.querySelectorAll('.teacher-skeleton-card');
    expect(skeletons.length).toBe(6);
  });
});
