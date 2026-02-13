// import { Component, inject, signal, computed } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
// import { MatCardModule } from '@angular/material/card';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatDatepickerModule } from '@angular/material/datepicker';
// import { MatNativeDateModule } from '@angular/material/core';
// import { MatButtonModule } from '@angular/material/button';
// import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
// import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
// import { MatTableModule } from '@angular/material/table';
// import { MatSelectModule } from '@angular/material/select';
// import { MatChipsModule } from '@angular/material/chips';
// import { MatIconModule } from '@angular/material/icon';
// import { MatExpansionModule } from '@angular/material/expansion';
// import { MatTabsModule } from '@angular/material/tabs';
// import { ReportService } from '../../../../core/services/report.service';
// import {
//   PeriodReport as Report,
//   Vehicle,
//   DailyOperation,
//   FarmTransaction,
//   SaleTransaction,
//   DailyCost,
//   TransportLoss
// } from '../../../../core/models';

// interface VehiclePeriodSummary {
//   vehicle: Vehicle;
//   total_purchases: number;
//   total_sales: number;
//   total_costs: number;
//   total_losses: number;
//   total_profit: number;
//   days_operated: number;
//   operations: DailyOperation[];
// }

// interface DailyOperationWithVehicles extends DailyOperation {
//   vehicles?: Vehicle[];
//   vehicle_operations?: any[];
// }


// @Component({
//   selector: 'app-period-report',
//   imports: [  CommonModule,
//     ReactiveFormsModule,
//     MatCardModule,
//     MatFormFieldModule,
//     MatInputModule,
//     MatDatepickerModule,
//     MatNativeDateModule,
//     MatButtonModule,
//     MatTableModule,
//     MatProgressSpinnerModule,
//     MatSelectModule,
//     MatChipsModule,
//     MatIconModule,
//     MatExpansionModule,
//     MatTabsModule,
//     MatSnackBarModule
// ],
//   templateUrl: './period-report.html',
//   styleUrl: './period-report.css',
// })
// export class PeriodReport {

//   private fb = inject(FormBuilder);
//   private reportService = inject(ReportService);
//   private snackBar = inject(MatSnackBar);

//   loading = signal(false);
//   report = signal<Report | null>(null);

//   // ✅ NEW: Vehicle filtering
//   selectedVehicleId = signal<number | null>(null);

//   // ✅ NEW: Extract all unique vehicles from period
//   allVehicles = computed(() => {
//     const report = this.report();
//     if (!report || !report.daily_operations) return [];

//     const vehicleMap = new Map<number, Vehicle>();

//     report.daily_operations.forEach((op: DailyOperationWithVehicles) => {
//       if (op.vehicles) {
//         op.vehicles.forEach((vehicle: Vehicle) => {
//           vehicleMap.set(vehicle.id, vehicle);
//         });
//       }
//     });

//     return Array.from(vehicleMap.values());
//   });

//   // ✅ NEW: Calculate per-vehicle summaries for entire period
//   vehiclePeriodSummaries = computed(() => {
//     const report = this.report();
//     if (!report) return [];

//     return this.calculateVehiclePeriodSummaries(report);
//   });

//   // ✅ NEW: Filtered operations based on selected vehicle
//   filteredOperations = computed(() => {
//     const report = this.report();
//     const vehicleId = this.selectedVehicleId();

//     if (!report || !report.daily_operations) return [];
//     if (!vehicleId) return report.daily_operations;

//     // Filter operations that used this vehicle
//     return report.daily_operations.filter((op: DailyOperationWithVehicles) => {
//       return op.vehicles?.some(v => v.id === vehicleId);
//     });
//   });

//   // ✅ NEW: Filtered summary totals
//   filteredTotals = computed(() => {
//     const vehicleId = this.selectedVehicleId();
//     const report = this.report();

//     if (!vehicleId || !report) {
//       return  {
//         total_purchases: report?.total_purchases || 0,
//         total_sales: report?.total_revenue || 0,
//         total_costs: report?.total_costs || 0,
//         total_losses:report?.total_losses ||  0,
//         total_profit: report?.net_profit || 0,
//         days_operated: 0
//       };
//     }

//     // Find summary for selected vehicle
//     const vehicleSummary = this.vehiclePeriodSummaries()
//       .find(vs => vs.vehicle.id === vehicleId);

