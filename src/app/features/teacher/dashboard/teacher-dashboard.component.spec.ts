// src/app/features/teacher/dashboard/teacher-dashboard.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { TeacherDashboardComponent } from './teacher-dashboard.component';
import { TeacherDashboardService } from '../services/teacher-dashboard.service';

describe('TeacherDashboardComponent', () => {
  let component: TeacherDashboardComponent;
  let fixture: ComponentFixture<TeacherDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeacherDashboardComponent],
      providers: [
        TeacherDashboardService,
        MessageService,
        provideRouter([]),
        provideTranslateService(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TeacherDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create teacher dashboard component', () => {
    expect(component).toBeTruthy();
  });

  it('should render kpi stats from service', () => {
    expect(component.kpiStats().length).toBe(4);
  });

  it('should update time range when handleTimeRangeChange is called', () => {
    component.handleTimeRangeChange('month');
    expect(component.timeRange()).toBe('month');
  });
});
