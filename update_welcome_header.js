const fs = require('fs');
const filePathTS = 'src/app/features/teacher/dashboard/components/teacher-welcome-header/teacher-welcome-header.component.ts';
let contentTS = fs.readFileSync(filePathTS, 'utf8');

if (!contentTS.includes('TeacherNotificationsService')) {
  contentTS = contentTS.replace(
    "import { Component, ChangeDetectionStrategy, output } from '@angular/core';",
    "import { Component, ChangeDetectionStrategy, output, signal, inject } from '@angular/core';\nimport { DatePipe, CommonModule } from '@angular/common';\nimport { TeacherNotificationsService } from '../../../../services/teacher-notifications.service';"
  );
  
  contentTS = contentTS.replace(
    "imports: [TranslatePipe],",
    "imports: [TranslatePipe, CommonModule, DatePipe],"
  );
  
  contentTS = contentTS.replace(
    "readonly notificationsClick = output<void>();",
    "readonly notificationsClick = output<void>();\n  readonly notificationsService = inject(TeacherNotificationsService);\n  readonly isDropdownOpen = signal(false);\n\n  toggleNotifications(): void {\n    this.isDropdownOpen.update(v => !v);\n    if (this.isDropdownOpen()) {\n      this.notificationsService.markAllAsRead();\n    }\n  }\n\n  closeNotifications(): void {\n    this.isDropdownOpen.set(false);\n  }"
  );
  fs.writeFileSync(filePathTS, contentTS, 'utf8');
}

const filePathHTML = 'src/app/features/teacher/dashboard/components/teacher-welcome-header/teacher-welcome-header.component.html';
let contentHTML = fs.readFileSync(filePathHTML, 'utf8');

const newDropdownHTML = `
    <!-- Notifications Dropdown Trigger -->
    <div class="notifications-wrapper" style="position: relative;">
      <button
        type="button"
        (click)="toggleNotifications()"
        aria-label="الإشعارات"
        class="icon-btn-bell">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        @if (notificationsService.unreadCount() > 0) {
          <span class="unread-dot-badge">{{ notificationsService.unreadCount() }}</span>
        }
      </button>

      @if (isDropdownOpen()) {
        <!-- Backdrop for closing -->
        <div class="fixed inset-0 z-40" (click)="closeNotifications()"></div>
        
        <div class="notifications-dropdown animate-scale-up absolute left-0 mt-2 w-80 bg-white dark:bg-[--draya-surface-dark] rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 z-50 overflow-hidden" style="top: 100%;">
          <div class="dropdown-header flex justify-between items-center p-4 border-b border-gray-50 dark:border-gray-800">
            <span class="dropdown-title font-bold text-gray-900 dark:text-gray-100">الإشعارات</span>
          </div>

          <div class="dropdown-list max-h-96 overflow-y-auto">
            @if (notificationsService.notifications().length === 0) {
              <div class="p-6 text-center text-gray-500 text-sm">
                لا توجد إشعارات حالياً.
              </div>
            }
            @for (notif of notificationsService.notifications(); track notif.id) {
              <div class="notif-item flex gap-3 p-4 border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[--draya-surface-darker] transition-colors cursor-default">
                <div class="notif-dot flex-shrink-0 w-2 h-2 rounded-full mt-1.5"
                     [ngClass]="{
                       'bg-red-500': notif.type === 'risk',
                       'bg-green-500': notif.type === 'report',
                       'bg-blue-500': notif.type === 'material'
                     }"></div>
                <div class="notif-content flex-1">
                  <p class="notif-title text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">{{ notif.title }}</p>
                  <p class="notif-desc text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-2">{{ notif.message }}</p>
                  <span class="notif-time text-[10px] text-gray-400">{{ notif.time | date:'shortTime' }}</span>
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>`;

const oldButton = `<button
      type="button"
      (click)="notificationsClick.emit()"
      aria-label="الإشعارات"
      class="icon-btn-bell">
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      <span class="unread-dot-badge"></span>
    </button>`;

contentHTML = contentHTML.replace(oldButton, newDropdownHTML);
fs.writeFileSync(filePathHTML, contentHTML, 'utf8');
