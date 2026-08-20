// src/app/features/teacher/teacher-layout.component.ts
import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { TeacherSidebarComponent } from './components/teacher-sidebar/teacher-sidebar.component';
import { ConnectionStatusBannerComponent } from '../../shared/components/connection-status-banner/connection-status-banner.component';
import { ThemeService } from '../../core/services/theme.service';
import { LocaleService } from '../../core/locale/locale.service';

@Component({
  selector: 'draya-teacher-layout',
  standalone: true,
  imports: [RouterOutlet, TeacherSidebarComponent, TranslatePipe, ConnectionStatusBannerComponent],
  templateUrl: './teacher-layout.component.html',
  styleUrl: './teacher-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeacherLayoutComponent {
  readonly themeService = inject(ThemeService);
  readonly localeService = inject(LocaleService);
  readonly isMobileSidebarOpen = signal<boolean>(false);

  toggleMobileSidebar(): void {
    this.isMobileSidebarOpen.update((v) => !v);
  }

  closeMobileSidebar(): void {
    this.isMobileSidebarOpen.set(false);
  }
}
