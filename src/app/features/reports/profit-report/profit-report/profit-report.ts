// import { Component, OnInit, inject, signal, computed } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
// import { MatCardModule } from '@angular/material/card';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatDatepickerModule } from '@angular/material/datepicker';
// import { MatNativeDateModule } from '@angular/material/core';
// import { MatButtonModule } from '@angular/material/button';
// import { MatTableModule } from '@angular/material/table';
// import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
// import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
// import { MatSelectModule } from '@angular/material/select';
// import { MatChipsModule } from '@angular/material/chips';
// import { MatIconModule } from '@angular/material/icon';
// import { MatExpansionModule } from '@angular/material/expansion';
// import { ReportService } from '../../../../core/services/report.service';
// import { Vehicle } from '../../../../core/models';
// // ✅ Partner profit breakdown (per vehicle or overall)
// interface PartnerProfit {
//   partner_id: number;
//   partner_name: string;
//   vehicle_id?: number;  // ✅ NEW: Which vehicle this profit is from
//   total_base_share: number;
//   total_vehicle_cost_share: number;
//   total_final_profit: number;
// }

// // ✅ Daily distribution (now multi-vehicle aware)
// interface DailyDistribution {
//   daily_operation_id: number;
//   operation_date: string;
//   vehicle_id?: number;  // ✅ NEW: Which vehicle
//   net_profit: number;
//   total_revenue: number;
//   total_purchases: number;
//   total_losses: number;
//   total_costs: number;
//   vehicle_costs: number;
// }

// // ✅ Complete profit report structure
// interface IProfitReport {
//   period: {
//     from: string;
//     to: string;
//   };
//   vehicles: Vehicle[];  // ✅ NEW: Vehicles in this period
//   totals: {
//     net_profit: number;
//     total_revenue: number;
//     total_purchases: number;
//     total_losses: number;
//     total_costs: number;
//     total_vehicle_costs: number;  // ✅ Renamed from vehicle_costs
//   };
//   partner_totals: PartnerProfit[];
//   daily_distributions: DailyDistribution[];
// }

// // ✅ Per-vehicle profit summary (mirrors VehicleSummary from DailyReport)
// interface VehicleProfitSummary {
//   vehicle: Vehicle;
//   total_revenue: number;
//   total_purchases: number;
//   total_losses: number;
//   total_costs: number;
//   vehicle_costs: number;
//   net_profit: number;
//   partner_profits: PartnerProfit[];
//   daily_distributions: DailyDistribution[];
// }


// @Component({
//   selector: 'app-profit-report',
//   imports: [CommonModule,
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
//     MatSnackBarModule

//   ],
//   templateUrl: './profit-report.html',
//   styleUrl: './profit-report.css',
// })
// export class ProfitReport implements OnInit {
//   private fb = inject(FormBuilder);
//   private reportService = inject(ReportService);
//   private snackBar = inject(MatSnackBar);

//   loading = signal(false);
//   report = signal<IProfitReport | null>(null);

//   // ✅ COPY from DailyReport: Selected vehicle filter
//   selectedVehicleId = signal<number | null>(null);

//   // ✅ COPY from DailyReport: Available vehicles
//   vehicles = computed(() => {
//     return this.report()?.vehicles || [];
//   });

//   // ✅ COPY from DailyReport: Per-vehicle summaries
//   vehicleSummaries = computed(() => {
//     const report = this.report();
//     if (!report) return [];

//     return this.calculateVehicleProfitSummaries(report);
//   });

//   // ✅ COPY from DailyReport: Filtered data based on selected vehicle
//   filteredPartnerProfits = computed(() => {
//     const vehicleId = this.selectedVehicleId();
//     const report = this.report();

//     if (!report || !report.partner_totals) return [];
//     if (!vehicleId) return report.partner_totals;

//     // ✅ Filter to show only profits for this vehicle
//     return report.partner_totals.filter(profit =>
//       profit.vehicle_id === vehicleId || !profit.vehicle_id
//     );
//   });

//   filteredDailyDistributions = computed(() => {
//     const vehicleId = this.selectedVehicleId();
//     const report = this.report();

//     if (!report || !report.daily_distributions) return [];
//     if (!vehicleId) return report.daily_distributions;

//     return report.daily_distributions.filter(dist =>
//       dist.vehicle_id === vehicleId || !dist.vehicle_id
//     );
//   });

//   // ✅ Computed totals for filtered view
//   filteredTotals = computed(() => {
//     const vehicleId = this.selectedVehicleId();
//     const report = this.report();

//     if (!report) return null;
//     if (!vehicleId) return report.totals;

//     // ✅ Calculate totals for selected vehicle only
//     const vehicleSummary = this.vehicleSummaries().find(s => s.vehicle.id === vehicleId);
//     if (!vehicleSummary) return report.totals;

//     return {
//       net_profit: vehicleSummary.net_profit,
//       total_revenue: vehicleSummary.total_revenue,
//       total_purchases: vehicleSummary.total_purchases,
//       total_losses: vehicleSummary.total_losses,
//       total_costs: vehicleSummary.total_costs,
//       total_vehicle_costs: vehicleSummary.vehicle_costs
//     };
//   });

//   dateForm = this.fb.nonNullable.group({
//     from: [new Date(), Validators.required],
//     to: [new Date(), Validators.required]
//   });

//   // ✅ Table columns with vehicle column
//   partnerColumns = ['vehicle', 'partner_name', 'base_share', 'vehicle_cost', 'final_profit'];
//   dailyColumns = ['vehicle', 'date', 'net_profit'];

//   ngOnInit(): void {
//     // Set default date range (last 30 days)
//     const today = new Date();
//     const thirtyDaysAgo = new Date();
//     thirtyDaysAgo.setDate(today.getDate() - 30);

//     this.dateForm.patchValue({
//       from: thirtyDaysAgo,
//       to: today
//     });
//   }

//   loadReport(): void {
//     if (this.dateForm.invalid) {
//       this.snackBar.open('يرجى تحديد الفترة الزمنية', 'حسناً', { duration: 3000 });
//       return;
//     }

//     const { from, to } = this.dateForm.value;
//     const fromDate = this.formatDate(from!);
//     const toDate = this.formatDate(to!);

