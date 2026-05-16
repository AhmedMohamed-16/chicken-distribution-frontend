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
// import { MatTabsModule } from '@angular/material/tabs';
// import { ReportService } from '../../../../core/services/report.service';
// import {
//   DailyReport as Report,
//   Vehicle,
//   FarmTransaction,
//   SaleTransaction,
//   DailyCost,
//   TransportLoss
// } from '../../../../core/models';

// // ✅ Define vehicle summary interface
// interface VehicleSummary {
//   vehicle: Vehicle;
//   total_purchases: number;
//   total_sales: number;
//   total_costs: number;
//   total_losses: number;
//   net_profit: number;
//   farm_transactions: FarmTransaction[];
//   sales: SaleTransaction[];
//   costs: DailyCost[];
//   losses: TransportLoss[];
// }

// @Component({
//   selector: 'app-daily-report',
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
//     MatTabsModule,
//     MatSnackBarModule

// ],
//   templateUrl: './daily-report.html',
//   styleUrl: './daily-report.css',
// })
// export class DailyReport implements OnInit {
//   private fb = inject(FormBuilder);
//   private reportService = inject(ReportService);
//   private snackBar = inject(MatSnackBar);

//   loading = signal(false);
//   report = signal<Report | null>(null);

//   // ✅ NEW: Selected vehicle filter
//   selectedVehicleId = signal<number | null>(null);

//   // ✅ NEW: Available vehicles from report
//   vehicles = computed(() => {
//     return this.report()?.vehicles || [];
//   });

//   // ✅ NEW: Vehicle summaries
//   vehicleSummaries = computed(() => {
//     const report = this.report();
//     if (!report) return [];

//     return this.calculateVehicleSummaries(report);
//   });

//   // ✅ NEW: Filtered data based on selected vehicle
//   filteredFarmTransactions = computed(() => {
//     const vehicleId = this.selectedVehicleId();
//     const report = this.report();

//     if (!report || !report.farm_transactions) return [];
//     if (!vehicleId) return report.farm_transactions;

//     return report.farm_transactions.filter(tx => tx.vehicle_id === vehicleId);
//   });

//   filteredSales = computed(() => {
//     const vehicleId = this.selectedVehicleId();
//     const report = this.report();

//     if (!report || !report.sales) return [];
//     if (!vehicleId) return report.sales;

//     return report.sales.filter(sale => sale.vehicle_id === vehicleId);
//   });

//   filteredCosts = computed(() => {
//     const vehicleId = this.selectedVehicleId();
//     const report = this.report();

//     if (!report || !report.costs) return [];
//     if (!vehicleId) return report.costs;

//     // ✅ Show vehicle-specific costs OR shared costs (no vehicle_id)
//     return report.costs.filter(cost =>
//       cost.vehicle_id === vehicleId || (!cost.vehicle_id && vehicleId)
//     );
//   });

//   filteredLosses = computed(() => {
//     const vehicleId = this.selectedVehicleId();
//     const report = this.report();

//     if (!report || !report.losses) return [];
//     if (!vehicleId) return report.losses;

//     return report.losses.filter(loss => loss.vehicle_id === vehicleId);
//   });

//   dateForm = this.fb.nonNullable.group({
//     date: [new Date(), Validators.required]
//   });

//   // ✅ UPDATED: Add vehicle column
//   farmColumns = ['vehicle', 'farm', 'chicken_type', 'weight', 'amount'];
//   saleColumns = ['vehicle', 'buyer', 'chicken_type', 'weight', 'amount'];
//   costColumns = ['vehicle', 'category', 'amount', 'notes'];
//   lossColumns = ['vehicle', 'chicken_type', 'weight', 'amount'];

//   ngOnInit(): void {
//     this.loadReport();
//   }

//   loadReport(): void {
//     const date = this.formatDate(this.dateForm.get('date')?.value!);
//     this.loading.set(true);

//     this.reportService.getDailyReport(date).subscribe({
//       next: (data: any) => {
//         console.log('Backend response:', data.data);
//         this.report.set(data.data);
//         this.loading.set(false);

//         // ✅ Reset vehicle filter when new report loads
//         this.selectedVehicleId.set(null);
//       },
//       error: (error) => {
//         this.snackBar.open('فشل تحميل التقرير', 'حسناً', { duration: 3000 });
//         this.loading.set(false);
//         console.error('Error loading report:', error);
//       }
//     });
//   }

//   // ✅ NEW: Calculate per-vehicle summaries
//   private calculateVehicleSummaries(report: Report): VehicleSummary[] {
//     if (!report.vehicles || report.vehicles.length === 0) return [];

//     return report.vehicles.map(vehicle => {
//       // Filter transactions by vehicle
//       const vehicleFarmTxs = (report.farm_transactions || [])
//         .filter(tx => tx.vehicle_id === vehicle.id);
//       const vehicleSales = (report.sales || [])
//         .filter(sale => sale.vehicle_id === vehicle.id);
//       const vehicleCosts = (report.costs || [])
//         .filter(cost => cost.vehicle_id === vehicle.id || !cost.vehicle_id);
//       const vehicleLosses = (report.losses || [])
//         .filter(loss => loss.vehicle_id === vehicle.id);

//       // Calculate totals
//       const total_purchases = this.sumByField(vehicleFarmTxs, 'total_amount');
//       const total_sales = this.sumByField(vehicleSales, 'total_amount');
//       const total_losses = this.sumByField(vehicleLosses, 'loss_amount');

//       // ✅ Vehicle costs + share of shared costs
//       const vehicleSpecificCosts = this.sumByField(
//         vehicleCosts.filter(c => c.vehicle_id === vehicle.id),
//         'amount'
//       );
//       const sharedCosts = this.sumByField(
//         vehicleCosts.filter(c => !c.vehicle_id),
//         'amount'
//       );
//       const sharedCostShare = sharedCosts / report.vehicles.length;
//       const total_costs = vehicleSpecificCosts + sharedCostShare;

//       const net_profit = total_sales - total_purchases - total_costs - total_losses;

//       return {
//         vehicle,
//         total_purchases,
//         total_sales,
//         total_costs,
//         total_losses,
//         net_profit,
//         farm_transactions: vehicleFarmTxs,
//         sales: vehicleSales,
//         costs: vehicleCosts,
//         losses: vehicleLosses
//       };
//     });
//   }

//   // ✅ Helper: Sum array by field
//   private sumByField(items: any[], field: string): number {
//     return items.reduce((sum, item) => sum + (item[field] || 0), 0);
//   }

//   // ✅ NEW: Get vehicle name by ID
//   getVehicleName(vehicleId: number | null | undefined): string {
//     if (!vehicleId) return 'مشترك';
//     const vehicle = this.vehicles().find(v => v.id === vehicleId);
//     return vehicle ? vehicle.name : '-';
//   }

//   // ✅ NEW: Handle vehicle filter change
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
// ============================================================================
// DAILY REPORT COMPONENT - COMPLETE MULTI-VEHICLE REFACTORING
// ============================================================================
// File: src/app/features/reports/daily-report/daily-report.component.ts

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
// import { MatTabsModule } from '@angular/material/tabs';
// import { ReportService } from '../../../../core/services/report.service';
// import {
//   DailyReport as Report,
//   Vehicle,
//   FarmTransaction,
//   SaleTransaction,
//   DailyCost,
//   TransportLoss,
//   ApiResponse,
//   ReportResponse
// } from '../../../../core/models';
// import { HttpErrorResponse } from '@angular/common/http';

// // ✅ Define vehicle summary interface
// interface VehicleSummary {
//   vehicle: Vehicle;
//   total_purchases: number;
//   total_sales: number;
//   total_costs: number;
//   total_losses: number;
//   net_profit: number;
//   farm_transactions: FarmTransaction[];
//   sales: SaleTransaction[];
//   costs: DailyCost[];
//   losses: TransportLoss[];
// }