//     if (!vehicleSummary) {
//       return {
//         total_purchases: 0,
//         total_sales: 0,
//         total_costs: 0,
//         total_losses: 0,
//         total_profit: 0,
//         days_operated: 0
//       };
//     }

//     return {
//       total_purchases: vehicleSummary.total_purchases,
//       total_sales: vehicleSummary.total_sales,
//       total_costs: vehicleSummary.total_costs,
//       total_losses: vehicleSummary.total_losses,
//       total_profit: vehicleSummary.total_profit,
//       days_operated: vehicleSummary.days_operated
//     };
//   });

//   periodForm = this.fb.nonNullable.group({
//     from: [new Date(), Validators.required],
//     to: [new Date(), Validators.required]
//   });

//   // ✅ UPDATED: Add vehicle column
//   farmColumns = ['vehicle', 'farm', 'chicken_type', 'weight', 'amount'];
//   saleColumns = ['vehicle', 'buyer', 'chicken_type', 'weight', 'amount'];
//   costColumns = ['vehicle', 'category', 'amount', 'notes'];
//   lossColumns = ['vehicle', 'chicken_type', 'weight', 'amount'];

//   loadReport(): void {
//     if (this.periodForm.invalid) {
//       this.snackBar.open('يرجى اختيار التواريخ', 'حسناً', { duration: 2000 });
//       return;
//     }

//     const formValue = this.periodForm.getRawValue();
//     const fromDate = this.formatDateOnly(formValue.from);
//     const toDate = this.formatDateOnly(formValue.to);

//     this.loading.set(true);

//     this.reportService.getPeriodReport(fromDate, toDate).subscribe({
//       next: (response: any) => {
//         console.log('Period report data:', response.data);
//         this.report.set(response.data);
//         this.loading.set(false);

//         // ✅ Reset vehicle filter
//         this.selectedVehicleId.set(null);
//       },
//       error: (error) => {
//         this.loading.set(false);
//         this.snackBar.open('حدث خطأ في تحميل التقرير', 'حسناً', { duration: 3000 });
//         console.error('Error loading report:', error);
//       }
//     });
//   }

//   // ✅ NEW: Calculate per-vehicle summaries for entire period
//   private calculateVehiclePeriodSummaries(report: Report): VehiclePeriodSummary[] {
//     const vehicles = this.allVehicles();
//     if (vehicles.length === 0) return [];

//     return vehicles.map(vehicle => {
//       let total_purchases = 0;
//       let total_sales = 0;
//       let total_costs = 0;
//       let total_losses = 0;
//       let days_operated = 0;
//       const vehicleOperations: DailyOperation[] = [];

//       report.daily_operations.forEach((op: DailyOperationWithVehicles) => {
//         // Check if this operation used this vehicle
//         const usedThisVehicle = op.vehicles?.some(v => v.id === vehicle.id);

//         if (usedThisVehicle) {
//           days_operated++;
//           vehicleOperations.push(op);

//           // Sum transactions for this vehicle
//           if (op.farm_transactions) {
//             total_purchases += this.sumByVehicle(
//               op.farm_transactions,
//               vehicle.id,
//               'total_amount'
//             );
//           }

//           if (op.sale_transactions) {
//             total_sales += this.sumByVehicle(
//               op.sale_transactions,
//               vehicle.id,
//               'total_amount'
//             );
//           }

//           if (op.daily_costs) {
//             // Vehicle-specific costs
//             const vehicleSpecificCosts = this.sumByVehicle(
//               op.daily_costs.filter((c: DailyCost) => c.vehicle_id === vehicle.id),
//               vehicle.id,
//               'amount'
//             );

//             // Share of shared costs
//             const sharedCosts = op.daily_costs
//               .filter((c: DailyCost) => !c.vehicle_id)
//               .reduce((sum: number, c: DailyCost) => sum + (c.amount || 0), 0);

//             const vehicleCount = op.vehicles?.length || 1;
//             const sharedCostShare = sharedCosts / vehicleCount;

//             total_costs += vehicleSpecificCosts + sharedCostShare;
//           }

//           if (op.transport_losses) {
//             total_losses += this.sumByVehicle(
//               op.transport_losses,
//               vehicle.id,
//               'loss_amount'
//             );
//           }
//         }
//       });

//       const total_profit = total_sales - total_purchases - total_costs - total_losses;

//       return {
//         vehicle,
//         total_purchases,
//         total_sales,
//         total_costs,
//         total_losses,
//         total_profit,
//         days_operated,
//         operations: vehicleOperations
//       };
//     });
//   }

