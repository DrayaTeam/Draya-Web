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
  templateUrl: './shell.component.html',
})
export class ShellComponent {}