// @Component({
//   selector: 'app-daily-report',
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
//     MatTableModule,
//     MatProgressSpinnerModule,
//     MatSelectModule,
//     MatChipsModule,
//     MatIconModule,
//     MatTabsModule,
//     MatSnackBarModule
//   ],
//   templateUrl: './daily-report.html',
//   styleUrl: './daily-report.css',
// })
// export class DailyReport implements OnInit {
//   private fb = inject(FormBuilder);
//   private reportService = inject(ReportService);
//   private snackBar = inject(MatSnackBar);

//   loading = signal(false);
//   report = signal<Report | null>(null);

//   // ✅ NEW: Selected vehicle filter
//   selectedVehicleId = signal<number | null>(null);

//   // ✅ NEW: Available vehicles from report
//   vehicles = computed(() => {
//     return this.report()?.vehicles || [];
//   });

//   // ✅ NEW: Vehicle summaries
//   vehicleSummaries = computed(() => {
//     const report = this.report();
//     if (!report) return [];

//     return this.calculateVehicleSummaries(report);
//   });

//   // ✅ NEW: Filtered data based on selected vehicle
//   filteredFarmTransactions = computed(() => {
//     const vehicleId = this.selectedVehicleId();
//     const report = this.report();

//     if (!report || !report.farm_transactions) return [];
//     if (!vehicleId) return report.farm_transactions;

//     return report.farm_transactions.filter(tx => tx.vehicle_id === vehicleId);
//   });

//   filteredSales = computed(() => {
//     const vehicleId = this.selectedVehicleId();
//     const report = this.report();

//     if (!report || !report.sales) return [];
//     if (!vehicleId) return report.sales;

//     return report.sales.filter(sale => sale.vehicle_id === vehicleId);
//   });

//   filteredCosts = computed(() => {
//     const vehicleId = this.selectedVehicleId();
//     const report = this.report();

//     if (!report || !report.costs) return [];
//     if (!vehicleId) return report.costs;

//     // ✅ Show vehicle-specific costs OR shared costs (no vehicle_id)
//     return report.costs.filter(cost =>
//       cost.vehicle_id === vehicleId || (!cost.vehicle_id && vehicleId)
//     );
//   });

//   filteredLosses = computed(() => {
//     const vehicleId = this.selectedVehicleId();
//     const report = this.report();

//     if (!report || !report.losses) return [];
//     if (!vehicleId) return report.losses;

//     return report.losses.filter(loss => loss.vehicle_id === vehicleId);
//   });

//   dateForm = this.fb.nonNullable.group({
//     date: [new Date(), Validators.required]
//   });

//   // ✅ UPDATED: Add vehicle column
//   farmColumns = ['vehicle', 'farm', 'chicken_type', 'weight', 'amount'];
//   saleColumns = ['vehicle', 'buyer', 'chicken_type', 'weight', 'amount'];
//   costColumns = ['vehicle', 'category', 'amount', 'notes'];
//   lossColumns = ['vehicle', 'chicken_type', 'weight', 'amount'];

//   ngOnInit(): void {
//     this.loadReport();
//   }

//   loadReport(): void {
//     const date = this.formatDate(this.dateForm.get('date')?.value!);
//     this.loading.set(true);

//     this.reportService.getDailyReport(date).subscribe({
//       next: (data: ApiResponse<ReportResponse>) => {
//         this.report.set(data.data.operations[0]);
//         console.log('Backend response:', this.report());
//         this.loading.set(false);

//         // ✅ Reset vehicle filter when new report loads
//         this.selectedVehicleId.set(null);
//       },
//       error: (error:HttpErrorResponse) => {
//         this.snackBar.open(error.error.message||'فشل تحميل التقرير', 'حسناً', { duration: 3000 });
//         this.loading.set(false);
//         console.error('Error loading report:', error);
//       }
//     });
//   }

//   // ✅ NEW: Calculate per-vehicle summaries
//   private calculateVehicleSummaries(report: Report): VehicleSummary[] {
//     if (!report.vehicles || report.vehicles.length === 0) return [];

//     return report.vehicles.map(vehicle => {
//       // Filter transactions by vehicle
//       const vehicleFarmTxs = (report.farm_transactions || [])
//         .filter(tx => tx.vehicle_id === vehicle.id);
//       const vehicleSales = (report.sales || [])
//         .filter(sale => sale.vehicle_id === vehicle.id);
//       const vehicleCosts = (report.costs || [])
//         .filter(cost => cost.vehicle_id === vehicle.id || !cost.vehicle_id);
//       const vehicleLosses = (report.losses || [])
//         .filter(loss => loss.vehicle_id === vehicle.id);

//       // Calculate totals
//       const total_purchases = this.sumByField(vehicleFarmTxs, 'total_amount');
//       const total_sales = this.sumByField(vehicleSales, 'total_amount');
//       const total_losses = this.sumByField(vehicleLosses, 'loss_amount');

//       // ✅ Vehicle costs + share of shared costs
//       const vehicleSpecificCosts = this.sumByField(
//         vehicleCosts.filter(c => c.vehicle_id === vehicle.id),
//         'amount'
//       );
//       const sharedCosts = this.sumByField(
//         vehicleCosts.filter(c => !c.vehicle_id),
//         'amount'
//       );
//       const sharedCostShare = sharedCosts / report.vehicles.length;
//       const total_costs = vehicleSpecificCosts + sharedCostShare;

//       const net_profit = total_sales - total_purchases - total_costs - total_losses;

//       return {
//         vehicle,
//         total_purchases,
//         total_sales,
//         total_costs,
//         total_losses,
//         net_profit,
//         farm_transactions: vehicleFarmTxs,
//         sales: vehicleSales,
//         costs: vehicleCosts,
//         losses: vehicleLosses
//       };
//     });
//   }

//   // ✅ Helper: Sum array by field
//   private sumByField(items: any[], field: string): number {
//     return items.reduce((sum, item) => sum + (item[field] || 0), 0);
//   }

//   // ✅ NEW: Get vehicle name by ID
//   getVehicleName(vehicleId: number | null | undefined): string {
//     if (!vehicleId) return 'مشترك';
//     const vehicle = this.vehicles().find(v => v.id === vehicleId);
//     return vehicle ? vehicle.name : '-';
//   }

//   // ✅ NEW: Handle vehicle filter change
//   onVehicleFilterChange(vehicleId: number | null): void {
//     this.selectedVehicleId.set(vehicleId);
//   }

//   private formatDate(date: Date): string {
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const day = String(date.getDate()).padStart(2, '0');
//     return `${year}-${month}-${day}`;
//   }

// filteredSummary = computed(() => {
//   const report = this.report();
//   const vehicleId = this.selectedVehicleId();

//   if (!report) return null;

//   const profit = report.profit_distribution;
//   if (!profit) return null; // ✅ تأكد إنه موجود
// console.log("حححح",profit.total_costs - profit.vehicle_costs,);

//   // لو مفيش فلترة → رجّع الإجمالي
//   if (!vehicleId) {
//     return {
//       total_purchases: Number(profit.total_purchases||0),
//       total_sales: Number(profit.total_revenue||0),
//       total_costs:Number( profit.total_costs||0) - Number(profit.vehicle_costs||0),
//       total_vehicle_costs:Number(profit.vehicle_costs||0),
//       total_losses: Number(profit.total_losses||0),
//       net_profit:Number( profit.net_profit||0)
//     };
//   }

//   // فلترة حسب المركبة
//   const vehicleData = report.vehicle_breakdown.find(
//     (v: any) => v.vehicle_id === vehicleId
//   );

//   if (!vehicleData) {
//     return {
//       total_purchases: 0,
//       total_sales: 0,
//       total_costs_per_vehicle: 0,
//       total_vehicle_costs: 0,
//       total_losses: 0,
//       net_profit: 0
//     };
//   }