//   // ✅ Helper: Sum transactions by vehicle
//   private sumByVehicle(items: any[], vehicleId: number, field: string): number {
//     return items
//       .filter(item => item.vehicle_id === vehicleId)
//       .reduce((sum, item) => sum + (item[field] || 0), 0);
//   }

//   // ✅ NEW: Get vehicle name
//   getVehicleName(vehicleId: number | null | undefined): string {
//     if (!vehicleId) return 'مشترك';
//     const vehicle = this.allVehicles().find(v => v.id === vehicleId);
//     return vehicle ? vehicle.name : '-';
//   }

//   // ✅ NEW: Get vehicles for an operation
//   getOperationVehicles(operation: DailyOperationWithVehicles): Vehicle[] {
//     return operation.vehicles || [];
//   }

//   // ✅ NEW: Filter operation transactions by vehicle
//   filterOperationTransactions(transactions: any[] | undefined, vehicleId: number | null): any[] {
//     if (!transactions) return [];
//     if (!vehicleId) return transactions;
//     return transactions.filter(tx => tx.vehicle_id === vehicleId);
//   }

//   // ✅ NEW: Handle vehicle filter change
//   onVehicleFilterChange(vehicleId: number | null): void {
//     this.selectedVehicleId.set(vehicleId);
//   }

//   // ✅ NEW: Get dynamic columns based on filter
//   getDynamicColumns(baseColumns: string[]): string[] {
//     return this.selectedVehicleId()
//       ? baseColumns.filter(col => col !== 'vehicle')
//       : baseColumns;
//   }

//   private formatDateOnly(date: Date): string {
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const day = String(date.getDate()).padStart(2, '0');
//     return `${year}-${month}-${day}`;
//   }
// }
// import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
// import { MatCardModule } from '@angular/material/card';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatDatepickerModule } from '@angular/material/datepicker';
// import { MatNativeDateModule } from '@angular/material/core';
// import { MatButtonModule } from '@angular/material/button';
// import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
// import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
// import { MatIconModule } from '@angular/material/icon';
// import { MatTabsModule } from '@angular/material/tabs';
// import { MatChipsModule } from '@angular/material/chips';
// import { MatTooltipModule } from '@angular/material/tooltip';
// import { MatDividerModule } from '@angular/material/divider';

// import { ReportService } from '../../../../core/services/report.service';
// import { PeriodReportResponse } from '../../../../core/models';

// // Import child components (to be created)
// import { ExecutiveSummary } from './components/executive-summary/executive-summary';
// import { RevenueBreakdown } from './components/revenue-breakdown/revenue-breakdown';
// import { VehiclePerformance } from './components/vehicle-performance/vehicle-performance';
// import { DebtPosition } from './components/debt-position/debt-position';
// import { AlertsPanel } from './components/alerts-panel/alerts-panel';
// import { PeriodComparison } from './components/period-comparison/period-comparison';
// import { CostBreakdown } from './components/cost-breakdown/cost-breakdown';

// @Component({
//   selector: 'app-period-report',
//   standalone: true,
//   imports: [
//     CommonModule,
//     ReactiveFormsModule,
//     MatCardModule,
//     MatFormFieldModule,
//     MatInputModule,
//     MatDatepickerModule,
//     MatNativeDateModule,
//     MatButtonModule,
//     MatSnackBarModule,
//     MatProgressSpinnerModule,
//     MatIconModule,
//     MatTabsModule,
//     MatChipsModule,
//     MatTooltipModule,
//     MatDividerModule,
//     ExecutiveSummary ,
//     RevenueBreakdown ,
//     CostBreakdown,
//     VehiclePerformance ,
//     DebtPosition ,
//     AlertsPanel ,
//     PeriodComparison
//   ],
//   templateUrl: './period-report.html',
//   styleUrl: './period-report.css',
//   changeDetection: ChangeDetectionStrategy.OnPush
// })
// export class PeriodReport {
//   private fb = inject(FormBuilder);
//   private reportService = inject(ReportService);
//   private snackBar = inject(MatSnackBar);

//   // State management using signals
//   loading = signal(false);
//   report = signal<PeriodReportResponse | null>(null);
//   selectedTab = signal(0);

