// import { Component, OnInit, inject, signal, computed } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { MatCardModule } from '@angular/material/card';
// import { MatTableModule } from '@angular/material/table';
// import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
// import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
// import { MatSelectModule } from '@angular/material/select';
// import { MatChipsModule } from '@angular/material/chips';
// import { MatIconModule } from '@angular/material/icon';
// import { MatButtonModule } from '@angular/material/button';
// import { ReportService } from '../../../../core/services/report.service';
// import { Vehicle } from '../../../../core/models';
// // ✅ Match backend response structure
// interface FarmDebt {
//   id: number;
//   name: string;
//   total_debt: number;
//   vehicle_id?: number;  // ✅ NEW: Which vehicle owes this debt
//   vehicle?: Vehicle;
// }

// interface BuyerDebt {
//   id: number;
//   name: string;
//   total_debt: number;
//   vehicle_id?: number;  // ✅ NEW: Which vehicle this debt is from
//   vehicle?: Vehicle;
// }

// interface DebtReportData {
//   farms: FarmDebt[];
//   buyers: BuyerDebt[];
//   vehicles: Vehicle[];  // ✅ NEW: Vehicles used in operations
//   farms_count: number;
//   buyers_count: number;
//   total_farm_debt: number;
//   total_buyer_debt: number;
// }

// // ✅ Per-vehicle debt summary (mirrors VehicleSummary from DailyReport)
// interface VehicleDebtSummary {
//   vehicle: Vehicle;
//   farm_debts: FarmDebt[];
//   buyer_debts: BuyerDebt[];
//   total_farm_debt: number;
//   total_buyer_debt: number;
//   net_debt: number;  // farm_debt - buyer_debt
// }

// @Component({
//   selector: 'app-debt-report',
//   imports: [CommonModule,
//     MatCardModule,
//     MatTableModule,
//     MatButtonModule,
//     MatProgressSpinnerModule,
//     MatSelectModule,
//     MatChipsModule,
//     MatIconModule,
//     MatSnackBarModule
// ],
//   templateUrl: './debt-report.html',
//   styleUrl: './debt-report.css',
// })
// export class DebtReport implements OnInit {
//   private reportService = inject(ReportService);
//   private snackBar = inject(MatSnackBar);

//   loading = signal(false);
//   debtData = signal<DebtReportData | null>(null);

//   // ✅ COPY from DailyReport: Selected vehicle filter
//   selectedVehicleId = signal<number | null>(null);

//   // ✅ COPY from DailyReport: Available vehicles
//   vehicles = computed(() => {
//     return this.debtData()?.vehicles || [];
//   });

//   // ✅ COPY from DailyReport: Per-vehicle summaries
//   vehicleSummaries = computed(() => {
//     const data = this.debtData();
//     if (!data) return [];

//     return this.calculateVehicleDebtSummaries(data);
//   });

//   // ✅ COPY from DailyReport: Filtered data based on selected vehicle
//   filteredFarmDebts = computed(() => {
//     const vehicleId = this.selectedVehicleId();
//     const data = this.debtData();

//     if (!data || !data.farms) return [];
//     if (!vehicleId) return data.farms;

//     // ✅ Show vehicle-specific debts OR shared debts (no vehicle_id)
//     return data.farms.filter(debt =>
//       debt.vehicle_id === vehicleId || !debt.vehicle_id
//     );
//   });

//   filteredBuyerDebts = computed(() => {
//     const vehicleId = this.selectedVehicleId();
//     const data = this.debtData();

//     if (!data || !data.buyers) return [];
//     if (!vehicleId) return data.buyers;

//     // ✅ Show vehicle-specific debts OR shared debts (no vehicle_id)
//     return data.buyers.filter(debt =>
//       debt.vehicle_id === vehicleId || !debt.vehicle_id
//     );
//   });

//   // ✅ Computed totals for filtered view
//   filteredTotalFarmDebt = computed(() => {
//     return this.sumByField(this.filteredFarmDebts(), 'total_debt');
//   });

//   filteredTotalBuyerDebt = computed(() => {
//     return this.sumByField(this.filteredBuyerDebts(), 'total_debt');
//   });

//   // ✅ Table columns with vehicle column
//   farmColumns = ['vehicle', 'name', 'debt'];
//   buyerColumns = ['vehicle', 'name', 'debt'];