//   return {
//     total_purchases: Number(vehicleData.purchases||0),
//     total_sales: Number(vehicleData.revenue||0),
//     total_costs_per_vehicle: Number(vehicleData.other_costs||0),
//     total_vehicle_costs: Number(vehicleData.vehicle_costs||0),
//     total_losses: Number(vehicleData.losses||0),
//     net_profit: Number(vehicleData.net_profit||0)
//   };
// });
// hasAnyDetails = computed(() => {
//   if (!this.report()) return false;

//   return (
//     this.filteredFarmTransactions().length > 0 ||
//     this.filteredSales().length > 0 ||
//     this.filteredCosts().length > 0 ||
//     this.filteredLosses().length > 0
//   );
// });
// }
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
// import { MatTabsModule } from '@angular/material/tabs';
// import { MatExpansionModule } from '@angular/material/expansion';
// import { MatTooltipModule } from '@angular/material/tooltip';
// import { MatDividerModule } from '@angular/material/divider';
// import { ReportService } from '../../../../core/services/report.service';
// import { HttpErrorResponse } from '@angular/common/http';
// import {  DailyReport as report, EnhancedDailyReport, ApiResponseReprt } from '../../../../core/models';
// import { ReportUtilitiesService } from '../../../../core/services/ReportUtilitiesService';

// @Component({
//   selector: 'app-daily-report',
//   imports: [
//     CommonModule,
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
//     MatTabsModule,
//     MatSnackBarModule,
//     MatExpansionModule,
//     MatTooltipModule,
//     MatDividerModule
//   ],
//   templateUrl: './daily-report.html',
//   styleUrls: ['./daily-report.css'],
// })
// export class DailyReport implements OnInit {
//   private fb = inject(FormBuilder);
//   private reportService = inject(ReportService);
//   private snackBar = inject(MatSnackBar);
//   private readonly utils = inject(ReportUtilitiesService);

//   // ========================================
//   // 📊 STATE SIGNALS
//   // ========================================
//   loading = signal(false);
//   report = signal<EnhancedDailyReport | null>(null);
//   selectedVehicleId = signal<number | null>(null);
//   selectedTab = signal(0);
//    // ========================================
//   // 🎯 COMPUTED PROPERTIES
//   // ========================================

//   // Available vehicles
//   vehicles = computed(() => {
//     return this.report()?.summary.operation_info.vehicles || [];
//   });

//   // Operation info
//   operationInfo = computed(() => {
//     return this.report()?.summary.operation_info;
//   });

//   // Financial summary (filtered by vehicle)
//   financialSummary = computed(() => {
//     const report = this.report();
//     const vehicleId = this.selectedVehicleId();

//     if (!report) return null;

//     // If no vehicle selected, return overall summary
//     if (!vehicleId) {
//       return report.summary.financial_summary;
//     }

//     // Find vehicle-specific breakdown
//     const vehicleData = report.summary.vehicle_breakdown.find(
//       v => v.vehicle_id === vehicleId
//     );

//     if (!vehicleData) return null;

//     return {
//       total_purchases: vehicleData.purchases,
//       total_revenue: vehicleData.revenue,
//       total_losses: vehicleData.losses,
//       total_costs: vehicleData.vehicle_costs + vehicleData.other_costs,
//       vehicle_costs: vehicleData.vehicle_costs,
//       other_costs: vehicleData.other_costs,
//       net_profit: vehicleData.net_profit,
//       profit_margin_percentage: vehicleData.revenue > 0
//         ? ((vehicleData.net_profit / vehicleData.revenue) * 100).toFixed(2) + '%'
//         : '0.00%'
//     };
//   });
//   // ✅ Delegate formatting to shared service (safe for undefined/null)
// formatCurrency = (amount: number | undefined | null) => this.utils.formatCurrency(amount);
// formatNumber = (num: number | undefined | null |string, decimals?: number) => this.utils.formatNumber(num, decimals);
// formatPercentage = (value: number | undefined | null, decimals?: number) => this.utils.formatPercentage(value, decimals);
// formatDateTime = (date: string | Date | undefined | null) => this.utils.formatDateTime(date);

//   // Filtered farm transactions
//   filteredFarmTransactions = computed(() => {
//     const report = this.report();
//     const vehicleId = this.selectedVehicleId();

//     if (!report) return [];
//     console.log("report",report);

//     const transactions = report.detailed_transactions.farm_loading.transactions;

//     if (!vehicleId) return transactions;

//     return transactions.filter(tx => tx.vehicle?.id === vehicleId);
//   });

//   // Filtered sales
//   filteredSales = computed(() => {
//     const report = this.report();
//     const vehicleId = this.selectedVehicleId();

//     if (!report) return [];

//     const sales = report.detailed_transactions.sales.transactions;

//     if (!vehicleId) return sales;

//     return sales.filter(sale => sale.vehicle?.id === vehicleId);
//   });

//   // Filtered costs
//   filteredCosts = computed(() => {
//   const report = this.report();
//   const vehicleId = this.selectedVehicleId();

//   if (!report) return [];

//   // Get array of cost objects
//   const costsArray = Object.values(report.detailed_transactions.costs.by_category);

//   if (!vehicleId) return costsArray;

//   // Filter each category's costs by vehicle
//   return costsArray.map(category => {
//     const filteredCosts = category.costs.filter(cost =>
//       cost.vehicle?.id === vehicleId || !cost.vehicle
//     );

//     return {
//       ...category,
//       costs: filteredCosts,
//       total_amount: filteredCosts.reduce((sum, c) => sum + c.amount, 0),
//       count: filteredCosts.length,
//     };
//   }).filter(category => category.costs.length > 0); // optional: remove empty categories
// });


//   // Filtered losses
//   filteredLosses = computed(() => {
//     const report = this.report();
//     const vehicleId = this.selectedVehicleId();

//     if (!report) return [];

//     const losses = report.detailed_transactions.losses.records;

//     if (!vehicleId) return losses;

//     return losses.filter(loss => loss.vehicle.id === vehicleId);
//   });

//   // Grouped costs by category
//   costsByCategory = computed(() => {
//     const report = this.report();
//     if (!report) return [];

//     return Object.values(report.detailed_transactions.costs.by_category);
//   });

//   // Debt movements
//   farmDebtPayments = computed(() => {
//     return this.report()?.debt_movements.farm_payments || [];
//   });

//   buyerDebtPayments = computed(() => {
//     return this.report()?.debt_movements.buyer_payments || [];
//   });

//   // Profit distribution
//   profitDistribution = computed(() => {
//     return this.report()?.profit_distribution;
//   });

//   // Check if any details exist
//   hasAnyDetails = computed(() => {
//     if (!this.report()) return false;

//     return (
//       this.filteredFarmTransactions().length > 0 ||
//       this.filteredSales().length > 0 ||
//       this.filteredCosts().length > 0 ||
//       this.filteredLosses().length > 0
//     );
//   });

//   // ========================================
//   // 🎨 FORM
//   // ========================================
//   dateForm = this.fb.nonNullable.group({
//     date: [new Date(), Validators.required]
//   });

//   ngOnInit(): void {
//     this.loadReport();
//   }

//   // ========================================
//   // 🔄 METHODS
//   // ========================================

//   loadReport(): void {
//     const date = this.formatDate(this.dateForm.get('date')?.value!);
//     this.loading.set(true);

//     this.reportService.getDailyReport(date).subscribe({
//       next: (response: ApiResponseReprt) => {
//         if (response.success && response.data.operation) {
//           this.report.set(response.data.operation);
//           console.log("report",this.report());