//     this.loading.set(true);

//     this.reportService.getPartnerProfits(fromDate, toDate).subscribe({
//       next: (response: any) => {
//         console.log('Profit report response:', response.data);
//         this.report.set(response.data);
//         this.loading.set(false);

//         // ✅ Reset vehicle filter when new report loads
//         this.selectedVehicleId.set(null);
//       },
//       error: (error) => {
//         this.snackBar.open('فشل تحميل التقرير', 'حسناً', { duration: 3000 });
//         this.loading.set(false);
//         console.error('Error loading profit report:', error);
//       }
//     });
//   }

//   // ✅ COPY from DailyReport: Calculate per-vehicle summaries
//   private calculateVehicleProfitSummaries(report: IProfitReport): VehicleProfitSummary[] {
//     if (!report.vehicles || report.vehicles.length === 0) return [];

//     return report.vehicles.map(vehicle => {
//       // Filter data by vehicle
//       const vehiclePartnerProfits = (report.partner_totals || [])
//         .filter(p => p.vehicle_id === vehicle.id || !p.vehicle_id);
//       const vehicleDailyDist = (report.daily_distributions || [])
//         .filter(d => d.vehicle_id === vehicle.id || !d.vehicle_id);

//       // Calculate totals from daily distributions
//       const total_revenue = this.sumByField(vehicleDailyDist, 'total_revenue');
//       const total_purchases = this.sumByField(vehicleDailyDist, 'total_purchases');
//       const total_losses = this.sumByField(vehicleDailyDist, 'total_losses');
//       const total_costs = this.sumByField(vehicleDailyDist, 'total_costs');
//       const vehicle_costs = this.sumByField(vehicleDailyDist, 'vehicle_costs');
//       const net_profit = this.sumByField(vehicleDailyDist, 'net_profit');

//       return {
//         vehicle,
//         total_revenue,
//         total_purchases,
//         total_losses,
//         total_costs,
//         vehicle_costs,
//         net_profit,
//         partner_profits: vehiclePartnerProfits,
//         daily_distributions: vehicleDailyDist
//       };
//     });
//   }

//   // ✅ COPY from DailyReport: Helper to sum array by field
//   private sumByField(items: any[], field: string): number {
//     return items.reduce((sum, item) => sum + (item[field] || 0), 0);
//   }

//   // ✅ COPY from DailyReport: Get vehicle name by ID
//   getVehicleName(vehicleId: number | null | undefined): string {
//     if (!vehicleId) return 'مشترك';
//     const vehicle = this.vehicles().find(v => v.id === vehicleId);
//     return vehicle ? vehicle.name : '-';
//   }

//   // ✅ COPY from DailyReport: Handle vehicle filter change
//   onVehicleFilterChange(vehicleId: number | null): void {
//     this.selectedVehicleId.set(vehicleId);
//   }

//   private formatDate(date: Date): string {
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const day = String(date.getDate()).padStart(2, '0');
//     return `${year}-${month}-${day}`;
//   }
// }
/**
 * =========================
 * PROFIT REPORT COMPONENT
 * =========================
 * Main component for displaying profit analysis reports
 */

// import { Component, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
// import { ProfitReportService } from '../../../../core/services/profitReport.service';
// import {
//   ProfitAnalysisReport,
//   ProfitSummaryReport,
//   ProfitLeakageReport
// } from '../../../../core/models/index';

// type ReportType = 'analysis' | 'summary' | 'leakage' | null;

// @Component({
//   selector: 'app-profit-report',
//     imports: [ReactiveFormsModule],
//   templateUrl: './profit-report.html',
//   styleUrls: ['./profit-report.css'],
//   changeDetection: ChangeDetectionStrategy.OnPush
// })
// export class ProfitReport {
//   private readonly fb = inject(FormBuilder);
//   private readonly profitService = inject(ProfitReportService);

//   // Form
//   dateForm: FormGroup;

//   // State signals
//   loading = signal<boolean>(false);
//   error = signal<string | null>(null);
//   reportType = signal<ReportType>(null);

//   // Report data signals
//   analysisReport = signal<ProfitAnalysisReport | null>(null);
//   summaryReport = signal<ProfitSummaryReport | null>(null);
//   leakageReport = signal<ProfitLeakageReport | null>(null);

//   // Computed values
//   hasReport = computed(() =>
//     this.analysisReport() !== null ||
//     this.summaryReport() !== null ||
//     this.leakageReport() !== null
//   );

//   activeTab = signal<string>('composition');

//   constructor() {
//     // Initialize form with current month dates
//     const currentMonth = this.profitService.getCurrentMonth();

//     this.dateForm = this.fb.group({
//       from: [currentMonth.from, [Validators.required]],
//       to: [currentMonth.to, [Validators.required]]
//     });
//   }

//   /**
//    * Load quick date ranges
//    */
//   setLastWeek(): void {
//     const range = this.profitService.getLastNDays(7);
//     this.dateForm.patchValue(range);
//   }

//   setLastMonth(): void {
//     const range = this.profitService.getLastNDays(30);
//     this.dateForm.patchValue(range);
//   }

//   setCurrentMonth(): void {
//     const range = this.profitService.getCurrentMonth();
//     this.dateForm.patchValue(range);
//   }

//   setPreviousMonth(): void {
//     const range = this.profitService.getPreviousMonth();
//     this.dateForm.patchValue(range);
//   }

//   /**
//    * Generate full profit analysis report
//    */
//   generateAnalysis(): void {
//     if (!this.validateForm()) return;

//     const { from, to } = this.dateForm.value;

//     this.loading.set(true);
//     this.error.set(null);
//     this.reportType.set('analysis');

//     this.profitService.getProfitAnalysis(from, to).subscribe({
//       next: (report) => {
//         console.log(report);
//         this.analysisReport.set(report);
//         this.summaryReport.set(null);
//         this.leakageReport.set(null);
//         this.loading.set(false);
//         this.activeTab.set('composition');
//       },
//       error: (err) => {
//         this.error.set(err.message);
//         this.loading.set(false);
//         this.analysisReport.set(null);
//       }
//     });
//   }

//   /**
//    * Generate profit summary (lightweight)
//    */
//   generateSummary(): void {
//     if (!this.validateForm()) return;