//   ngOnInit(): void {
//     this.loadDebts();
//   }

//   loadDebts(): void {
//     this.loading.set(true);

//     Promise.all([
//       this.reportService.getFarmDebts().toPromise(),
//       this.reportService.getBuyerDebts().toPromise()
//     ]).then(([farmsResponse, buyersResponse]: any[]) => {
//       // ✅ Combine responses into single data structure
//       const combinedData: DebtReportData = {
//         farms: farmsResponse.data.farms || [],
//         buyers: buyersResponse.data.buyers || [],
//         vehicles: farmsResponse.data.vehicles || buyersResponse.data.vehicles || [],
//         farms_count: farmsResponse.data.farms_count || 0,
//         buyers_count: buyersResponse.data.buyers_count || 0,
//         total_farm_debt: farmsResponse.data.total_debt || 0,
//         total_buyer_debt: buyersResponse.data.total_debt || 0
//       };
//       console.log("combinedData :",combinedData);

//       this.debtData.set(combinedData);
//       this.loading.set(false);

//       // ✅ Reset filter when data loads
//       this.selectedVehicleId.set(null);
//     })
//     .catch((error) => {
//       this.snackBar.open('فشل تحميل التقرير', 'حسناً', { duration: 3000 });
//       this.loading.set(false);
//       console.error('Error loading debts:', error);
//     });
//   }

//   // ✅ COPY from DailyReport: Calculate per-vehicle summaries
//   private calculateVehicleDebtSummaries(data: DebtReportData): VehicleDebtSummary[] {
//     if (!data.vehicles || data.vehicles.length === 0) return [];

//     return data.vehicles.map(vehicle => {
//       // Filter debts by vehicle (include shared debts for all vehicles)
//       const vehicleFarmDebts = (data.farms || [])
//         .filter(debt => debt.vehicle_id === vehicle.id || !debt.vehicle_id);
//       const vehicleBuyerDebts = (data.buyers || [])
//         .filter(debt => debt.vehicle_id === vehicle.id || !debt.vehicle_id);

//       // Calculate totals
//       const total_farm_debt = this.sumByField(vehicleFarmDebts, 'total_debt');
//       const total_buyer_debt = this.sumByField(vehicleBuyerDebts, 'total_debt');

//       // ✅ Net debt = what we owe (farms) - what they owe us (buyers)
//       const net_debt = total_farm_debt - total_buyer_debt;

//       return {
//         vehicle,
//         farm_debts: vehicleFarmDebts,
//         buyer_debts: vehicleBuyerDebts,
//         total_farm_debt,
//         total_buyer_debt,
//         net_debt
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
// }
// debt-report.component.ts
import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DebtReportService } from '../../../../core/services/DebtReport.service';
import { Buyer, Farm, FarmDebtSummary, StatementDialogData } from '../../../../core/models';
import { StatementDialog } from '../statement-dialog/statement-dialog';
import { MatChipsModule } from '@angular/material/chips';
import * as XLSX from 'xlsx';
import { ReportUtilitiesService } from '../../../../core/services/ReportUtilitiesService';

@Component({
  selector: 'app-debt-report',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    MatBadgeModule,
    MatDialogModule,
    MatChipsModule
  ],
  templateUrl: './debt-report.html',
  styleUrls: ['./debt-report.scss']
})
export class DebtReport implements OnInit {
  private debtService = inject(DebtReportService);
  private dialog = inject(MatDialog);

  // Farm debt signals
  farmLoading = signal(false);
  farmError = signal<string | null>(null);
  farmSummary = signal<FarmDebtSummary | null>(null);
  farmReceivables = signal<Farm[]>([]);
  farmPayables = signal<Farm[]>([]);
  private readonly utils = inject(ReportUtilitiesService);

  // Buyer debt signals
  buyerLoading = signal(false);
  buyerError = signal<string | null>(null);
  buyerTotalDebt = signal(0);
  buyerCount = signal(0);
  buyers = signal<Buyer[]>([]);

  // Computed values
  hasReceivables = computed(() => this.farmReceivables().length > 0);
  hasPayables = computed(() => this.farmPayables().length > 0);
  hasBuyerDebts = computed(() => this.buyers().length > 0);