//           this.selectedVehicleId.set(null);
//           this.snackBar.open('تم تحميل التقرير بنجاح', 'حسناً', { duration: 2000 });
//         } else {
//           this.report.set(null);
//           this.snackBar.open('لا توجد عمليات لهذا التاريخ', 'حسناً', { duration: 3000 });
//         }
//         this.loading.set(false);
//       },
//       error: (error: HttpErrorResponse) => {
//         this.snackBar.open(
//           error.error?.message || 'فشل تحميل التقرير',
//           'حسناً',
//           { duration: 3000 }
//         );
//         this.loading.set(false);
//         this.report.set(null);
//         console.error('Error loading report:', error);
//       }
//     });
//   }

//   onVehicleFilterChange(vehicleId: number | null): void {
//     this.selectedVehicleId.set(vehicleId);
//   }

//   getVehicleName(vehicleId: number | null | undefined): string {
//     if (!vehicleId) return 'مشترك';
//     const vehicle = this.vehicles().find(v => v.id === vehicleId);
//     return vehicle ? vehicle.name : '-';
//   }

//   getBalanceStatusClass(balance: number): string {
//     if (balance > 0) return 'receivable'; // لنا عليهم
//     if (balance < 0) return 'payable'; // لهم علينا
//     return 'settled'; // متصفي
//   }

//   getPaymentStatusClass(isFullPayment: boolean, hasRemaining: boolean): string {
//     if (isFullPayment) return 'paid-full';
//     if (hasRemaining) return 'paid-partial';
//     return 'unpaid';
//   }

//   private formatDate(date: Date): string {
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const day = String(date.getDate()).padStart(2, '0');
//     return `${year}-${month}-${day}`;
//   }


//   formatTime(dateStr: string): string {
//     const date = new Date(dateStr);
//     return date.toLocaleTimeString('ar-EG', {
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   }

// exportToExcel(): void {
//   const report = this.report();
//   if (!report) return;

//   const sheets = [
//     {
//       name: 'الملخص المالي',
//       data: [this.prepareFinancialSummaryForExport()]
//     },
//     {
//       name: 'معاملات المزارع',
//       data: this.prepareFarmTransactionsForExport()
//     },
//     {
//       name: 'المبيعات',
//       data: this.prepareSalesForExport()
//     },
//     {
//       name: 'التكاليف',
//       data: this.prepareCostsForExport()
//     },
//     {
//       name: 'الخسائر',
//       data: this.prepareLossesForExport()
//     }
//   ];

//   const fileName = `التقرير_اليومي_${this.formatDate(this.dateForm.get('date')?.value!)}`;
//   this.utils.exportMultipleSheetsToExcel(sheets, fileName);
//    this.snackBar.open('تم التصدير إلى Excel بنجاح', 'حسناً', { duration: 2000 });
// }


// printReport(): void {
//   this.utils.printPage();
// }

// clearReport(): void {
//   this.report.set(null);
//   this.selectedVehicleId.set(null);
//   this.dateForm.reset({ date: new Date() });
// }

// hasReport = computed(() => this.report() !== null);

// // Helper methods for Excel export
// private prepareFinancialSummaryForExport(): any {
//   const summary = this.financialSummary();
//   return {
//     'البيان': 'الملخص المالي',
//     'إجمالي المشتريات': summary?.total_purchases || 0,
//     'إجمالي المبيعات': summary?.total_revenue || 0,
//     'تكاليف المركبات': summary?.vehicle_costs || 0,
//     'التكاليف الأخرى': summary?.other_costs || 0,
//     'الخسائر': summary?.total_losses || 0,
//     'صافي الربح': summary?.net_profit || 0,
//     'هامش الربح': summary?.profit_margin_percentage || '0.00%'
//   };
// }

// private prepareFarmTransactionsForExport(): any[] {
//   return this.filteredFarmTransactions().map(tx => ({
//     'رقم التسلسل': tx.sequence_number,
//     'المزرعة': tx.farm?.name,
//     'نوع الفراخ': tx.chicken_type?.name,
//     'المركبة': tx.vehicle?.name,
//     'صافي الوزن': tx.weighing.net_chicken_weight,
//     'سعر الكيلو': tx.pricing.price_per_kg,
//     'إجمالي المبلغ': tx.pricing.total_amount,
//     'المدفوع': tx.pricing.paid_amount,
//     'المتبقي': tx.pricing.remaining_amount,
//     'حالة الدفع': tx.debt_info.status,
//     'التاريخ': this.formatDateTime(tx.transaction_time)
//   }));
// }

// private prepareSalesForExport(): any[] {
//   return this.filteredSales().map(sale => ({
//     'رقم التسلسل': sale.sequence_number,
//     'المشتري': sale.buyer?.name,
//     'نوع الفراخ': sale.chicken_type?.name,
//     'المركبة': sale.vehicle?.name,
//     'صافي الوزن': sale.weighing.net_chicken_weight,
//     'سعر الكيلو': sale.pricing.price_per_kg,
//     'إجمالي المبلغ': sale.pricing.total_amount,
//     'المدفوع': sale.pricing.paid_amount,
//     'المتبقي': sale.pricing.remaining_amount,
//     'حالة الدفع': sale.debt_info.status,
//     'التاريخ': this.formatDateTime(sale.transaction_time)
//   }));
// }

// private prepareCostsForExport(): any[] {
//   const costs: any[] = [];
//   this.filteredCosts().forEach(category => {
//     category.costs.forEach(cost => {
//       costs.push({
//         'الفئة': category.category_info.name,
//         'الوصف': cost.cost_details.description,
//         'المبلغ': cost.cost_details.amount,
//         'المركبة': cost.vehicle?.name || 'مشترك',
//         'نوع التكلفة': category.category_info.is_vehicle_cost ? 'تكلفة مركبة' : 'تكلفة أخرى',
//         'التاريخ': this.formatDateTime(cost.recorded_at)
//       });
//     });
//   });
//   return costs;
// }

// private prepareLossesForExport(): any[] {
//   return this.filteredLosses().map(loss => ({
//     'نوع الفراخ': loss.chicken_type?.name,
//     'المركبة': loss.vehicle.name,
//     'الوزن الميت': loss.loss_details.dead_weight,
//     'السعر': loss.loss_details.price_per_kg,
//     'قيمة الخسارة': loss.loss_details.loss_amount,
//     'الموقع': loss.loss_details.location,
//     'المزرعة المسؤولة': loss.farm_responsibility.is_farm_responsible ? loss.farm_responsibility.farm?.name : 'لا يوجد',
//     'التاريخ': this.formatDateTime(loss.recorded_at)
//   }));
// }
// }
import { Component, OnInit, inject, signal, computed } from '@angular/core';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { ReportService } from '../../../../core/services/report.service';
import { HttpErrorResponse } from '@angular/common/http';
import {
  EnhancedDailyReport,
  ApiResponseReprt,
  CostByCategory
} from '../../../../core/models';
import { ReportUtilitiesService } from '../../../../core/services/ReportUtilitiesService';
import { BalanceDirectionPipe } from '../../../../shared/pipes/balance-direction.pipe';

@Component({
  selector: 'app-daily-report',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatChipsModule,
    MatIconModule,
    MatTabsModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatTooltipModule,
    MatDividerModule,
    BalanceDirectionPipe
],
  templateUrl: './daily-report.html',
  styleUrls: ['./daily-report.css'],
})
// export class DailyReport implements OnInit {
//   private fb = inject(FormBuilder);
//   private reportService = inject(ReportService);
//   private snackBar = inject(MatSnackBar);
//   private readonly utils = inject(ReportUtilitiesService);

//   // ========================================
//   // 📊 STATE SIGNALS
//   // ========================================
//   loading = signal(false);
//   report = signal<EnhancedDailyReport | null>(null);
//   selectedVehicleId = signal<number | null>(null);
//   selectedTab = signal(0);

//   // ========================================
//   // 🎯 COMPUTED PROPERTIES
//   // ========================================

//   // Available vehicles
//   vehicles = computed(() => {
//     return this.report()?.summary.operation_info.vehicles || [];
//   });