//     const { from, to } = this.dateForm.value;

//     this.loading.set(true);
//     this.error.set(null);
//     this.reportType.set('summary');

//     this.profitService.getProfitSummary(from, to).subscribe({
//       next: (report) => {
// console.log(report);


//         this.summaryReport.set(report);
//         this.analysisReport.set(null);
//         this.leakageReport.set(null);
//         this.loading.set(false);
//       },
//       error: (err) => {
//         this.error.set(err.message);
//         this.loading.set(false);
//         this.summaryReport.set(null);
//       }
//     });
//   }

//   /**
//    * Generate profit leakage analysis
//    */
//   generateLeakage(): void {
//     if (!this.validateForm()) return;

//     const { from, to } = this.dateForm.value;

//     this.loading.set(true);
//     this.error.set(null);
//     this.reportType.set('leakage');

//     this.profitService.getProfitLeakage(from, to).subscribe({
//       next: (report) => {
//         this.leakageReport.set(report);
//         this.analysisReport.set(null);
//         this.summaryReport.set(null);
//         this.loading.set(false);
//       },
//       error: (err) => {
//         this.error.set(err.message);
//         this.loading.set(false);
//         this.leakageReport.set(null);
//       }
//     });
//   }

//   /**
//    * Clear all reports
//    */
//   clearReports(): void {
//     this.analysisReport.set(null);
//     this.summaryReport.set(null);
//     this.leakageReport.set(null);
//     this.error.set(null);
//     this.reportType.set(null);
//   }

//   /**
//    * Validate form and date range
//    */
//   private validateForm(): boolean {
//     if (this.dateForm.invalid) {
//       this.error.set('الرجاء إدخال تواريخ صحيحة');
//       return false;
//     }

//     const { from, to } = this.dateForm.value;
//     const validationError = this.profitService.validateDateRange(from, to);

//     if (validationError) {
//       this.error.set(validationError);
//       return false;
//     }

//     return true;
//   }

//   /**
//    * Switch active tab
//    */
//   switchTab(tab: string): void {
//     this.activeTab.set(tab);
//   }

//   /**
//    * Get health color class
//    */
//   getHealthColorClass(health: string): string {
//     const colorMap: Record<string, string> = {
//       'EXCELLENT': 'صحه ممتاز',
//       'GOOD': 'صحه جيد',
//       'FAIR': 'صحه مقبول',
//       'POOR':  ' صحه ضعيف'
//     };
//     return colorMap[health] || ' صحه جيد';
//   }

//   /**
//    * Get trend icon
//    */
//   getTrendIcon(trend: string): string {
//     const iconMap: Record<string, string> = {
//       'IMPROVING': '📈',
//       'DECLINING': '📉',
//       'STABLE': '➡️',
//       'NO_COMPARISON': '➖'
//     };
//     return iconMap[trend] || '➖';
//   }

//   /**
//    * Get priority badge class
//    */
//   getPriorityClass(priority: string): string {
//     const classMap: Record<string, string> = {
//       'HIGH': 'اولويه عاليه',
//       'MEDIUM': 'اولويه متوسطه',
//       'LOW': 'اولويه ضعيفه'
//     };
//     return classMap[priority] ||  'اولويه متوسطه';
//   }

//   /**
//    * Get risk level class
//    */
//   getRiskClass(risk: string): string {
//     const classMap: Record<string, string> = {
//       'HIGH': 'مخاطره مرتفعه',
//       'MEDIUM': 'مخاطره متوسطه',
//       'LOW': 'مخاطره ضعيفه'
//     };
//     return classMap[risk] || 'risk-medium';
//   }

//   /**
//    * Format number with thousands separator
//    */
//   formatNumber(num: number | undefined | null): string {
//     if (num === null || num === undefined) return '0';
//     return num.toLocaleString('en-US', {
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2
//     });
//   }

//   /**
//    * Format percentage
//    */
//   formatPercentage(num: number | undefined | null): string {
//     if (num === null || num === undefined) return '0%';
//     return `${num.toFixed(2)}%`;
//   }

//   /**
//    * Export report to JSON (for debugging)
//    */
//   exportToJSON(): void {
//     const report = this.analysisReport() || this.summaryReport() || this.leakageReport();
//     if (report) {
//       const json = JSON.stringify(report, null, 2);
//       const blob = new Blob([json], { type: 'application/json' });
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = `profit-report-${Date.now()}.json`;
//       a.click();
//       window.URL.revokeObjectURL(url);
//     }
//   }

//   getProfitComponent(key: 'trading_margin_profit' | 'volume_leverage_profit' | 'loss_erosion' | 'cost_efficiency_impact') {
//   return this.analysisReport()?.['1_profit_composition_analysis']?.components[key];
// }
// profitComponents = [
//   { key: 'trading_margin_profit', label: 'ربح الهامش التجاري', icon: '💰' },
//   { key: 'volume_leverage_profit', label: 'ربح الحجم', icon: '📊' },
//   { key: 'loss_erosion', label: 'خسائر النقل', icon: '📉' },
//   { key: 'cost_efficiency_impact', label: 'أثر كفاءة التكاليف', icon: '⚙️' }
// ] as const;

// }
// =========================
// File: frontend/src/app/features/reports/profit-report/profit-report.component.ts
// الوصف: Component لعرض تحليل الأرباح المتقدم
// =========================

// =========================
// File: frontend/src/app/components/profit-report-enhanced/profit-report-enhanced.component.ts
// الوصف: Component مدمج لتحليل الأرباح المتقدم مع توزيع الأرباح على الشركاء
// =========================

// import { Component, signal, computed, inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
// import { ProfitReportService } from '../../../../core/services/profitReport.service';'../../../../core/services/profit-distribution.service';
// import {
//   ProfitAnalysisReport,
//   ProfitLeakageReport,
//   ProfitSummaryReport
//   ,PartnerProfitSummary,
//   DistributionSummary,
//   IndividualPartnerProfit
// } from '../../../../core/models';

// import * as XLSX from 'xlsx';
// import {  MatDatepickerModule } from '@angular/material/datepicker';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatNativeDateModule } from '@angular/material/core';

