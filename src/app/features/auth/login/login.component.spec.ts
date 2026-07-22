// src/app/features/auth/login/login.component.spec.ts
// Purpose: Baseline spec confirming LoginComponent creates successfully.
// Stubs AuthService and Router to avoid HTTP and navigation deps.
// Provides TranslateModule.forRoot() for the translate pipe in the template.

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/auth/auth.service';
import { Router } from '@angular/router';
import { signal } from '@angular/core';
import { provideTranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

const mockAuthService = {
  accessToken: signal(null),
  currentUser: signal(null),
  isLoggedIn: signal(false),
  login: jasmine
    .createSpy('login')
    .and.returnValue(of({ accessToken: 'tok', refreshToken: 'ref' })),
  logout: jasmine.createSpy('logout'),
};

const mockRouter = {
  navigate: jasmine.createSpy('navigate'),
};

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
      ],
      providers: [
        provideTranslateService(),
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