//   // Computed signals for easy access
//   hasReport = computed(() => this.report() !== null);
//   hasAlerts = computed(() => {
//     const r = this.report();
//     return r && r.highlights_and_alerts?.alerts?.length > 0;
//   });
//   alertCount = computed(() => {
//     const r = this.report();
//     return r?.highlights_and_alerts?.alerts?.length || 0;
//   });

//   // Form setup
//   periodForm = this.fb.nonNullable.group({
//     from: [this.getDefaultStartDate(), Validators.required],
//     to: [new Date(), Validators.required]
//   });

//   /**
//    * Default start date: 30 days ago
//    */
//   private getDefaultStartDate(): Date {
//     const date = new Date();
//     date.setDate(date.getDate() - 30);
//     return date;
//   }

//   /**
//    * Load report from backend
//    */
//   loadReport(): void {
//     if (this.periodForm.invalid) {
//       this.snackBar.open('يرجى اختيار نطاق التواريخ', 'حسناً', {
//         duration: 3000
//       });
//       return;
//     }

//     const formValue = this.periodForm.getRawValue();

//     // Validate date range
//     const validation = this.reportService.validateDateRange(formValue.from, formValue.to);
//     if (!validation.valid) {
//       this.snackBar.open(validation.error!, 'حسناً', {
//         duration: 4000
//       });
//       return;
//     }

//     const dateRange = {
//       from: this.reportService.formatDate(formValue.from),
//       to: this.reportService.formatDate(formValue.to)
//     };

//     this.loading.set(true);

//     this.reportService.getPeriodReport(dateRange).subscribe({
//       next: (response) => {
//         console.log('Period report loaded:', response);
//         this.report.set(response);
//         this.loading.set(false);
//         this.selectedTab.set(0); // Reset to first tab

//         this.snackBar.open('تم تحميل التقرير بنجاح', 'حسناً', {
//           duration: 2000
//         });
//       },
//       error: (error) => {
//         console.error('Error loading period report:', error);
//         this.loading.set(false);

//         const errorMessage = error.error?.message || 'حدث خطأ أثناء تحميل التقرير';
//         this.snackBar.open(errorMessage, 'حسناً', {
//           duration: 5000
//         });
//       }
//     });
//   }

//   /**
//    * Export report (placeholder for future implementation)
//    */
//   exportReport(): void {
//     this.snackBar.open('وظيفة التصدير قيد التطوير', 'حسناً', {
//       duration: 2000
//     });
//   }

//   /**
//    * Print report (placeholder for future implementation)
//    */
//   printReport(): void {
//     window.print();
//   }

//   /**
//    * Clear current report
//    */
//   clearReport(): void {
//     this.report.set(null);
//     this.selectedTab.set(0);
//   }
// }
// ========================================
// Updated Period Report Component
// ========================================
import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

import { ReportService } from '../../../../core/services/report.service';
import { ReportUtilitiesService } from '../../../../core/services/ReportUtilitiesService';

import { PeriodReportResponse } from '../../../../core/models';

// Import child components
import { ExecutiveSummary } from './components/executive-summary/executive-summary';
import { RevenueBreakdown } from './components/revenue-breakdown/revenue-breakdown';
import { VehiclePerformance } from './components/vehicle-performance/vehicle-performance';
import { DebtPosition } from './components/debt-position/debt-position';
import { AlertsPanel } from './components/alerts-panel/alerts-panel';
import { PeriodComparison } from './components/period-comparison/period-comparison';
import { CostBreakdown } from './components/cost-breakdown/cost-breakdown';

