// src/app/features/teacher/teacher-layout.component.ts
import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { TeacherSidebarComponent } from './components/teacher-sidebar/teacher-sidebar.component';

@Component({
  selector: 'draya-teacher-layout',
  standalone: true,
  imports: [RouterOutlet, TeacherSidebarComponent, TranslatePipe],
  templateUrl: './teacher-layout.component.html',
  styleUrl: './teacher-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeacherLayoutComponent {
  readonly isMobileSidebarOpen = signal<boolean>(false);

  toggleMobileSidebar(): void {
    this.isMobileSidebarOpen.update((v) => !v);
  }

  closeMobileSidebar(): void {
    this.isMobileSidebarOpen.set(false);
  }
}