  // Table columns
  farmColumns = ['name', 'phone', 'balance', 'actions'];
  buyerColumns = ['name', 'phone', 'debt', 'actions'];
 formatNumber = (num: number | undefined | null |string, decimals?: number) => this.utils.formatNumber(num, decimals);
formatPercentage = (value: number | undefined | null, decimals?: number) => this.utils.formatPercentage(value, decimals);
formatDateTime = (date: string | Date | undefined | null) => this.utils.formatDateTime(date);

  ngOnInit(): void {
    this.loadFarmDebts();
    this.loadBuyerDebts();
  }

  loadFarmDebts(): void {
    this.farmLoading.set(true);
    this.farmError.set(null);

    this.debtService.getFarmBalances().subscribe({
      next: (response) => {
        if (response.success) {
          this.farmSummary.set(response.data.summary);
          this.farmReceivables.set(response.data.receivables.farms);
          this.farmPayables.set(response.data.payables.farms);
        }
        this.farmLoading.set(false);
      },
      error: (err) => {
        this.farmError.set(err.message);
        this.farmLoading.set(false);
      }
    });
  }

  loadBuyerDebts(): void {
    this.buyerLoading.set(true);
    this.buyerError.set(null);

    this.debtService.getBuyerDebts().subscribe({
      next: (response) => {
        if (response.success) {
          this.buyerTotalDebt.set(response.data.total_debt);
          this.buyerCount.set(response.data.buyers_count);
          this.buyers.set(response.data.buyers);
        }
        this.buyerLoading.set(false);
      },
      error: (err) => {
        this.buyerError.set(err.message);
        this.buyerLoading.set(false);
      }
    });
  }

  refreshFarmData(): void {
    this.loadFarmDebts();
  }

  refreshBuyerData(): void {
    this.loadBuyerDebts();
  }
openFarmStatement(farm: Farm): void {
  const dialogData: StatementDialogData = {
    entityType: 'farm',
    entityId: farm.id,
    entityName: farm.name,
    currentBalance: farm.current_balance
  };

  this.dialog.open(StatementDialog, {
    width: '95vw',
    maxWidth: '1200px',
    height: '90vh',
    data: dialogData,
    direction: 'rtl',
    panelClass: 'statement-dialog-panel'
  });
}

// للمشترين
openBuyerStatement(buyer: Buyer): void {
  const dialogData: StatementDialogData = {
    entityType: 'buyer',
    entityId: buyer.id,
    entityName: buyer.name,
    currentBalance: buyer.total_debt
  };

  this.dialog.open(StatementDialog, {
    width: '95vw',
    maxWidth: '1200px',
    height: '90vh',
    data: dialogData,
    direction: 'rtl',
    panelClass: 'statement-dialog-panel'
  });
}

 formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ar-EG', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}
  getBalanceTypeClass(balanceType: string): string {
    return balanceType.toLowerCase();
  }

  getBalanceTypeLabel(balanceType: string): string {
    const labels: { [key: string]: string } = {
      'RECEIVABLE': 'مطلوب منهم',
      'PAYABLE': 'مطلوب لهم',
      'SETTLED': 'مسدد'
    };
    return labels[balanceType] || balanceType;
  }

  abs(value: number): number {
    return Math.abs(value);
  }