//   // Operation info
//   operationInfo = computed(() => {
//     return this.report()?.summary.operation_info;
//   });

//   // Financial summary (filtered by vehicle)
//   financialSummary = computed(() => {
//     const report = this.report();
//     const vehicleId = this.selectedVehicleId();

//     if (!report) return null;

//     // If no vehicle selected, return overall summary
//     if (!vehicleId) {
//       return report.summary.financial_summary;
//     }

//     // Find vehicle-specific breakdown
//     const vehicleData = report.summary.vehicle_breakdown.find(
//       v => v.vehicle_id === vehicleId
//     );

//     if (!vehicleData) return null;

//     return {
//       total_purchases: vehicleData.purchases,
//       total_revenue: vehicleData.revenue,
//       total_losses: vehicleData.losses,
//           lossesWithFarm: vehicleData.lossesWithFarm ?? 0,
//     lossesWithoutFarm: vehicleData.lossesWithoutFarm ?? 0,
//       total_costs: vehicleData.vehicle_costs + vehicleData.other_costs,
//       vehicle_costs: vehicleData.vehicle_costs,
//       other_costs: vehicleData.other_costs,
//       net_profit: vehicleData.net_profit,
//       profit_margin_percentage: vehicleData.revenue > 0
//         ? ((vehicleData.net_profit / vehicleData.revenue) * 100).toFixed(2) + '%'
//         : '0.00%'
//     };
//   });

//   // ✅ Delegate formatting to shared service (safe for undefined/null)
//   formatCurrency = (amount: number | string | undefined | null) => this.utils.formatCurrency(amount);
//   formatNumber = (num: number | undefined | null | string, decimals?: number) => this.utils.formatNumber(num, decimals);
//   formatPercentage = (value: number | string | undefined | null, decimals?: number) => this.utils.formatPercentage(value, decimals);
//   formatDateTime = (date: string | Date | undefined | null) => this.utils.formatDateTime(date);

//   // Filtered farm transactions
//   filteredFarmTransactions = computed(() => {
//     const report = this.report();
//     const vehicleId = this.selectedVehicleId();

//     if (!report) return [];

//     const transactions = report.detailed_transactions.farm_loading.transactions;

//     if (!vehicleId) return transactions;

//     return transactions.filter(tx => tx.vehicle?.id === vehicleId);
//   });

//   // Filtered sales
//   filteredSales = computed(() => {
//     const report = this.report();
//     const vehicleId = this.selectedVehicleId();

//     if (!report) return [];

//     const sales = report.detailed_transactions.sales.transactions;

//     if (!vehicleId) return sales;

//     return sales.filter(sale => sale.vehicle?.id === vehicleId);
//   });

//   // Filtered costs
//   filteredCosts = computed(() => {
//     const report = this.report();
//     const vehicleId = this.selectedVehicleId();

//     if (!report) return [];

//     // Get array of cost categories
//     const costsArray: CostByCategory[] = Object.values(report.detailed_transactions.costs.by_category);

//     if (!vehicleId) return costsArray;

//     // Filter each category's costs by vehicle
//     return costsArray.map(category => {
//       const filteredCosts = category.costs.filter(cost =>
//         cost.vehicle?.id === vehicleId || !cost.vehicle
//       );

//       return {
//         ...category,
//         costs: filteredCosts,
//         total_amount: filteredCosts.reduce((sum, c) => sum + c.cost_details.amount, 0),
//         count: filteredCosts.length,
//       };
//     }).filter(category => category.costs.length > 0);
//   });

//   // Filtered losses
//   filteredLosses = computed(() => {
//     const report = this.report();
//     const vehicleId = this.selectedVehicleId();

//     if (!report) return [];

//     const losses = report.detailed_transactions.losses.records;

//     if (!vehicleId) return losses;

//     return losses.filter(loss => loss.vehicle.id === vehicleId);
//   });

//   // Debt movements
//   farmDebtPayments = computed(() => {
//     return this.report()?.debt_movements.farm_payments || [];
//   });

//   buyerDebtPayments = computed(() => {
//     return this.report()?.debt_movements.buyer_payments || [];
//   });

//   // Profit distribution
//   profitDistribution = computed(() => {
//     return this.report()?.profit_distribution;
//   });

//   // Check if any details exist
//   hasAnyDetails = computed(() => {
//     if (!this.report()) return false;

//     return (
//       this.filteredFarmTransactions().length > 0 ||
//       this.filteredSales().length > 0 ||
//       this.filteredCosts().length > 0 ||
//       this.filteredLosses().length > 0
//     );
//   });

//   // ========================================
//   // 🎨 FORM
//   // ========================================
//   dateForm = this.fb.nonNullable.group({
//     date: [new Date(), Validators.required]
//   });

//   ngOnInit(): void {
//     this.loadReport();
//   }

//   // ========================================
//   // 🔄 METHODS
//   // ========================================

//   loadReport(): void {
//     const date = this.formatDate(this.dateForm.get('date')?.value!);
//     this.loading.set(true);

//     this.reportService.getDailyReport(date).subscribe({
//       next: (response: ApiResponseReprt) => {
//         if (response.success && response.data.operation) {
//           this.report.set(response.data.operation);
//           console.log("report", this.report());

//           this.selectedVehicleId.set(null);
//           this.snackBar.open('تم تحميل التقرير بنجاح', 'حسناً', { duration: 2000 });
//         } else {
//           this.report.set(null);
//           this.snackBar.open('لا توجد عمليات لهذا التاريخ', 'حسناً', { duration: 3000 });
//         }
//         this.loading.set(false);
//       },
//       error: (error: HttpErrorResponse) => {
//         this.snackBar.open(
//           error.error?.message || 'فشل تحميل التقرير',
//           'حسناً',
//           { duration: 3000 }
//         );
//         this.loading.set(false);
//         this.report.set(null);
//         console.error('Error loading report:', error);
//       }
//     });
//   }

//   onVehicleFilterChange(vehicleId: number | null): void {
//     this.selectedVehicleId.set(vehicleId);
//   }

//   getVehicleName(vehicleId: number | null | undefined): string {
//     if (!vehicleId) return 'مشترك';
//     const vehicle = this.vehicles().find(v => v.id === vehicleId);
//     return vehicle ? vehicle.name : '-';
//   }

//   getBalanceStatusClass(balance: number): string {
//     if (balance > 0) return 'receivable'; // لنا عليهم
//     if (balance < 0) return 'payable'; // لهم علينا
//     return 'settled'; // متصفي
//   }

//   getPaymentStatusClass(isFullPayment: boolean, hasRemaining: boolean): string {
//     if (isFullPayment) return 'paid-full';
//     if (hasRemaining) return 'paid-partial';
//     return 'unpaid';
//   }

//   private formatDate(date: Date): string {
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const day = String(date.getDate()).padStart(2, '0');
//     return `${year}-${month}-${day}`;
//   }

//   formatTime(dateStr: string): string {
//     const date = new Date(dateStr);
//     return date.toLocaleTimeString('ar-EG', {
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   }

//   exportToExcel(): void {
//     const report = this.report();
//     if (!report) return;

//     const sheets = [
//       {
//         name: 'الملخص المالي',
//         data: [this.prepareFinancialSummaryForExport()]
//       },
//       {
//         name: 'معاملات المزارع',
//         data: this.prepareFarmTransactionsForExport()
//       },
//       {
//         name: 'المبيعات',
//         data: this.prepareSalesForExport()
//       },
//       {
//         name: 'التكاليف',
//         data: this.prepareCostsForExport()
//       },
//       {
//         name: 'الخسائر',
//         data: this.prepareLossesForExport()
//       }
//     ];

//     const fileName = `التقرير_اليومي_${this.formatDate(this.dateForm.get('date')?.value!)}`;
//     this.utils.exportMultipleSheetsToExcel(sheets, fileName);
//     this.snackBar.open('تم التصدير إلى Excel بنجاح', 'حسناً', { duration: 2000 });
//   }