// type ReportType = 'analysis' | 'summary' | 'leakage' | 'partners' | null;

// @Component({
//   selector: 'app-profit-report',
//   imports: [CommonModule, ReactiveFormsModule,MatDatepickerModule,
//      MatFormFieldModule,
//     MatInputModule,
//     MatDatepickerModule,
//     MatNativeDateModule
//   ],
//   templateUrl: './profit-report.html',
//   styleUrls: ['./profit-report.css'],
//   changeDetection: ChangeDetectionStrategy.OnPush
// })
// export class ProfitReport implements OnInit {
//   private readonly fb = inject(FormBuilder);
//   private readonly profitService = inject(ProfitReportService);

//   // Form
//   dateForm!: FormGroup;

//   // State signals
//   loading = signal<boolean>(false);
//   error = signal<string | null>(null);
//   reportType = signal<ReportType>(null);

//   // Report data signals
//   analysisReport = signal<ProfitAnalysisReport | null>(null);
//   summaryReport = signal<ProfitSummaryReport | null>(null);
//   leakageReport = signal<ProfitLeakageReport | null>(null);

//   // Partner distribution signals
//   partnerDistribution = signal<{
//     partners: PartnerProfitSummary[];
//     summary: DistributionSummary;
//   } | null>(null);
//   selectedPartner = signal<PartnerProfitSummary | null>(null);
//   showPartnerDetails = signal<boolean>(false);

//   // Computed values
//   hasReport = computed(() =>
//     this.analysisReport() !== null ||
//     this.summaryReport() !== null ||
//     this.leakageReport() !== null ||
//     this.partnerDistribution() !== null
//   );

//   activeTab = signal<string>('composition');

//   // Component categories for profit composition
//   profitComponents = [
//     { key: 'trading_margin_profit', label: 'ربح الهامش التجاري', icon: '💰' },
//     { key: 'volume_leverage_profit', label: 'ربح الحجم', icon: '📊' },
//     { key: 'loss_erosion', label: 'خسائر النقل', icon: '📉' },
//     { key: 'cost_efficiency_impact', label: 'أثر كفاءة التكاليف', icon: '⚙️' }
//   ] as const;

//   ngOnInit(): void {
//     // Initialize form with current month dates
//     const currentMonth = this.profitService.getCurrentMonth();

//     this.dateForm = this.fb.group({
//       from: [currentMonth.from, [Validators.required]],
//       to: [currentMonth.to, [Validators.required]]
//     });
//   }

//   /**
//    * Load quick date ranges
//    */
//   setLastWeek(): void {
//     const range = this.profitService.getLastNDays(7);
//     this.dateForm.patchValue(range);
//   }

//   setLastMonth(): void {
//     const range = this.profitService.getLastNDays(30);
//     this.dateForm.patchValue(range);
//   }

//   setCurrentMonth(): void {
//     const range = this.profitService.getCurrentMonth();
//     this.dateForm.patchValue(range);
//   }

//   setPreviousMonth(): void {
//     const range = this.profitService.getPreviousMonth();
//     this.dateForm.patchValue(range);
//   }

//   /**
//    * Generate full profit analysis report
//    */
//   generateAnalysis(): void {
//     if (!this.validateForm()) return;

//     const { from, to } = this.dateForm.value;

//     this.loading.set(true);
//     this.error.set(null);
//     this.reportType.set('analysis');

//     this.profitService.getProfitAnalysis(from, to).subscribe({
//       next: (report) => {
//         console.log('Analysis Report:', report);
//         this.analysisReport.set(report);
//         this.summaryReport.set(null);
//         this.leakageReport.set(null);
//         this.partnerDistribution.set(null);
//         this.loading.set(false);
//         this.activeTab.set('composition');
//       },
//       error: (err) => {
//         this.error.set(err.message || 'حدث خطأ في تحميل التقرير');
//         this.loading.set(false);
//         this.analysisReport.set(null);
//       }
//     });
//   }

//   /**
//    * Generate profit summary (lightweight)
//    */
//   generateSummary(): void {
//     if (!this.validateForm()) return;

//     const { from, to } = this.dateForm.value;

//     this.loading.set(true);
//     this.error.set(null);
//     this.reportType.set('summary');

//     this.profitService.getProfitSummary(from, to).subscribe({
//       next: (report) => {
//         console.log('Summary Report:', report);
//         this.summaryReport.set(report);
//         this.analysisReport.set(null);
//         this.leakageReport.set(null);
//         this.partnerDistribution.set(null);
//         this.loading.set(false);
//       },
//       error: (err) => {
//         this.error.set(err.message || 'حدث خطأ في تحميل الملخص');
//         this.loading.set(false);
//         this.summaryReport.set(null);
//       }
//     });
//   }

//   /**
//    * Generate profit leakage analysis
//    */
//   generateLeakage(): void {
//     if (!this.validateForm()) return;

//     const { from, to } = this.dateForm.value;

//     this.loading.set(true);
//     this.error.set(null);
//     this.reportType.set('leakage');

//     this.profitService.getProfitLeakage(from, to).subscribe({
//       next: (report) => {
//         console.log('Leakage Report:', report);
//         this.leakageReport.set(report);
//         this.analysisReport.set(null);
//         this.summaryReport.set(null);
//         this.partnerDistribution.set(null);
//         this.loading.set(false);
//       },
//       error: (err) => {
//         this.error.set(err.message || 'حدث خطأ في تحميل تحليل التسرب');
//         this.loading.set(false);
//         this.leakageReport.set(null);
//       }
//     });
//   }

//   /**
//    * Load partner profit distribution
//    */
//   loadPartnerDistribution(): void {
//     if (!this.validateForm()) return;

//     const { from, to } = this.dateForm.value;

//     this.loading.set(true);
//     this.error.set(null);
//     this.reportType.set('partners');

//     // Load both partners details and summary in parallel
//     Promise.all([
//       this.profitService.getPartnersProfitDetails(from, to).toPromise(),
//       this.profitService.getDistributionSummary(from, to).toPromise()
//     ])
//     .then(([partnersResponse, summaryResponse]) => {
//       if (partnersResponse?.success && partnersResponse.data &&
//           summaryResponse?.success && summaryResponse.data) {

