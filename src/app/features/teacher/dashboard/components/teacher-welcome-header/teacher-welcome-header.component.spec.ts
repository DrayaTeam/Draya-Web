// src/app/features/teacher/dashboard/components/teacher-welcome-header/teacher-welcome-header.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { TeacherWelcomeHeaderComponent } from './teacher-welcome-header.component';
import { AuthService } from '../../../../auth';
import { User } from '../../../../../core/models/user.model';

describe('TeacherWelcomeHeaderComponent', () => {
  let fixture: ComponentFixture<TeacherWelcomeHeaderComponent>;
  let component: TeacherWelcomeHeaderComponent;

  function configure(currentUser: Partial<User> | null): void {
    TestBed.configureTestingModule({
      imports: [TeacherWelcomeHeaderComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTranslateService(),
        MessageService,
        {
          provide: AuthService,
          useValue: { currentUser: () => currentUser },
        },
      ],
    });
    fixture = TestBed.createComponent(TeacherWelcomeHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('greets the real logged-in teacher by their first name, not a hardcoded "أ. محمد"', () => {
    // Regression test: this header used to show the static i18n string
    // "مساء الخير، أ. محمد" to every teacher regardless of who signed in.
    configure({ fullName: 'أحمد سامي إبراهيم' } as User);
    expect(component.greetingText()).toContain('أحمد');
    expect(component.greetingText()).not.toContain('محمد');
  });

  it('falls back to just the time-of-day greeting when no user name is available', () => {
    configure(null);
    const text = component.greetingText();
    expect(text === 'صباح الخير' || text === 'مساء الخير').toBeTrue();
  });

  it('uses a real, non-hardcoded current date', () => {
    // Regression test: this used to be the static i18n string
    // "الأحد، 20 يوليو 2026" shown on every visit regardless of the actual date.
    configure({ fullName: 'سارة' } as User);
    const expected = new Date().toLocaleDateString('ar-EG', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    expect(component.currentDateText()).toBe(expected);
  });
});