//   printReport(): void {
//     this.utils.printPage();
//   }

//   clearReport(): void {
//     this.report.set(null);
//     this.selectedVehicleId.set(null);
//     this.dateForm.reset({ date: new Date() });
//   }

//   hasReport = computed(() => this.report() !== null);

//   // Helper methods for Excel export
//   private prepareFinancialSummaryForExport(): any {
//     const summary = this.financialSummary();
//     return {
//       'البيان': 'الملخص المالي',
//       'إجمالي المشتريات': summary?.total_purchases || 0,
//       'إجمالي المبيعات': summary?.total_revenue || 0,
//       'تكاليف المركبات': summary?.vehicle_costs || 0,
//       'التكاليف الأخرى': summary?.other_costs || 0,
//       'الخسائر': summary?.total_losses || 0,
//       'إجمالي الفقد علينا': summary?.total_losses || 0,
//       'صافي الربح': summary?.net_profit || 0,
//       'هامش الربح': summary?.profit_margin_percentage || '0.00%'
//     };
//   }

//   private prepareFarmTransactionsForExport(): any[] {
//     return this.filteredFarmTransactions().map(tx => ({
//       'رقم التسلسل': tx.sequence_number,
//       'المزرعة': tx.farm?.name,
//       'نوع الفراخ': tx.chicken_type?.name,
//       'المركبة': tx.vehicle?.name,
//       'صافي الوزن': tx.weighing.net_chicken_weight,
//       'سعر الكيلو': tx.pricing.price_per_kg,
//       'إجمالي المبلغ': tx.pricing.total_amount,
//       'المدفوع': tx.pricing.paid_amount,
//       'المتبقي': tx.pricing.remaining_amount,
//       'حالة الدفع': tx.debt_info.status,
//       'التاريخ': this.formatDateTime(tx.transaction_time)
//     }));
//   }

//   private prepareSalesForExport(): any[] {
//     return this.filteredSales().map(sale => ({
//       'رقم التسلسل': sale.sequence_number,
//       'المشتري': sale.buyer?.name,
//       'نوع الفراخ': sale.chicken_type?.name,
//       'المركبة': sale.vehicle?.name,
//       'صافي الوزن': sale.weighing.net_chicken_weight,
//       'سعر الكيلو': sale.pricing.price_per_kg,
//       'إجمالي المبلغ': sale.pricing.total_amount,
//       'المدفوع': sale.pricing.paid_amount,
//       'المتبقي': sale.pricing.remaining_amount,
//       'حالة الدفع': sale.debt_info.status,
//       'التاريخ': this.formatDateTime(sale.transaction_time)
//     }));
//   }

//   private prepareCostsForExport(): any[] {
//     const costs: any[] = [];
//     this.filteredCosts().forEach(category => {
//       category.costs.forEach(cost => {
//         costs.push({
//           'الفئة': category.category_info.name,
//           'الوصف': cost.cost_details.description,
//           'المبلغ': cost.cost_details.amount,
//           'المركبة': cost.vehicle?.name || 'مشترك',
//           'نوع التكلفة': category.category_info.is_vehicle_cost ? 'تكلفة مركبة' : 'تكلفة أخرى',
//           'التاريخ': this.formatDateTime(cost.recorded_at)
//         });
//       });
//     });
//     return costs;
//   }

//   private prepareLossesForExport(): any[] {
//     return this.filteredLosses().map(loss => ({
//       'نوع الفراخ': loss.chicken_type?.name,
//       'المركبة': loss.vehicle.name,
//       'الوزن الميت': loss.loss_details.dead_weight,
//       'السعر': loss.loss_details.price_per_kg,
//       'قيمة الخسارة': loss.loss_details.loss_amount,
//       'الموقع': loss.loss_details.location,
//       'المزرعة المسؤولة': loss.farm_responsibility.is_farm_responsible ? loss.farm_responsibility.farm?.name : 'لا يوجد',
//       'التاريخ': this.formatDateTime(loss.recorded_at)
//     }));
//   }
// }
export class DailyReport implements OnInit {
  private fb = inject(FormBuilder);
  private reportService = inject(ReportService);
  private snackBar = inject(MatSnackBar);
  private readonly utils = inject(ReportUtilitiesService);

  // ========================================
  // 📊 STATE SIGNALS
  // ========================================
  loading = signal(false);
  report = signal<EnhancedDailyReport | null>(null);
  selectedVehicleId = signal<number | null>(null);
  selectedTab = signal(0);

  // ========================================
  // 🎯 COMPUTED PROPERTIES
  // ========================================

  // Available vehicles
  vehicles = computed(() => {
    return this.report()?.summary.operation_info.vehicles || [];
  });

  // Operation info
  operationInfo = computed(() => {
    return this.report()?.summary.operation_info;
  });

  // Financial summary (filtered by vehicle)
  financialSummary = computed(() => {
    const report = this.report();
    const vehicleId = this.selectedVehicleId();

    if (!report) return null;

    // If no vehicle selected, return overall summary
    if (!vehicleId) {
      return report.summary.financial_summary;
    }

    // Find vehicle-specific breakdown
    const vehicleData = report.summary.vehicle_breakdown.find(
      v => v.vehicle_id === vehicleId
    );

    if (!vehicleData) return null;

    return {
      total_purchases: vehicleData.purchases,
      total_revenue: vehicleData.revenue,
      total_losses: vehicleData.losses,
      lossesWithFarm: vehicleData.lossesWithFarm ?? 0,
      lossesWithoutFarm: vehicleData.lossesWithoutFarm ?? 0,
      total_costs: vehicleData.total_costs ?? (vehicleData.vehicle_costs + vehicleData.other_costs),
      vehicle_costs: vehicleData.vehicle_costs,
      other_costs: vehicleData.other_costs,
      net_profit: vehicleData.net_profit,
      profit_margin_percentage: vehicleData.profit_margin_percentage ?? (vehicleData.revenue > 0
        ? ((vehicleData.net_profit / vehicleData.revenue) * 100).toFixed(2) + '%'
        : '0.00%')
    };
  });

  // ✅ Delegate formatting to shared service (safe for undefined/null)
  formatCurrency = (amount: number | string | undefined | null) => this.utils.formatCurrency(amount);
  formatNumber = (num: number | undefined | null | string, decimals?: number) => this.utils.formatNumber(num, decimals);
  formatPercentage = (value: number | string | undefined | null, decimals?: number) => this.utils.formatPercentage(value, decimals);
  formatDateTime = (date: string | Date | undefined | null) => this.utils.formatDateTime(date);

  // Filtered farm transactions
  filteredFarmTransactions = computed(() => {
    const report = this.report();
    const vehicleId = this.selectedVehicleId();

    if (!report) return [];

    const transactions = report.detailed_transactions.farm_loading.transactions;

    if (!vehicleId) return transactions;

    return transactions.filter(tx => tx.vehicle?.id === vehicleId);
  });

  // Filtered sales
  filteredSales = computed(() => {
    const report = this.report();
    const vehicleId = this.selectedVehicleId();

    if (!report) return [];

    const sales = report.detailed_transactions.sales.transactions;

    if (!vehicleId) return sales;

    return sales.filter(sale => sale.vehicle?.id === vehicleId);
  });

  // Filtered costs
  filteredCosts = computed(() => {
    const report = this.report();
    const vehicleId = this.selectedVehicleId();

    if (!report) return [];

    // Get array of cost categories
    const costsArray: CostByCategory[] = Object.values(report.detailed_transactions.costs.by_category);

    if (!vehicleId) return costsArray;

    // Filter each category's costs by vehicle
    return costsArray.map(category => {
      const filteredCosts = category.costs.filter(cost =>
        cost.vehicle?.id === vehicleId || !cost.vehicle
      );

      return {
        ...category,
        costs: filteredCosts,
        total_amount: filteredCosts.reduce((sum, c) => sum + c.cost_details.amount, 0),
        count: filteredCosts.length,
      };
    }).filter(category => category.costs.length > 0);
  });