//         this.partnerDistribution.set({
//           partners: partnersResponse.data.partners || [],
//           summary: summaryResponse.data
//         });

//         // Clear other reports
//         this.analysisReport.set(null);
//         this.summaryReport.set(null);
//         this.leakageReport.set(null);
//       } else {
//         this.error.set('فشل في تحميل بيانات الشركاء');
//       }

//       this.loading.set(false);
//     })
//     .catch(error => {
//       console.error('Error loading partner distribution:', error);
//       this.error.set(error.message || 'حدث خطأ في تحميل بيانات الشركاء');
//       this.loading.set(false);
//       this.partnerDistribution.set(null);
//     });
//   }

//   /**
//    * View partner details
//    */
//   viewPartnerDetails(partner: PartnerProfitSummary): void {
//     const { from, to } = this.dateForm.value;

//     this.loading.set(true);

//     this.profitService.getIndividualPartnerProfit(
//       partner.partner_id,
//       from,
//       to
//     ).subscribe({
//       next: (response) => {
//         if (response.success && response.data) {
//           // Merge detailed data with partner
//           const enrichedPartner = {
//             ...partner,
//             details: response.data
//           };

//           this.selectedPartner.set(enrichedPartner);
//           this.showPartnerDetails.set(true);
//         }
//         this.loading.set(false);
//       },
//       error: (err) => {
//         console.error('Error loading partner details:', err);
//         this.error.set(err.message || 'حدث خطأ في تحميل تفاصيل الشريك');
//         this.loading.set(false);
//       }
//     });
//   }

//   /**
//    * Close partner details modal
//    */
//   closePartnerDetails(): void {
//     this.showPartnerDetails.set(false);
//     this.selectedPartner.set(null);
//   }

//   /**
//    * Export partner data to Excel
//    */
//   exportPartnerDataToExcel(): void {
//     const distribution = this.partnerDistribution();
//     if (!distribution || !distribution.partners.length) {
//       this.error.set('لا توجد بيانات لتصديرها');
//       return;
//     }

//     try {
//       // Prepare data for Excel
//       const excelData = distribution.partners.map(partner => ({
//         'اسم الشريك': partner.partner_name,
//         'مبلغ الاستثمار': partner.investment_amount,
//         'نسبة الاستثمار %': partner.investment_percentage,
//         'إجمالي الربح النهائي': partner.total_final_profit,
//         'متوسط الربح اليومي': partner.avg_daily_profit,
//         'عدد أيام المشاركة بالمركبة': partner.days_as_vehicle_partner,
//         'عدد أيام عدم المشاركة': partner.days_as_non_vehicle_partner,
//         'نسبة المشاركة في المركبات %': partner.vehicle_participation_rate,
//         'عدد المركبات المملوكة': partner.vehicles_owned_count,
//         'التقييم': partner.performance_rating,
//         'نسبة الربح للاستثمار': partner.profit_vs_investment_ratio
//       }));

//       // Create worksheet
//       const ws = XLSX.utils.json_to_sheet(excelData);

//       // Create workbook
//       const wb = XLSX.utils.book_new();
//       XLSX.utils.book_append_sheet(wb, ws, 'توزيع الأرباح');

//       // Add summary sheet
//       const summaryData = [
//         { 'البيان': 'إجمالي الشركاء', 'القيمة': distribution.summary.overview.total_partners },
//         { 'البيان': 'إجمالي الأرباح الموزعة', 'القيمة': distribution.summary.overview.total_profit_distributed },
//         { 'البيان': 'عدد العمليات', 'القيمة': distribution.summary.overview.total_operations },
//         { 'البيان': 'متوسط العائد على الاستثمار %', 'القيمة': distribution.summary.roi_analysis.average_roi * 100 }
//       ];
//       const wsSummary = XLSX.utils.json_to_sheet(summaryData);
//       XLSX.utils.book_append_sheet(wb, wsSummary, 'الملخص');

//       // Generate file name with date
//       const { from, to } = this.dateForm.value;
//       const fileName = `توزيع_الأرباح_${from}_to_${to}.xlsx`;

//       // Save file
//       XLSX.writeFile(wb, fileName);

//       console.log('Excel file exported successfully');
//     } catch (error) {
//       console.error('Error exporting to Excel:', error);
//       this.error.set('حدث خطأ أثناء تصدير البيانات');
//     }
//   }

//   /**
//    * Print partner report
//    */
//   printPartnerReport(): void {
//     window.print();
//   }

//   /**
//    * Clear all reports
//    */
//   clearReports(): void {
//     this.analysisReport.set(null);
//     this.summaryReport.set(null);
//     this.leakageReport.set(null);
//     this.partnerDistribution.set(null);
//     this.error.set(null);
//     this.reportType.set(null);
//     this.showPartnerDetails.set(false);
//     this.selectedPartner.set(null);
//   }

//   /**
//    * Validate form and date range
//    */
//   private validateForm(): boolean {
//     if (this.dateForm.invalid) {
//       this.error.set('الرجاء إدخال تواريخ صحيحة');
//       return false;
//     }

//     const { from, to } = this.dateForm.value;
//     const validationError = this.profitService.validateDateRange(from, to);

//     if (validationError) {
//       this.error.set(validationError);
//       return false;
//     }

//     return true;
//   }

//   /**
//    * Switch active tab
//    */
//   switchTab(tab: string): void {
//     this.activeTab.set(tab);
//   }

//   /**
//    * Get profit component by key
//    */
//   getProfitComponent(key: 'trading_margin_profit' | 'volume_leverage_profit' | 'loss_erosion' | 'cost_efficiency_impact') {
//     return this.analysisReport()?.['1_profit_composition_analysis']?.components[key];
//   }

//   /**
//    * Get health color class
//    */
//   getHealthColorClass(health: string): string {
//     const colorMap: Record<string, string> = {
//       'EXCELLENT': 'health-excellent',
//       'GOOD': 'health-good',
//       'FAIR': 'health-fair',
//       'POOR': 'health-poor',
//       'ممتاز': 'health-excellent',
//       'جيد': 'health-good',
//       'مقبول': 'health-fair',
//       'ضعيف': 'health-poor'
//     };
//     return colorMap[health] || 'health-good';
//   }

