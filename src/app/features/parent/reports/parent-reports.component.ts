// src/app/features/parent/reports/parent-reports.component.ts
// Purpose: Parent reports placeholder. Will eventually show:
// - Child's exam history, trends, and performance insights
// - AI-generated progress summaries from the Draya Report Generator agent
// - Comparison against class averages (anonymized)
// - Exportable PDF reports

import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-parent-reports',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <div class="space-y-6 p-6">
      <h1 class="text-2xl font-bold text-foreground">
        {{ 'nav.reports' | translate }}
      </h1>
      <p class="text-muted-foreground">
        Parent reports — AI-generated progress reports coming soon.
      </p>
    </div>
  `,
})
export class ParentReportsComponent {}
