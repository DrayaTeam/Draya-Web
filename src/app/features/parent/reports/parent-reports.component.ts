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
  templateUrl: './parent-reports.component.html',
})
export class ParentReportsComponent {}