//   /**
//    * Get trend icon
//    */
//   getTrendIcon(trend: string): string {
//     const iconMap: Record<string, string> = {
//       'IMPROVING': '📈',
//       'DECLINING': '📉',
//       'STABLE': '➡️',
//       'NO_COMPARISON': '➖'
//     };
//     return iconMap[trend] || '➖';
//   }

//   /**
//    * Get priority badge class
//    */
//   getPriorityClass(priority: string): string {
//     const classMap: Record<string, string> = {
//       'HIGH': 'priority-high',
//       'MEDIUM': 'priority-medium',
//       'LOW': 'priority-low',
//       'عالية': 'priority-high',
//       'متوسطة': 'priority-medium',
//       'منخفضة': 'priority-low'
//     };
//     return classMap[priority] || 'priority-medium';
//   }

//   /**
//    * Get risk level class
//    */
//   getRiskClass(risk: string): string {
//     const classMap: Record<string, string> = {
//       'HIGH': 'risk-high',
//       'MEDIUM': 'risk-medium',
//       'LOW': 'risk-low',
//       'عالي': 'risk-high',
//       'متوسط': 'risk-medium',
//       'منخفض': 'risk-low'
//     };
//     return classMap[risk] || 'risk-medium';
//   }

//   /**
//    * Get performance badge class
//    */
//   getPerformanceBadgeClass(rating: string): string {
//     const classMap: Record<string, string> = {
//       'ممتاز': 'performance-excellent',
//       'جيد جداً': 'performance-very-good',
//       'جيد': 'performance-good',
//       'مقبول': 'performance-fair',
//       'ضعيف': 'performance-poor'
//     };
//     return classMap[rating] || 'performance-good';
//   }

//   /**
//    * Get insight icon based on type
//    */
//   getInsightIcon(type: string): string {
//     const iconMap: Record<string, string> = {
//       'vehicle_participation': '🚗',
//       'roi': '💹',
//       'recommendation': '💡',
//       'warning': '⚠️',
//       'success': '✅',
//       'info': 'ℹ️'
//     };
//     return iconMap[type] || '💡';
//   }

//   /**
//    * Format number with thousands separator
//    */
//   formatNumber(num: number | undefined | null, decimals: number = 2): string {
//     if (num === null || num === undefined) return '0.00';
//     return num.toLocaleString('ar-EG', {
//       minimumFractionDigits: decimals,
//       maximumFractionDigits: decimals
//     });
//   }

//   /**
//    * Format percentage
//    */
//   formatPercentage(num: number | undefined | null): string {
//     if (num === null || num === undefined) return '0.00%';
//     return `${num.toFixed(2)}%`;
//   }

//   /**
//    * Export report to JSON (for debugging)
//    */
//   exportToJSON(): void {
//     const report = this.analysisReport() ||
//                    this.summaryReport() ||
//                    this.leakageReport() ||
//                    this.partnerDistribution();

//     if (report) {
//       const json = JSON.stringify(report, null, 2);
//       const blob = new Blob([json], { type: 'application/json' });
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;

//       const { from, to } = this.dateForm.value;
//       const reportTypeName = this.reportType() || 'report';
//       a.download = `profit-${reportTypeName}-${from}-to-${to}.json`;

//       a.click();
//       window.URL.revokeObjectURL(url);
//     }
//   }
// }
import { Component, signal, computed, inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfitReportService } from '../../../../core/services/profitReport.service';
import {
  ProfitAnalysisReport,
  ProfitLeakageReport,
  ProfitSummaryReport,
  PartnerProfitSummary,
  DistributionSummary,
  IndividualPartnerProfit
} from '../../../../core/models';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ReportUtilitiesService } from '../../../../core/services/ReportUtilitiesService';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

type ReportType = 'analysis' | 'summary' | 'leakage' | 'partners' | null;