  // Filtered losses
  filteredLosses = computed(() => {
    const report = this.report();
    const vehicleId = this.selectedVehicleId();

    if (!report) return [];

    const losses = report.detailed_transactions.losses.records;

    if (!vehicleId) return losses;

    return losses.filter(loss => loss.vehicle.id === vehicleId);
  });

  // Debt movements
  farmDebtPayments = computed(() => {
    return this.report()?.debt_movements.farm_payments || [];
  });

  buyerDebtPayments = computed(() => {
    return this.report()?.debt_movements.buyer_payments || [];
  });

  // Profit distribution
  profitDistribution = computed(() => {
    return this.report()?.profit_distribution;
  });

  // Check if any details exist
  hasAnyDetails = computed(() => {
    if (!this.report()) return false;

    return (
      this.filteredFarmTransactions().length > 0 ||
      this.filteredSales().length > 0 ||
      this.filteredCosts().length > 0 ||
      this.filteredLosses().length > 0
    );
  });

  // ========================================
  // 🎨 FORM
  // ========================================
  dateForm = this.fb.nonNullable.group({
    date: [new Date(), Validators.required]
  });

  ngOnInit(): void {
    this.loadReport();
  }

  // ========================================
  // 🔄 METHODS
  // ========================================

  loadReport(): void {
    const date = this.formatDate(this.dateForm.get('date')?.value!);
    this.loading.set(true);

    this.reportService.getDailyReport(date).subscribe({
      next: (response: ApiResponseReprt) => {
        if (response.success && response.data.operation) {
          this.report.set(response.data.operation);
          console.log("report", this.report());

          this.selectedVehicleId.set(null);
          this.snackBar.open('تم تحميل التقرير بنجاح', 'حسناً', { duration: 2000 });
        } else {
          this.report.set(null);
          this.snackBar.open('لا توجد عمليات لهذا التاريخ', 'حسناً', { duration: 3000 });
        }
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.snackBar.open(
          error.error?.message || 'فشل تحميل التقرير',
          'حسناً',
          { duration: 3000 }
        );
        this.loading.set(false);
        this.report.set(null);
        console.error('Error loading report:', error);
      }
    });
  }

  onVehicleFilterChange(vehicleId: number | null): void {
    this.selectedVehicleId.set(vehicleId);
  }

  getVehicleName(vehicleId: number | null | undefined): string {
    if (!vehicleId) return 'مشترك';
    const vehicle = this.vehicles().find(v => v.id === vehicleId);
    return vehicle ? vehicle.name : '-';
  }

  // Using balance_type from API - NO component calculation of balance direction
  getBalanceStatusClass(balanceType: string | undefined): string {
    const type = balanceType?.toUpperCase();
    if (type === 'RECEIVABLE' || type === 'NET_RECEIVABLE') return 'receivable';
    if (type === 'PAYABLE' || type === 'CREDIT' || type === 'NET_CREDIT') return 'payable';
    return 'settled';
  }

