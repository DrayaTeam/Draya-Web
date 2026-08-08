// src/app/features/teacher/teacher-layout.component.ts
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TeacherHeaderComponent } from './components/teacher-header/teacher-header.component';

@Component({
  selector: 'draya-teacher-layout',
  standalone: true,
  imports: [RouterOutlet, TeacherHeaderComponent],
  template: `
    <div class="teacher-layout-root">
      <!-- Shared Teacher Responsive Header Navbar (Full Width 100%) -->
      <draya-teacher-header />

      <!-- Main page content container strictly constrained to 80% width on desktop -->
      <main class="teacher-layout-content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        min-height: 100vh;
        background-color: #fafaf8;
      }

      .teacher-layout-root {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
        width: 100%;
        background-color: #fafaf8;
      }

      .teacher-layout-content {
        flex: 1;
        width: 80%;
        max-width: 80%;
        margin: 0 auto;
        padding: 32px 0 64px;
        box-sizing: border-box;

        @media (max-width: 1024px) {
          width: 92%;
          max-width: 92%;
          padding: 16px 0 32px;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeacherLayoutComponent {}