@Component({
  selector: 'app-profit-report',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatTabsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './profit-report.html',
  styleUrls: ['./profit-report.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfitReport implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly profitService = inject(ProfitReportService);
  private readonly utils = inject(ReportUtilitiesService);

  // Form
  dateForm!: FormGroup;

  // State signals
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  reportType = signal<ReportType>(null);

  // Report data signals
  analysisReport = signal<ProfitAnalysisReport | null>(null);
  summaryReport = signal<ProfitSummaryReport | null>(null);
  leakageReport = signal<ProfitLeakageReport | null>(null);

  // Partner distribution signals
  partnerDistribution = signal<{
    partners: PartnerProfitSummary[];
    summary: DistributionSummary;
  } | null>(null);
  selectedPartner = signal<PartnerProfitSummary | null>(null);
  showPartnerDetails = signal<boolean>(false);

  // Computed values
  hasReport = computed(() =>
    this.analysisReport() !== null ||
    this.summaryReport() !== null ||
    this.leakageReport() !== null ||
    this.partnerDistribution() !== null
  );

  activeTab = signal<string>('composition');
  activeTabIndex = signal<number>(0);

  // Component categories for profit composition
  profitComponents = [
    { key: 'trading_margin_profit', label: 'ربح الهامش التجاري', icon: '💰' },
    { key: 'volume_leverage_profit', label: 'ربح الحجم', icon: '📊' },
    { key: 'loss_erosion', label: 'خسائر النقل', icon: '📉' },
    { key: 'cost_efficiency_impact', label: 'أثر كفاءة التكاليف', icon: '⚙️' }
  ] as const;

 formatCurrency = (amount: number | undefined | null) => this.utils.formatCurrency(amount);
formatNumber = (num: number | undefined | null, decimals?: number) => this.utils.formatNumber(num, decimals);
formatPercentage = (value: number | undefined | null, decimals?: number) => this.utils.formatPercentage(value, decimals);
formatDateTime = (date: string | Date | undefined | null) => this.utils.formatDateTime(date);

  ngOnInit(): void {
    // Initialize form with current month dates
    const currentMonth = this.utils.getCurrentMonth();

    this.dateForm = this.fb.group({
      from: [currentMonth.from, [Validators.required]],
      to: [currentMonth.to, [Validators.required]]
    });
  }

  /**
   * ✅ Load quick date ranges using shared service
   */
  setLastWeek(): void {
    const range = this.utils.getLastNDays(7);
    this.dateForm.patchValue(range);
  }

  setLastMonth(): void {
    const range = this.utils.getLastNDays(30);
    this.dateForm.patchValue(range);
  }

  setCurrentMonth(): void {
    const range = this.utils.getCurrentMonth();
    this.dateForm.patchValue(range);
  }

  setPreviousMonth(): void {
    const range = this.utils.getPreviousMonth();
    this.dateForm.patchValue(range);
  }

  /**
   * Generate full profit analysis report
   */
  generateAnalysis(): void {
    if (!this.validateForm()) return;

    const { from, to } = this.dateForm.value;

    // Format dates to YYYY-MM-DD
    const fromDate = this.utils.toISODate(from);
    const toDate = this.utils.toISODate(to);

    this.loading.set(true);
    this.error.set(null);
    this.reportType.set('analysis');

    this.profitService.getProfitAnalysis(fromDate, toDate).subscribe({
      next: (report) => {
        console.log('Analysis Report:', report);
        this.analysisReport.set(report);
        this.summaryReport.set(null);
        this.leakageReport.set(null);
        this.partnerDistribution.set(null);
        this.loading.set(false);
        this.activeTab.set('composition');
        this.activeTabIndex.set(0);
      },
      error: (err) => {
        console.error('Error loading analysis:', err);
        this.error.set(err.message || 'حدث خطأ في تحميل التقرير');
        this.loading.set(false);
        this.analysisReport.set(null);
      }
    });
  }

  /**
   * Generate profit summary (lightweight)
   */
  generateSummary(): void {
    if (!this.validateForm()) return;

    const { from, to } = this.dateForm.value;

    // Format dates to YYYY-MM-DD
    const fromDate = this.utils.toISODate(from);
    const toDate = this.utils.toISODate(to);

    this.loading.set(true);
    this.error.set(null);
    this.reportType.set('summary');

    this.profitService.getProfitSummary(fromDate, toDate).subscribe({
      next: (report) => {
        console.log('Summary Report:', report);
        this.summaryReport.set(report);
        this.analysisReport.set(null);
        this.leakageReport.set(null);
        this.partnerDistribution.set(null);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading summary:', err);
        this.error.set(err.message || 'حدث خطأ في تحميل الملخص');
        this.loading.set(false);
        this.summaryReport.set(null);
      }
    });
  }

  /**
   * Generate profit leakage analysis
   */
  generateLeakage(): void {
    if (!this.validateForm()) return;

    const { from, to } = this.dateForm.value;

    // Format dates to YYYY-MM-DD
    const fromDate = this.utils.toISODate(from);
    const toDate = this.utils.toISODate(to);

    this.loading.set(true);
    this.error.set(null);
    this.reportType.set('leakage');

    this.profitService.getProfitLeakage(fromDate, toDate).subscribe({
      next: (report) => {
        console.log('Leakage Report:', report);
        this.leakageReport.set(report);
        this.analysisReport.set(null);
        this.summaryReport.set(null);
        this.partnerDistribution.set(null);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading leakage:', err);
        this.error.set(err.message || 'حدث خطأ في تحميل تحليل التسرب');
        this.loading.set(false);
        this.leakageReport.set(null);
      }
    });
  }

  /**
   * Load partner profit distribution
   */
  loadPartnerDistribution(): void {
    if (!this.validateForm()) return;

    const { from, to } = this.dateForm.value;

    // Format dates to YYYY-MM-DD
    const fromDate = this.utils.toISODate(from);
    const toDate = this.utils.toISODate(to);

    this.loading.set(true);
    this.error.set(null);
    this.reportType.set('partners');

    // Load both partners details and summary in parallel
    Promise.all([
      this.profitService.getPartnersProfitDetails(fromDate, toDate).toPromise(),
      this.profitService.getDistributionSummary(fromDate, toDate).toPromise()
    ])
    .then(([partnersResponse, summaryResponse]) => {
      if (partnersResponse?.success && partnersResponse.data &&
          summaryResponse?.success && summaryResponse.data) {

        this.partnerDistribution.set({
          partners: partnersResponse.data.partners || [],
          summary: summaryResponse.data
        });

        // Clear other reports
        this.analysisReport.set(null);
        this.summaryReport.set(null);
        this.leakageReport.set(null);
      } else {
        this.error.set('فشل في تحميل بيانات الشركاء');
      }

      this.loading.set(false);
    })
    .catch(error => {
      console.error('Error loading partner distribution:', error);
      this.error.set(error.message || 'حدث خطأ في تحميل بيانات الشركاء');
      this.loading.set(false);
      this.partnerDistribution.set(null);
    });
  }

  /**
   * View partner details
   */
  viewPartnerDetails(partner: PartnerProfitSummary): void {
    const { from, to } = this.dateForm.value;

    // Format dates to YYYY-MM-DD
    const fromDate = this.utils.toISODate(from);
    const toDate = this.utils.toISODate(to);

    this.loading.set(true);

    this.profitService.getIndividualPartnerProfit(
      partner.partner_id,
      fromDate,
      toDate
    ).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Merge detailed data with partner
          const enrichedPartner = {
            ...partner,
            details: response.data
          };

          this.selectedPartner.set(enrichedPartner);
          this.showPartnerDetails.set(true);
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading partner details:', err);
        this.error.set(err.message || 'حدث خطأ في تحميل تفاصيل الشريك');
        this.loading.set(false);
      }
    });
  }

  /**
   * Close partner details modal
   */
  closePartnerDetails(): void {
    this.showPartnerDetails.set(false);
    this.selectedPartner.set(null);
  }

  /**
   * ✅ Export partner data to Excel using shared service
   */
  exportToExcel(): void {
    const distribution = this.partnerDistribution();
    if (!distribution || !distribution.partners.length) {
      this.error.set('لا توجد بيانات لتصديرها');
      return;
    }

    try {
      // Prepare detailed partner data
      const data = distribution.partners.map(partner => ({
        'اسم الشريك': partner.partner_name,
        'مبلغ الاستثمار': this.formatCurrency(partner.investment_amount),
        'نسبة الاستثمار %': this.formatPercentage(partner.investment_percentage),
        'إجمالي الربح النهائي': this.formatCurrency(partner.total_final_profit),
        'متوسط الربح اليومي': this.formatCurrency(partner.avg_daily_profit),
        'عدد أيام المشاركة بالمركبة': this.formatNumber(partner.days_as_vehicle_partner),
        'عدد أيام عدم المشاركة': this.formatNumber(partner.days_as_non_vehicle_partner),
        'نسبة المشاركة في المركبات %': this.formatPercentage(partner.vehicle_participation_rate),
        'عدد المركبات المملوكة': this.formatNumber(partner.vehicles_owned_count),
        'التقييم': partner.performance_rating,
        'نسبة الربح للاستثمار': this.formatPercentage(partner.profit_vs_investment_ratio)
      }));

      const { from, to } = this.dateForm.getRawValue();
      const fileName = `تقرير_الأرباح_${this.utils.toISODate(from)}_الى_${this.utils.toISODate(to)}`;

      this.utils.exportToExcel(data, fileName, 'توزيع الأرباح');

      console.log('Excel file exported successfully');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      this.error.set('حدث خطأ أثناء تصدير البيانات');
    }
  }


  /**
   * ✅ Print using shared service
   */
  printReport(): void {
    this.utils.printPage();
  }

  /**
   * Print partner report (legacy support)
   */
  printPartnerReport(): void {
    this.printReport();
  }

  /**
   * Export partner data to Excel (legacy method name)
   */
  exportPartnerDataToExcel(): void {
    this.exportToExcel();
  }

  /**
   * Clear all reports
   */
  clearReports(): void {
    this.analysisReport.set(null);
    this.summaryReport.set(null);
    this.leakageReport.set(null);
    this.partnerDistribution.set(null);
    this.error.set(null);
    this.reportType.set(null);
    this.showPartnerDetails.set(false);
    this.selectedPartner.set(null);
  }

  /**
   * ✅ Validate form using shared service
   */
  private validateForm(): boolean {
    if (this.dateForm.invalid) {
      this.error.set('الرجاء إدخال تواريخ صحيحة');
      return false;
    }

    const { from, to } = this.dateForm.value;
    const validation = this.utils.validateDateRange(from, to);

    if (!validation.valid) {
      this.error.set(validation.error || 'خطأ في التحقق من التواريخ');
      return false;
    }

    return true;
  }

  /**
   * Switch active tab
   */
  switchTab(tab: string): void {
    this.activeTab.set(tab);
  }

  /**
   * Handle tab change event
   */
  onTabChange(index: number): void {
    this.activeTabIndex.set(index);

    // Map tab indices to tab names
    const tabNames = ['composition', 'per_kg', 'leakage', 'stability', 'efficiency', 'recommendations'];
    if (index >= 0 && index < tabNames.length) {
      this.activeTab.set(tabNames[index]);
    }
  }

  /**
   * Get profit component by key
   */
  getProfitComponent(key: 'trading_margin_profit' | 'volume_leverage_profit' | 'loss_erosion' | 'cost_efficiency_impact') {
    return this.analysisReport()?.['1_profit_composition_analysis']?.components[key];
  }

  /**
   * Get health color class
   */
  getHealthColorClass(health: string): string {
    const colorMap: Record<string, string> = {
      'EXCELLENT': 'health-excellent',
      'GOOD': 'health-good',
      'FAIR': 'health-fair',
      'POOR': 'health-poor',
      'ممتاز': 'health-excellent',
      'جيد': 'health-good',
      'مقبول': 'health-fair',
      'ضعيف': 'health-poor'
    };
    return colorMap[health] || 'health-good';
  }

  /**
   * Get trend icon
   */
  getTrendIcon(trend: string): string {
    const iconMap: Record<string, string> = {
      'IMPROVING': '📈',
      'DECLINING': '📉',
      'STABLE': '➡️',
      'NO_COMPARISON': '➖'
    };
    return iconMap[trend] || '➖';
  }

  /**
   * Get priority badge class
   */
  getPriorityClass(priority: string): string {
    const classMap: Record<string, string> = {
      'HIGH': 'priority-high',
      'MEDIUM': 'priority-medium',
      'LOW': 'priority-low',
      'عالية': 'priority-high',
      'متوسطة': 'priority-medium',
      'منخفضة': 'priority-low'
    };
    return classMap[priority] || 'priority-medium';
  }

  /**
   * Get risk level class
   */
  getRiskClass(risk: string): string {
    const classMap: Record<string, string> = {
      'HIGH': 'risk-high',
      'MEDIUM': 'risk-medium',
      'LOW': 'risk-low',
      'عالي': 'risk-high',
      'متوسط': 'risk-medium',
      'منخفض': 'risk-low'
    };
    return classMap[risk] || 'risk-medium';
  }

  /**
   * Get performance badge class
   */
  getPerformanceBadgeClass(rating: string): string {
    const classMap: Record<string, string> = {
      'ممتاز': 'performance-excellent',
      'جيد جداً': 'performance-very-good',
      'جيد': 'performance-good',
      'مقبول': 'performance-fair',
      'ضعيف': 'performance-poor'
    };
    return classMap[rating] || 'performance-good';
  }

  /**
   * Get insight icon based on type
   */
  getInsightIcon(type: string): string {
    const iconMap: Record<string, string> = {
      'vehicle_participation': '🚗',
      'roi': '💹',
      'recommendation': '💡',
      'warning': '⚠️',
      'success': '✅',
      'info': 'ℹ️'
    };
    return iconMap[type] || '💡';
  }

  /**
   * Export report to JSON (for debugging)
   */
  exportToJSON(): void {
    const report = this.analysisReport() ||
                   this.summaryReport() ||
                   this.leakageReport() ||
                   this.partnerDistribution();

    if (report) {
      const json = JSON.stringify(report, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      const { from, to } = this.dateForm.value;
      const reportTypeName = this.reportType() || 'report';
      const fromFormatted = this.utils.toISODate(from);
      const toFormatted = this.utils.toISODate(to);
      a.download = `profit-${reportTypeName}-${fromFormatted}-to-${toFormatted}.json`;

      a.click();
      window.URL.revokeObjectURL(url);

      console.log('JSON file exported successfully');
    }
  }
}
