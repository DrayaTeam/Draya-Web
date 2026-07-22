// src/app/layout/shell/shell.component.ts
// Purpose: Top-level shell component that hosts the router-outlet for all authenticated routes.
// The shell wraps the NavComponent (sidebar) and the main content area.
// Eventually: will integrate the SignalR connection lifecycle (start on login, stop on logout).

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from '../nav/nav.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, NavComponent],
  template: `
    <div class="flex min-h-screen bg-background">
      <!-- Sidebar navigation — RTL-aware, uses logical properties -->
      <app-nav class="w-64 shrink-0" />

      <!-- Main content area -->
      <main class="flex-1 overflow-auto p-6">
        <router-outlet />
      </main>
    </div>
  `,
})
export class ShellComponent {}