  /**
   * تصدير تقرير ديون المزارع إلى Excel بالعربية
   */
  exportFarmDebtsToExcel(): void {
    const summary = this.farmSummary();
    const receivables = this.farmReceivables();
    const payables = this.farmPayables();

    if (!summary) {
      console.error('لا توجد بيانات للتصدير');
      return;
    }

    const wb = XLSX.utils.book_new();

    // ===== Sheet 1: الملخص العام =====
    const summaryData: any[][] = [
      ['تقرير ديون المزارع'],
      ['التاريخ: ' + this.formatDateTime(new Date())],
      [],
      ['الملخص المالي'],
      [],
      ['البيان', 'المبلغ'],
      ['إجمالي المطلوب منهم', this.formatCurrency(summary.total_receivables) + ' جنيه'],
      ['عدد المزارع المدينة', summary.receivables_count.toString()],
      [],
      ['إجمالي المطلوب لهم', this.formatCurrency(summary.total_payables) + ' جنيه'],
      ['عدد المزارع الدائنة', summary.payables_count.toString()],
      [],
      ['صافي الموقف', this.formatCurrency(summary.net_position) + ' جنيه'],
      ['الحالة', summary.net_position > 0 ? 'لصالحنا' : summary.net_position < 0 ? 'علينا' : 'متوازن']
    ];

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    wsSummary['!cols'] = [{ wch: 25 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, 'الملخص');

    // ===== Sheet 2: المزارع المدينة =====
    if (receivables.length > 0) {
      const receivablesData: any[][] = [
        ['المزارع المدينة (مطلوب منهم)'],
        [],
        ['اسم المزرعة', 'رقم الهاتف', 'المبلغ المطلوب', 'نوع الرصيد']
      ];

      receivables.forEach(farm => {
        receivablesData.push([
          farm.name,
          farm.phone || '-',
          this.formatCurrency(farm.current_balance) + ' جنيه',
          this.getBalanceTypeLabel(farm.balance_type || 'RECEIVABLE')
        ]);
      });

      // إضافة صف الإجمالي
      receivablesData.push([]);
      receivablesData.push([
        'الإجمالي',
        '',
        this.formatCurrency(summary.total_receivables) + ' جنيه',
        ''
      ]);

      const wsReceivables = XLSX.utils.aoa_to_sheet(receivablesData);
      wsReceivables['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 20 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, wsReceivables, 'المطلوب منهم');
    }

    // ===== Sheet 3: المزارع الدائنة =====
    if (payables.length > 0) {
      const payablesData: any[][] = [
        ['المزارع الدائنة (مطلوب لهم)'],
        [],
        ['اسم المزرعة', 'رقم الهاتف', 'المبلغ المطلوب', 'نوع الرصيد']
      ];

      payables.forEach(farm => {
        payablesData.push([
          farm.name,
          farm.phone || '-',
          this.formatCurrency(Math.abs(farm.current_balance)) + ' جنيه',
          this.getBalanceTypeLabel(farm.balance_type || 'PAYABLE')
        ]);
      });

      // إضافة صف الإجمالي
      payablesData.push([]);
      payablesData.push([
        'الإجمالي',
        '',
        this.formatCurrency(summary.total_payables) + ' جنيه',
        ''
      ]);

      const wsPayables = XLSX.utils.aoa_to_sheet(payablesData);
      wsPayables['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 20 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, wsPayables, 'المطلوب لهم');
    }

    // حفظ الملف
    const fileName = `تقرير_ديون_المزارع_${this.formatDateForFileName(new Date())}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }

  /**
   * تصدير تقرير ديون المشترين إلى Excel بالعربية
   */
  exportBuyerDebtsToExcel(): void {
    const buyers = this.buyers();
    const totalDebt = this.buyerTotalDebt();
    const count = this.buyerCount();

    if (buyers.length === 0) {
      console.error('لا توجد بيانات للتصدير');
      return;
    }

    const wb = XLSX.utils.book_new();

    // ===== Sheet 1: الملخص =====
    const summaryData: any[][] = [
      ['تقرير ديون المشترين'],
      ['التاريخ: ' + this.formatDateTime(new Date())],
      [],
      ['الملخص'],
      [],
      ['إجمالي ديون المشترين', this.formatCurrency(totalDebt) + ' جنيه'],
      ['عدد المشترين المدينين', count.toString()],
      []
    ];

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    wsSummary['!cols'] = [{ wch: 25 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, 'الملخص');

    // ===== Sheet 2: قائمة المشترين =====
    const buyersData: any[][] = [
      ['قائمة المشترين المدينين'],
      [],
      ['اسم المشتري', 'رقم الهاتف', 'العنوان', 'المبلغ المستحق', 'حالة الدين']
    ];

    buyers.forEach(buyer => {
      buyersData.push([
        buyer.name,
        buyer.phone || '-',
        buyer.address || '-',
        this.formatCurrency(buyer.total_debt) + ' جنيه',
        buyer.debt_status || 'مدين'
      ]);
    });

    // إضافة صف الإجمالي
    buyersData.push([]);
    buyersData.push([
      'الإجمالي',
      '',
      '',
      this.formatCurrency(totalDebt) + ' جنيه',
      ''
    ]);

    const wsBuyers = XLSX.utils.aoa_to_sheet(buyersData);
    wsBuyers['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 30 }, { wch: 20 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, wsBuyers, 'المشترين');

    // حفظ الملف
    const fileName = `تقرير_ديون_المشترين_${this.formatDateForFileName(new Date())}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }



  /**
   * تنسيق التاريخ لاسم الملف
   */
  private formatDateForFileName(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
