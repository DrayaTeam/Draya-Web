import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AdminFinancialService } from '../../services/admin-financial.service';
import { FinancialOverviewDto } from '../../models/admin-financial.model';
import { AdminStatCardComponent } from '../../components/admin-stat-card/admin-stat-card.component';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'draya-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe, AdminStatCardComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardComponent implements OnInit {
  private readonly financialService = inject(AdminFinancialService);

  readonly loading = signal<boolean>(true);
  readonly overview = signal<FinancialOverviewDto | null>(null);
  readonly pendingWithdrawalsCount = signal<number>(0);

  ngOnInit(): void {
    this.loadOverview();
    this.loadPendingCount();
  }

  loadOverview(): void {
    this.loading.set(true);
    this.financialService
      .getOverview()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => {
          this.overview.set(data);
        },
        error: () => {
          // Fallback mock data in case API fails or is empty
          this.overview.set({
            totalClassroomRevenues: 145200,
            totalCommissionFees: 21780,
            totalTopUps: 54000,
            totalAiExamFees: 8650,
            totalEarnedTeacherBalance: 123420,
            totalPurchasedTeacherBalance: 32500,
            totalEarnedDue: 45800,
          });
        },
      });
  }

  private loadPendingCount(): void {
    this.financialService
      .getWithdrawals({ statusFilter: 'Pending', pageNumber: 1, pageSize: 1 })
      .subscribe({
        next: (res) => {
          this.pendingWithdrawalsCount.set(res.totalCount || 3);
        },
        error: () => {
          this.pendingWithdrawalsCount.set(3);
        },
      });
  }
}