  getPaymentStatusClass(isFullPayment: boolean, hasRemaining: boolean): string {
    if (isFullPayment) return 'paid-full';
    if (hasRemaining) return 'paid-partial';
    return 'unpaid';
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  exportToExcel(): void {
    const report = this.report();
    if (!report) return;

    const sheets = [
      {
        name: 'الملخص المالي',
        data: [this.prepareFinancialSummaryForExport()]
      },
      {
        name: 'معاملات المزارع',
        data: this.prepareFarmTransactionsForExport()
      },
      {
        name: 'المبيعات',
        data: this.prepareSalesForExport()
      },
      {
        name: 'التكاليف',
        data: this.prepareCostsForExport()
      },
      {
        name: 'الخسائر',
        data: this.prepareLossesForExport()
      },
      {
        name: 'حركات الديون',
        data: this.prepareDebtMovementsForExport()
      },
      {
        name: 'توزيع الأرباح',
        data: this.prepareProfitDistributionForExport()
      }
    ];

    const fileName = `التقرير_اليومي_${this.formatDate(this.dateForm.get('date')?.value!)}`;
    this.utils.exportMultipleSheetsToExcel(sheets, fileName);
    this.snackBar.open('تم التصدير إلى Excel بنجاح', 'حسناً', { duration: 2000 });
  }

  printReport(): void {
    this.utils.printPage();
  }

  clearReport(): void {
    this.report.set(null);
    this.selectedVehicleId.set(null);
    this.dateForm.reset({ date: new Date() });
  }

  hasReport = computed(() => this.report() !== null);

  // ========================================
  // 📊 HELPER METHODS FOR EXCEL EXPORT
  // ========================================

  // دالة لتحويل الأرقام الإنجليزية للعربية
  private toArabicNumbers(num: number | string | undefined | null): string {
    if (num === null || num === undefined) return '٠';
    const str = num.toString();
    const arabicNums = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return str.replace(/[0-9]/g, (d) => arabicNums[parseInt(d)]);
  }

  private prepareFinancialSummaryForExport(): any {
    const summary = this.financialSummary();
    return {
      'البيان': 'الملخص المالي',
      'إجمالي المشتريات': this.toArabicNumbers(summary?.total_purchases || 0),
      'إجمالي المبيعات': this.toArabicNumbers(summary?.total_revenue || 0),
      'تكاليف المركبات': this.toArabicNumbers(summary?.vehicle_costs || 0),
      'التكاليف الأخرى': this.toArabicNumbers(summary?.other_costs || 0),
      'الخسائر علينا': this.toArabicNumbers(summary?.lossesWithoutFarm || 0),
      'الخسائر على المزارع': this.toArabicNumbers(summary?.lossesWithFarm || 0),
      'صافي الربح': this.toArabicNumbers(summary?.net_profit || 0),
      'هامش الربح': this.formatPercentage(summary?.profit_margin_percentage) || '٠٫٠٠٪'
    };
  }

  private prepareFarmTransactionsForExport(): any[] {
    return this.filteredFarmTransactions().map(tx => ({
      'رقم التسلسل': this.toArabicNumbers(tx.sequence_number),
      'المزرعة': tx.farm?.name,
      'نوع الفراخ': tx.chicken_type?.name,
      'المركبة': tx.vehicle?.name,
      'صافي الوزن (كجم)': this.toArabicNumbers(tx.weighing.net_chicken_weight.toFixed(2)),
      'سعر الكيلو (جنيه)': this.toArabicNumbers(tx.pricing.price_per_kg.toFixed(2)),
      'إجمالي المبلغ (جنيه)': this.toArabicNumbers(tx.pricing.total_amount.toFixed(2)),
      'المدفوع (جنيه)': this.toArabicNumbers(tx.pricing.paid_amount.toFixed(2)),
      'المتبقي (جنيه)': this.toArabicNumbers(tx.pricing.remaining_amount.toFixed(2)),
      'حالة الدفع': tx.debt_info.status,
      'التاريخ': this.formatDateTime(tx.transaction_time)
    }));
  }

  private prepareSalesForExport(): any[] {
    return this.filteredSales().map(sale => ({
      'رقم التسلسل': this.toArabicNumbers(sale.sequence_number),
      'محل الفراخ': sale.buyer?.name,
      'نوع الفراخ': sale.chicken_type?.name,
      'المركبة': sale.vehicle?.name,
      // 'صافي الوزن (كجم)': this.toArabicNumbers(sale.weighing.net_chicken_weight.toFixed(2)),
      // 'سعر الكيلو (جنيه)': this.toArabicNumbers(sale.pricing.price_per_kg.toFixed(2)),
      // 'إجمالي المبلغ (جنيه)': this.toArabicNumbers(sale.pricing.total_amount.toFixed(2)),
      // 'المدفوع (جنيه)': this.toArabicNumbers(sale.pricing.paid_amount.toFixed(2)),
      // 'المتبقي (جنيه)': this.toArabicNumbers(sale.pricing.remaining_amount.toFixed(2)),
      // 'حالة الدفع': sale.debt_info.status,
      'التاريخ': this.formatDateTime(sale.transaction_time)
    }));
  }

  private prepareCostsForExport(): any[] {
    const costs: any[] = [];
    this.filteredCosts().forEach(category => {
      category.costs.forEach(cost => {
        costs.push({
          'الفئة': category.category_info.name,
          'الوصف': cost.cost_details.description,
          'المبلغ (جنيه)': this.toArabicNumbers(cost.cost_details.amount.toFixed(2)),
          'المركبة': cost.vehicle?.name || 'مشترك',
          'نوع التكلفة': category.category_info.is_vehicle_cost ? 'تكلفة مركبة' : 'تكلفة أخرى',
          'التاريخ': this.formatDateTime(cost.recorded_at)
        });
      });
    });
    return costs;
  }

  private prepareLossesForExport(): any[] {
    return this.filteredLosses().map(loss => ({
      'نوع الفراخ': loss.chicken_type?.name,
      'المركبة': loss.vehicle.name,
      'الوزن الميت (كجم)': this.toArabicNumbers(loss.loss_details.dead_weight.toFixed(2)),
      'السعر (جنيه/كجم)': this.toArabicNumbers(loss.loss_details.price_per_kg.toFixed(2)),
      'قيمة الخسارة (جنيه)': this.toArabicNumbers(loss.loss_details.loss_amount.toFixed(2)),
      'الموقع': loss.loss_details.location,
      'المزرعة المسؤولة': loss.farm_responsibility.is_farm_responsible ? loss.farm_responsibility.farm?.name : 'لا يوجد',
      'ملاحظة المسؤولية': loss.farm_responsibility.note || '',
      'التاريخ': this.formatDateTime(loss.recorded_at)
    }));
  }

  private prepareDebtMovementsForExport(): any[] {
    const movements: any[] = [];

    // إضافة مدفوعات المزارع
    this.farmDebtPayments().forEach(payment => {
      movements.push({
        'النوع': 'مدفوعات المزارع',
        'الاسم': payment.farm?.name || '',
        'المبلغ (جنيه)': this.toArabicNumbers(payment.payment_details.amount.toFixed(2)),
        'الاتجاه': payment.payment_details.direction_arabic,
        'الشرح': payment.payment_details.explanation,
        'الرصيد الحالي (جنيه)': this.toArabicNumbers((payment.farm?.current_balance || 0).toFixed(2)),
        // Using balance_type from API - NO component calculation
        'حالة الرصيد': payment.farm?.display_balance || payment.farm?.balance_type || '-',
        'ملاحظات': payment.notes || '',
        'التاريخ': this.formatDateTime(payment.payment_date)
      });
    });

    // إضافة مدفوعات محلات الفراخ
    this.buyerDebtPayments().forEach(payment => {
      movements.push({
        'النوع': 'مدفوعات محلات الفراخ',
        'الاسم': payment.buyer?.name || '',
        'المبلغ (جنيه)': this.toArabicNumbers(payment.payment_details.amount.toFixed(2)),
        'الاتجاه': 'سداد دين',
        'الشرح': payment.payment_details.explanation,
        'الرصيد الحالي (جنيه)': this.toArabicNumbers((payment.buyer?.current_balance || 0).toFixed(2)),
        // Using balance_type/display_balance from API - NO component calculation
        'حالة الرصيد': payment.buyer?.display_balance || payment.buyer?.balance_type || '-',
        'ملاحظات': payment.notes || '',
        'التاريخ': this.formatDateTime(payment.payment_date)
      });
    });

    return movements;
  }

  private prepareProfitDistributionForExport(): any[] {
    const distribution = this.profitDistribution();
    if (!distribution) return [];

    const data: any[] = [];

    // إضافة ملخص الإجماليات
    data.push({
      'القسم': '===== الإجماليات =====',
      'البيان': 'إجمالي الإيرادات',
      'القيمة (جنيه)': this.toArabicNumbers(distribution.totals.total_revenue.toFixed(2)),
      'النسبة': '',
      'ملاحظات': ''
    });

    data.push({
      'القسم': '',
      'البيان': 'إجمالي المشتريات',
      'القيمة (جنيه)': this.toArabicNumbers(distribution.totals.total_purchases.toFixed(2)),
      'النسبة': '',
      'ملاحظات': ''
    });

    data.push({
      'القسم': '',
      'البيان': 'إجمالي التكاليف',
      'القيمة (جنيه)': this.toArabicNumbers(distribution.totals.total_costs.toFixed(2)),
      'النسبة': '',
      'ملاحظات': ''
    });

    data.push({
      'القسم': '',
      'البيان': 'إجمالي الخسائر',
      'القيمة (جنيه)': this.toArabicNumbers(distribution.totals.total_losses.toFixed(2)),
      'النسبة': '',
      'ملاحظات': ''
    });

    data.push({
      'القسم': '',
      'البيان': 'صافي الربح',
      'القيمة (جنيه)': this.toArabicNumbers(distribution.totals.net_profit.toFixed(2)),
      'النسبة': '',
      'ملاحظات': ''
    });

    // إضافة فراغ
    data.push({
      'القسم': '',
      'البيان': '',
      'القيمة (جنيه)': '',
      'النسبة': '',
      'ملاحظات': ''
    });

    // إضافة توزيع أرباح الشركاء
    data.push({
      'القسم': '===== توزيع أرباح الشركاء =====',
      'البيان': '',
      'القيمة (جنيه)': '',
      'النسبة': '',
      'ملاحظات': ''
    });

    distribution.partner_profits.forEach(partner => {
      const partnerType = partner.partner?.is_vehicle_partner ? 'شريك مركبة' : 'شريك عام';

      data.push({
        'القسم': 'شريك',
        'البيان': partner.partner?.name || '',
        'القيمة (جنيه)': '',
        'النسبة': this.toArabicNumbers((partner.partner?.investment_percentage || 0).toFixed(2)) + '٪',
        'ملاحظات': partnerType
      });

      data.push({
        'القسم': '',
        'البيان': '  - حصة الربح الأساسية',
        'القيمة (جنيه)': this.toArabicNumbers(partner.base_profit_share.toFixed(2)),
        'النسبة': '',
        'ملاحظات': ''
      });

      if (partner.vehicle_cost_share > 0) {
        data.push({
          'القسم': '',
          'البيان': '  - حصة تكاليف المركبة',
          'القيمة (جنيه)': '- ' + this.toArabicNumbers(partner.vehicle_cost_share.toFixed(2)),
          'النسبة': '',
          'ملاحظات': ''
        });
      }

      data.push({
        'القسم': '',
        'البيان': '  ► الربح النهائي',
        'القيمة (جنيه)': this.toArabicNumbers(partner.final_profit.toFixed(2)),
        'النسبة': this.toArabicNumbers(Number(partner.profit_percentage).toFixed(2)) + '٪ من الربح الكلي',
        'ملاحظات': ''
      });

      // إضافة فراغ بين الشركاء
      data.push({
        'القسم': '',
        'البيان': '',
        'القيمة (جنيه)': '',
        'النسبة': '',
        'ملاحظات': ''
      });
    });

    // إضافة تاريخ الحساب
    data.push({
      'القسم': 'معلومات إضافية',
      'البيان': 'تاريخ الحساب',
      'القيمة (جنيه)': '',
      'النسبة': '',
      'ملاحظات': this.formatDateTime(distribution.calculated_at)
    });

    return data;
  }

  // REMOVED: getBalanceDescription() - now uses display_balance or balance_type from API
}
