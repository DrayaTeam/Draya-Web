// src/app/layout/shell/shell.component.spec.ts
// Purpose: Baseline spec confirming ShellComponent creates successfully.
// Mocks RouterOutlet and NavComponent to avoid requiring a fully configured router.

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShellComponent } from './shell.component';
import { NavComponent } from '../nav/nav.component';
import { Component } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';

// Stub for NavComponent to avoid loading its full dependency tree in this unit test.
@Component({ selector: 'app-nav', standalone: true, template: '' })
class NavStubComponent {}

describe('ShellComponent', () => {
  let component: ShellComponent;
  let fixture: ComponentFixture<ShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ShellComponent,
        RouterTestingModule,
        NavStubComponent,
      ],
    })
      .overrideComponent(ShellComponent, {
        remove: { imports: [NavComponent] },
        add: { imports: [NavStubComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
