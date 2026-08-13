// src/app/features/student/student-layout.component.ts
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { StudentHeaderComponent } from './components/student-header/student-header.component';

@Component({
  selector: 'draya-student-layout',
  standalone: true,
  imports: [RouterOutlet, StudentHeaderComponent],
  template: `
    <div class="student-layout-root">
      <!-- Student Responsive Header Navbar (Full Width 100%) -->
      <draya-student-header />

      <!-- Main content constrained to 80% on desktop -->
      <main class="student-layout-content">
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

      .student-layout-root {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
        width: 100%;
        background-color: #fafaf8;
      }

      .student-layout-content {
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
export class StudentLayoutComponent {}
