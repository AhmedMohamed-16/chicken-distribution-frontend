import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { SafeDashboard, SafeType } from '../../../core/models/safe.model';
import { SafeService } from '../../../core/services/safe.service';
import { FinancialTransactionService } from '../../../core/services/financial-transaction.service';
import { AdvanceService } from '../../../core/services/advance.service';
import { BuyerService } from '../../../core/services/buyer.service';
import { FarmService } from '../../../core/services/farm.service';
import { ReportUtilitiesService } from '../../../core/services/ReportUtilitiesService';
import { AuthService } from '../../../core/services/auth.service';
import { SafeTransferDialog } from '../../master-data/safes/safe-transfer-dialog/safe-transfer-dialog';
import { MatGridListModule } from '@angular/material/grid-list';

@Component({
  selector: 'app-finance-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
    MatGridListModule
  ],
  templateUrl: './finance-dashboard.component.html',
  styleUrls: ['./finance-dashboard.component.css']
})
export class FinanceDashboardComponent implements OnInit {
  private safeService = inject(SafeService);
  private financialTransactionService = inject(FinancialTransactionService);
  private advanceService = inject(AdvanceService);
  private buyerService = inject(BuyerService);
  private farmService = inject(FarmService);
  private reportUtils = inject(ReportUtilitiesService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  isLoading = signal(true);
  safeCounters = signal<SafeDashboard[]>([]);
  financialSummary = signal({
    total_sales: 0,
    total_purchases: 0,
    total_costs: 0,
    total_losses: 0,
    vehicle_costs: 0,
    net_profit: 0,
    // Discounts breakdown
    total_discount: 0,
    total_sales_discount: 0,
    total_purchase_discount: 0,
    // Debts breakdown
    total_debts_paid: 0,
    debts_paid_from_sales: 0,
    debts_paid_from_purchases: 0,
    debts_paid_from_costs: 0,
    total_debts_received: 0,
    debts_received_from_sales: 0,
    debts_received_from_purchases: 0,
    debts_received_from_costs: 0,
    // Losses breakdown
    sale_losses: 0,
    transport_losses: 0,
    lossesWithFarm: 0,
    lossesWithoutFarm: 0,
    // Operation counts
    total_operations_count: 0,
    closed_operations_count: 0,
    open_operations_count: 0
  });

  pendingAdvancesCount = signal(0);
  buyersDebtCount = signal(0);
  farmsPayablesCount = signal(0);

  isAdmin = computed(() => this.authService.hasPermission('APPLICATION_ADMIN'));

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading.set(true);
    const today = new Date().toISOString().slice(0, 10);

    forkJoin({
      safeDashboard: this.safeService.getDashboard(),
      financeSummary: this.financialTransactionService.getSummary(today),
      pendingAdvances: this.advanceService.getPending(),
      buyers: this.buyerService.getAll(),
      payables: this.farmService.getPayables()
    }).subscribe({
      next: ({ safeDashboard, financeSummary, pendingAdvances, buyers, payables }) => {
        this.safeCounters.set(safeDashboard?.data ?? []);

        const agg = financeSummary?.aggregatedSummary;

        if (agg) {
          this.financialSummary.set({
            total_sales: agg.totals.total_revenue,
            total_purchases: agg.totals.total_purchases,
            total_costs: agg.totals.total_costs,
            total_losses: agg.totals.total_losses,
            vehicle_costs: agg.totals.vehicle_costs,
            net_profit: agg.totals.net_profit,
            // Discounts
            total_discount: agg.discounts.total,
            total_sales_discount: agg.discounts.total_sales_discount,
            total_purchase_discount: agg.discounts.total_purchase_discount,
            // Debts paid
            total_debts_paid: agg.debts_paid.total,
            debts_paid_from_sales: agg.debts_paid.from_sales,
            debts_paid_from_purchases: agg.debts_paid.from_purchases,
            debts_paid_from_costs: agg.debts_paid.from_costs,
            // Debts received
            total_debts_received: agg.debts_received.total,
            debts_received_from_sales: agg.debts_received.from_sales,
            debts_received_from_purchases: agg.debts_received.from_purchases,
            debts_received_from_costs: agg.debts_received.from_costs,
            // Losses breakdown
            sale_losses: agg.losses.sale_losses,
            transport_losses: agg.losses.transport_losses,
            lossesWithFarm: agg.losses.lossesWithFarm,
            lossesWithoutFarm: agg.losses.lossesWithoutFarm,
            // Operation counts
            total_operations_count: agg.total_operations_count,
            closed_operations_count: agg.closed_operations_count,
            open_operations_count: agg.open_operations_count
          });
        }

        this.pendingAdvancesCount.set((pendingAdvances?.data ?? []).length);

        const buyerData = Array.isArray(buyers) ? buyers : [];
        this.buyersDebtCount.set(buyerData.filter((b: any) => Number(b.current_balance ?? 0) > 0).length);

        const payablesData = Array.isArray(payables?.data) ? payables.data : [];
        this.farmsPayablesCount.set(payablesData.length);

        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.snackBar.open('فشل تحميل بيانات لوحة المالية', 'حسناً', { duration: 3000 });
      }
    });
  }

  getSafeTypeLabel(type: SafeType): string {
    switch (type) {
      case 'CASH':
        return 'نقدي';
      case 'BANK':
        return 'بنك';
      case 'VODAFONE_CASH':
        return 'فودافون كاش';
      case 'INSTAPAY':
        return 'انستاباي';
      default:
        return type;
    }
  }

  getSafeColor(balance: number): string {
    if (balance > 0) return '#16a34a';
    if (balance === 0) return '#6b7280';
    return '#dc2626';
  }

  safeCardClicked(): void {
    this.router.navigate(['/master-data/safes']);
  }

  openSafeTransfer(): void {
    const dialogRef = this.dialog.open(SafeTransferDialog, {
      width: '720px',
      data: { safes: this.safeCounters() }
    });

    dialogRef.afterClosed().subscribe((transfer) => {
      if (transfer) {
        this.safeService.createTransfer(transfer).subscribe({
          next: () => {
            this.snackBar.open('تم تحويل الخزنة بنجاح', 'حسناً', { duration: 3000 });
            this.loadDashboardData();
          },
          error: () => {
            this.snackBar.open('فشل تحويل الخزنة', 'حسناً', { duration: 3000 });
            this.loadDashboardData();
          }
        });
      }
    });
  }

  navigateTo(path: string): void {
    this.router.navigateByUrl(path);
  }

  formatCurrency(value: number): string {
    return this.reportUtils.formatCurrency(value);
  }
}