@Component({
  selector: 'app-period-report',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatTabsModule,
    MatChipsModule,
    MatTooltipModule,
    MatDividerModule,
    ExecutiveSummary,
    RevenueBreakdown,
    CostBreakdown,
    VehiclePerformance,
    DebtPosition,
    AlertsPanel,
    PeriodComparison
  ],
  templateUrl: './period-report.html',
  styleUrl: './period-report.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PeriodReport {
  private fb = inject(FormBuilder);
  private reportService = inject(ReportService);
  private utils = inject(ReportUtilitiesService);
  private snackBar = inject(MatSnackBar);

  // State management using signals
  loading = signal(false);
  report = signal<PeriodReportResponse | null>(null);
  selectedTab = signal(0);

  // Computed signals
  hasReport = computed(() => this.report() !== null);
  hasAlerts = computed(() => {
    const r = this.report();
    return r && r.highlights_and_alerts?.alerts?.length > 0;
  });
  alertCount = computed(() => {
    const r = this.report();
    return r?.highlights_and_alerts?.alerts?.length || 0;
  });

  // Form setup
  periodForm = this.fb.nonNullable.group({
    from: [this.getDefaultStartDate(), Validators.required],
    to: [new Date(), Validators.required]
  });

  /**
   * Default start date: 30 days ago
   */
  private getDefaultStartDate(): Date {
    const date =new Date();
    date.setDate(date.getDate() - 30);
    return date;
  }

  /**
   * Set quick date ranges
   */
  setLastWeek(): void {
    const range = this.utils.getLastNDays(7);
    this.periodForm.patchValue(range);
  }

  setLastMonth(): void {
    const range = this.utils.getLastNDays(30);
    this.periodForm.patchValue(range);
  }

  setCurrentMonth(): void {
    const range = this.utils.getCurrentMonth();
    this.periodForm.patchValue(range);
  }

  setPreviousMonth(): void {
    const range = this.utils.getPreviousMonth();
    this.periodForm.patchValue(range);
  }

  /**
   * Load report from backend
   */
  loadReport(): void {
    if (this.periodForm.invalid) {
      this.snackBar.open('يرجى اختيار نطاق التواريخ', 'حسناً', {
        duration: 3000
      });
      return;
    }

    const formValue = this.periodForm.getRawValue();

    // Validate date range
    const validation = this.utils.validateDateRange(formValue.from, formValue.to);
    if (!validation.valid) {
      this.snackBar.open(validation.error!, 'حسناً', {
        duration: 4000
      });
      return;
    }

    const dateRange = {
      from: this.utils.toISODate(formValue.from),
      to: this.utils.toISODate(formValue.to)
    };

    this.loading.set(true);

    this.reportService.getPeriodReport(dateRange).subscribe({
      next: (response) => {
        console.log('Period report loaded:', response);
        this.report.set(response);
        this.loading.set(false);
        this.selectedTab.set(0);

        this.snackBar.open('تم تحميل التقرير بنجاح', 'حسناً', {
          duration: 2000
        });
      },
      error: (error) => {
        console.error('Error loading period report:', error);
        this.loading.set(false);

        const errorMessage = error.error?.message || 'حدث خطأ أثناء تحميل التقرير';
        this.snackBar.open(errorMessage, 'حسناً', {
          duration: 5000
        });
      }
    });
  }
/**
 * Export report to Excel with Arabic formatting
 */
/**
 * Export report to Excel with Arabic formatting
 */
exportReport(): void {
  const report = this.report();
  if (!report) return;

  try {
    const sheets = [
      {
        name: 'الملخص التنفيذي',
        data: this.prepareExecutiveSummary(report)
      },
      {
        name: 'تحليل الإيرادات',
        data: this.prepareRevenueData(report)
      },
      {
        name: 'تحليل التكاليف',
        data: this.prepareCostData(report)
      },
      {
        name: 'أداء المركبات',
        data: this.prepareVehiclePerformance(report)
      },
      {
        name: 'المركز المالي',
        data: this.prepareDebtPosition(report)
      },
      {
        name: 'المؤشرات التشغيلية',
        data: this.prepareOperationalMetrics(report)
      }
    ];

    const { from, to } = this.periodForm.getRawValue();
    const fileName = `تقرير_الفترة_${this.utils.toISODate(from)}_الى_${this.utils.toISODate(to)}`;

    this.utils.exportMultipleSheetsToExcel(sheets, fileName);

    this.snackBar.open('تم تصدير التقرير إلى Excel بنجاح', 'حسناً', {
      duration: 2000
    });
  } catch (error) {
    console.error('Error exporting report:', error);
    this.snackBar.open('حدث خطأ أثناء تصدير التقرير', 'حسناً', {
      duration: 3000
    });
  }
}
// Helper methods for Excel export
private prepareExecutiveSummary(report: PeriodReportResponse): any[] {
  return [
    { 'البيان': 'معلومات الفترة', 'القيمة': '' },
    { 'البيان': 'الفترة', 'القيمة': `من ${this.utils.formatDate(report.period.start_date)} إلى ${this.utils.formatDate(report.period.end_date)}` },
    { 'البيان': 'من تاريخ', 'القيمة': this.utils.formatDate(report.period.start_date) },
    { 'البيان': 'إلى تاريخ', 'القيمة': this.utils.formatDate(report.period.end_date )},
    { 'البيان': 'مدة الفترة', 'القيمة': this.utils.formatNumber(report.period.duration_days, 0) + ' يوم' },
    { 'البيان': 'أيام العمل', 'القيمة': this.utils.formatNumber(report.period.operating_days, 0) },
    { 'البيان': 'عدد العمليات', 'القيمة': this.utils.formatNumber(report.period.total_operations, 0) },
    { 'البيان': 'عدد المركبات', 'القيمة': this.utils.formatNumber(report.period.vehicles_used, 0) },
    { 'البيان': '', 'القيمة': '' },
    { 'البيان': 'الملخص المالي', 'القيمة': '' },
    { 'البيان': 'إجمالي الإيرادات', 'القيمة': this.utils.formatCurrency(report.executive_summary.financial.total_revenue) + ' ج' },
    { 'البيان': 'إجمالي التكاليف', 'القيمة': this.utils.formatCurrency(report.executive_summary.financial.total_costs) + ' ج' },
    { 'البيان': 'صافي الربح', 'القيمة': this.utils.formatCurrency(report.executive_summary.financial.net_profit) + ' ج' },
    { 'البيان': 'هامش الربح', 'القيمة': this.utils.formatPercentage(report.executive_summary.financial.profit_margin_percentage) },
    { 'البيان': 'متوسط الربح اليومي', 'القيمة': this.utils.formatCurrency(report.executive_summary.financial.avg_daily_profit) + ' ج' },
    { 'البيان': '', 'القيمة': '' },
    { 'البيان': 'المؤشرات التشغيلية', 'القيمة': '' },
    { 'البيان': 'إجمالي الحجم', 'القيمة': this.utils.formatNumber(report.executive_summary.operational.total_volume_kg) + ' كجم' },
    { 'البيان': 'متوسط السعر للكيلو', 'القيمة': this.utils.formatCurrency(report.executive_summary.operational.avg_price_per_kg) + ' ج/كجم' },
    { 'البيان': 'نسبة الخسائر', 'القيمة': this.utils.formatPercentage(report.executive_summary.operational.loss_percentage) },
    { 'البيان': 'عدد الصفقات', 'القيمة': this.utils.formatNumber(report.executive_summary.operational.total_transactions, 0) }
  ];
}

private prepareRevenueData(report: PeriodReportResponse): any[] {
  const data: any[] = [
    { 'البيان': 'إجمالي المبيعات', 'القيمة': this.utils.formatCurrency(report.revenue_breakdown.total_sales) + ' ج' },
    { 'البيان': 'إجمالي الوزن', 'القيمة': this.utils.formatNumber(report.revenue_breakdown.total_volume_kg) + ' كجم' },
    { 'البيان': 'متوسط سعر البيع', 'القيمة': this.utils.formatCurrency(report.revenue_breakdown.avg_sale_price_per_kg) + ' ج/كجم' },
    { 'البيان': 'عدد المشترين', 'القيمة': this.utils.formatNumber(report.revenue_breakdown.buyers_served, 0) },
    { 'البيان': '', 'نوع الفراخ': '', 'الوزن (كجم)': '', 'الإيرادات (ج)': '', 'النسبة': '', 'عدد الصفقات': '' }
  ];

  report.revenue_breakdown.by_chicken_type.forEach(type => {
    data.push({
      'البيان': '',
      'نوع الفراخ': type.chicken_type_name,
      'الوزن (كجم)': this.utils.formatNumber(type.total_volume_kg),
      'الإيرادات (ج)': this.utils.formatCurrency(type.total_revenue),
      'النسبة': this.utils.formatPercentage(type.percentage_of_revenue),
      'عدد الصفقات': this.utils.formatNumber(type.transaction_count, 0)
    });
  });

  return data;
}

private prepareCostData(report: PeriodReportResponse): any[] {
  const data: any[] = [
    { 'البيان': 'إجمالي التكاليف', 'القيمة': this.utils.formatCurrency(report.cost_breakdown.total_costs) + ' ج' },
    { 'البيان': 'التكلفة للكيلو', 'القيمة': this.utils.formatCurrency(report.cost_breakdown.cost_per_kg) + ' ج/كجم' },
    { 'البيان': '', 'القيمة': '' },
    { 'البيان': 'مكونات التكلفة', 'القيمة': '' },
    { 'البيان': 'المشتريات', 'القيمة': this.utils.formatCurrency(report.cost_breakdown.components.purchases) + ' ج' },
    { 'البيان': 'تكاليف المركبات', 'القيمة': this.utils.formatCurrency(report.cost_breakdown.components.vehicle_costs) + ' ج' },
    { 'البيان': 'التكاليف التشغيلية', 'القيمة': this.utils.formatCurrency(report.cost_breakdown.components.operating_costs) + ' ج' },
    { 'البيان': 'الخسائر', 'القيمة': this.utils.formatCurrency(report.cost_breakdown.components.losses) + ' ج' },
    { 'البيان': '', 'الفئة': '', 'المبلغ (ج)': '', 'النسبة': '', 'نوع التكلفة': '' }
  ];

  report.cost_breakdown.top_cost_categories.forEach(category => {
    data.push({
      'البيان': '',
      'الفئة': category.category_name,
      'المبلغ (ج)': this.utils.formatCurrency(category.amount),
      'النسبة': this.utils.formatPercentage(category.percentage),
      'نوع التكلفة': category.is_vehicle_cost ? 'تكلفة مركبة' : 'تكلفة أخرى'
    });
  });

  return data;
}

private prepareVehiclePerformance(report: PeriodReportResponse): any[] {
  const data: any[] = [];

  report.vehicle_performance.vehicles.forEach(vehicle => {
    data.push({
      'المركبة': vehicle.vehicle_name,
      'رقم اللوحة': vehicle.plate_number,
      'الترتيب': this.utils.formatNumber(vehicle.rank, 0),
      'أيام العمل': this.utils.formatNumber(vehicle.days_operated, 0),
      'الإيرادات (ج)': this.utils.formatCurrency(vehicle.total_revenue),
      'المشتريات (ج)': this.utils.formatCurrency(vehicle.total_purchases),
      'التكاليف (ج)': this.utils.formatCurrency(vehicle.total_costs),
      'تكاليف المركبة (ج)': this.utils.formatCurrency(vehicle.vehicle_costs),
      'الخسائر (ج)': this.utils.formatCurrency(vehicle.total_losses),
      'صافي الربح (ج)': this.utils.formatCurrency(vehicle.net_profit),
      'هامش الربح': this.utils.formatPercentage(vehicle.profit_margin_pct),
      'متوسط الربح اليومي (ج)': this.utils.formatCurrency(vehicle.avg_daily_profit),
      'التقييم': vehicle.performance_rating === 'EXCELLENT' ? 'ممتاز' :
                 vehicle.performance_rating === 'GOOD' ? 'جيد' :
                 vehicle.performance_rating === 'AVERAGE' ? 'متوسط' : 'يحتاج تحسين'
    });
  });

  return data;
}

private prepareDebtPosition(report: PeriodReportResponse): any[] {
  const data: any[] = [
    { 'البيان': 'ملخص المركز المالي', 'القيمة': '' },
    { 'البيان': 'إجمالي الذمم المدينة', 'القيمة': this.utils.formatCurrency(report.debt_position.summary.total_receivables) + ' ج' },
    { 'البيان': 'إجمالي الذمم الدائنة', 'القيمة': this.utils.formatCurrency(report.debt_position.summary.total_payables) + ' ج' },
    { 'البيان': 'صافي رأس المال العامل', 'القيمة': this.utils.formatCurrency(report.debt_position.summary.net_working_capital) + ' ج' },
    { 'البيان': '', 'القيمة': '' },
    { 'البيان': 'ديون المشترين', 'القيمة': '' },
    { 'البيان': 'إجمالي الديون المستحقة', 'القيمة': this.utils.formatCurrency(report.debt_position.buyers.total_outstanding) + ' ج' },
    { 'البيان': 'عدد المشترين المدينين', 'القيمة': this.utils.formatNumber(report.debt_position.buyers.buyers_with_debt, 0) }
  ];

  if (report.debt_position.buyers.largest_debtor) {
    data.push({
      'البيان': 'أكبر مدين',
      'القيمة': `${report.debt_position.buyers.largest_debtor.buyer_name} - ${this.utils.formatCurrency(report.debt_position.buyers.largest_debtor.amount_owed)} ج`
    });
  }

  data.push(
    { 'البيان': '', 'القيمة': '' },
    { 'البيان': 'أرصدة المزارع', 'القيمة': '' },
    { 'البيان': 'إجمالي المستحقات (لنا عليهم)', 'القيمة': this.utils.formatCurrency(report.debt_position.farms.total_receivables) + ' ج' },
    { 'البيان': 'إجمالي المدفوعات (لهم علينا)', 'القيمة': this.utils.formatCurrency(report.debt_position.farms.total_payables) + ' ج' },
    { 'البيان': 'صافي المركز', 'القيمة': this.utils.formatCurrency(report.debt_position.farms.net_position) + ' ج' },
    { 'البيان': 'نوع المركز', 'القيمة':
      report.debt_position.farms.position_type === 'NET_RECEIVABLE' ? 'لنا عليهم' :
      report.debt_position.farms.position_type === 'NET_PAYABLE' ? 'لهم علينا' : 'متوازن'
    },
    { 'البيان': 'عدد المزارع ذات الأرصدة', 'القيمة': this.utils.formatNumber(report.debt_position.farms.farms_with_balance, 0) }
  );

  if (report.debt_position.farms.largest_debtor) {
    data.push({
      'البيان': 'أكبر مزرعة مدينة',
      'القيمة': `${report.debt_position.farms.largest_debtor.farm_name} - ${this.utils.formatCurrency(report.debt_position.farms.largest_debtor.amount_owed)} ج`
    });
  }

  return data;
}

private prepareOperationalMetrics(report: PeriodReportResponse): any[] {
  return [
    { 'البيان': 'مؤشرات الحجم', 'القيمة': '' },
    { 'البيان': 'إجمالي المشتريات', 'القيمة': this.utils.formatNumber(report.operational_metrics.volume_metrics.total_purchased_kg) + ' كجم' },
    { 'البيان': 'إجمالي المبيعات', 'القيمة': this.utils.formatNumber(report.operational_metrics.volume_metrics.total_sold_kg) + ' كجم' },
    { 'البيان': 'الخسائر', 'القيمة': this.utils.formatNumber(report.operational_metrics.volume_metrics.total_lost_kg) + ' كجم' },
    { 'البيان': 'نسبة الخسائر', 'القيمة': this.utils.formatPercentage(report.operational_metrics.volume_metrics.loss_percentage) },
    { 'البيان': '', 'القيمة': '' },
    { 'البيان': 'مؤشرات التسعير', 'القيمة': '' },
    { 'البيان': 'متوسط سعر الشراء', 'القيمة': this.utils.formatCurrency(report.operational_metrics.pricing_metrics.avg_purchase_price_per_kg) + ' ج/كجم' },
    { 'البيان': 'متوسط سعر البيع', 'القيمة': this.utils.formatCurrency(report.operational_metrics.pricing_metrics.avg_sale_price_per_kg) + ' ج/كجم' },
    { 'البيان': 'هامش الربح الإجمالي', 'القيمة': this.utils.formatCurrency(report.operational_metrics.pricing_metrics.gross_margin_per_kg) + ' ج/كجم' },
    { 'البيان': 'نسبة هامش الربح', 'القيمة': this.utils.formatPercentage(report.operational_metrics.pricing_metrics.gross_margin_percentage) },
    { 'البيان': '', 'القيمة': '' },
    { 'البيان': 'مؤشرات الكفاءة', 'القيمة': '' },
    { 'البيان': 'المزارع المتعاملة', 'القيمة': this.utils.formatNumber(report.operational_metrics.efficiency_metrics.farms_engaged, 0) },
    { 'البيان': 'المشترين المتعاملين', 'القيمة': this.utils.formatNumber(report.operational_metrics.efficiency_metrics.buyers_engaged, 0) },
    { 'البيان': 'متوسط حجم الصفقة', 'القيمة': this.utils.formatNumber(report.operational_metrics.efficiency_metrics.avg_transaction_size_kg) + ' كجم' }
  ];
}  /**
   * Print report
   */
  printReport(): void {
    this.utils.printPage();
  }

  /**
   * Clear current report
   */
  clearReport(): void {
    this.report.set(null);
    this.selectedTab.set(0);
  }

  /**
   * Utility methods for formatting (delegated to service)
   */
 formatCurrency = (amount: number | undefined | null) => this.utils.formatCurrency(amount);
formatNumber = (num: number | undefined | null, decimals?: number) => this.utils.formatNumber(num, decimals);
formatPercentage = (value: number | undefined | null, decimals?: number) => this.utils.formatPercentage(value, decimals);
formatDateTime = (date: string | Date | undefined | null) => this.utils.formatDateTime(date);

}
