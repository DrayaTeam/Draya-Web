// src/app/features/teacher/components/teacher-sidebar/teacher-sidebar.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { TeacherSidebarComponent } from './teacher-sidebar.component';

describe('TeacherSidebarComponent', () => {
  let component: TeacherSidebarComponent;
  let fixture: ComponentFixture<TeacherSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeacherSidebarComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideTranslateService(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TeacherSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create sidebar component', () => {
    expect(component).toBeTruthy();
  });

  it('should have nav groups defined', () => {
    expect(component.navGroups.length).toBeGreaterThan(0);
    expect(component.footerNavItems.length).toBeGreaterThan(0);
  });
});
