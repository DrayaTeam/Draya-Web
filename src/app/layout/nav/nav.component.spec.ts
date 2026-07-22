// src/app/layout/nav/nav.component.spec.ts
// Purpose: Baseline spec confirming NavComponent creates successfully.
// Stubs AuthService and LocaleService to avoid localStorage and HTTP deps.
// Stubs RouterLink/RouterLinkActive and TranslateModule for isolation.

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavComponent } from './nav.component';
import { AuthService } from '../../core/auth/auth.service';
import { LocaleService } from '../../core/locale/locale.service';
import { signal } from '@angular/core';
import { provideTranslateService } from '@ngx-translate/core';
import { RouterTestingModule } from '@angular/router/testing';

const mockAuthService = {
  currentUser: signal(null),
  isLoggedIn: signal(false),
  logout: jasmine.createSpy('logout'),
};

const mockLocaleService = {
  locale: signal<'ar' | 'en'>('ar'),
  toggle: jasmine.createSpy('toggle'),
};

describe('NavComponent', () => {
  let component: NavComponent;
  let fixture: ComponentFixture<NavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NavComponent,
        RouterTestingModule,
      ],
      providers: [
        provideTranslateService(),
        { provide: AuthService, useValue: mockAuthService },
        { provide: LocaleService, useValue: mockLocaleService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
