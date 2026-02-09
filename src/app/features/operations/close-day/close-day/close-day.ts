import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { OperationService } from '../../../../core/services/operation.service';
import { DailyOperation, ProfitDistribution, VehicleOperation } from '../../../../core/models';
import { ConfirmationDialog } from '../../../../shared/components/confirmation-dialog/confirmation-dialog/confirmation-dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { MatChipsModule } from '@angular/material/chips';
import { CurrencyArabicPipe, StatusArabicPipe } from '../../../../shared/pipes';
import { ReportUtilitiesService } from '../../../../core/services/ReportUtilitiesService';
import { AuthService } from '../../../../core/services/auth.service';
import { PERMISSIONS } from '../../../../core/constants/Permissions.constant';

@Component({
  selector: 'app-close-day',
  imports: [CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatDividerModule,
    MatChipsModule,
    StatusArabicPipe,
    RouterLink
],
  templateUrl: './close-day.html',
  styleUrl: './close-day.css',
})
export class CloseDay implements OnInit {
  // private route = inject(ActivatedRoute);
  // private router = inject(Router);
  // private operationService = inject(OperationService);
  // private dialog = inject(MatDialog);
  // private snackBar = inject(MatSnackBar);

  // loading = signal(false);
  // profitData = signal<ProfitDistribution | null>(null);
  // operationId = signal<number>(0);
  // status = signal<'CLOSED' | 'OPEN'>('OPEN');

  // displayedColumns = ['partner', 'base_share', 'vehicle_cost', 'final_profit'];

  // ngOnInit(): void {
  //   this.operationId.set(+this.route.snapshot.params['id']);
  //     this.operationService.getOperation(this.operationId()).subscribe({
  //   next: (response: any) => {
  //     const operation = response.data;

  //     this.status.set(operation.status);
  //     this.profitData.set(operation.profit_distribution ?? null);
  //   },
  //   error: () => {
  //     this.snackBar.open('فشل تحميل العملية', 'حسناً', { duration: 3000 });
  //   }
  // });

  //  }

  // closeDay(): void {
  //   const dialogRef = this.dialog.open(ConfirmationDialog , {
  //     data: {
  //       title: 'إغلاق اليوم',
  //       message: 'هل أنت متأكد من إغلاق اليوم؟ لن تتمكن من إضافة معاملات جديدة بعد الإغلاق.',
  //       confirmText: 'إغلاق',
  //       type: 'warning'
  //     }
  //   });

  //   dialogRef.afterClosed().subscribe((confirmed) => {
  //     if (confirmed) {
  //       this.performCloseDay();
  //     }
  //   });
  // }

  // performCloseDay(): void {
  //   this.loading.set(true);
  //   this.operationService.closeDay(this.operationId()).subscribe({
  //     next: (response:any) => {

  //       this.profitData.set(response.data);
  //       this.loading.set(false);
  //       this.status.set('CLOSED');
  //       this.snackBar.open('تم إغلاق اليوم بنجاح', 'حسناً', { duration: 3000 });
  //     },
  //     error: (err:HttpErrorResponse) => {
  //       this.loading.set(false);
  //       this.snackBar.open('فشل إغلاق اليوم', 'حسناً', { duration: 3000 });
  //     }
  //   });
  // }

  // cancel(): void {
  //   this.router.navigate(['/operations/daily', this.operationId()]);
  // }

  // goToDashboard(): void {
  //   this.router.navigate(['/dashboard']);
  // }
//   currentOperation: DailyOperation | null = null;
//   operationId = signal<number>(0);
//   vehicleOperations: VehicleOperation[] = [];
//   vehicleColumns = ['vehicle', 'status', 'sales', 'costs', 'revenue', 'actions'];
//   isLoading = false;
//   isClosing = false;
// private route = inject(ActivatedRoute);
//   constructor(
//     private dailyOpService: OperationService,
//     private snackBar: MatSnackBar,
//     private router: Router,
//     private dialog: MatDialog
//   ) {}

//   ngOnInit() {
//  this.operationId.set(+this.route.snapshot.params['id']);
//     this.loadCurrentOperation();
//   }
// loadCurrentOperation() {
//   this.isLoading = true;
//   this.dailyOpService.getOperation(this.operationId()).subscribe({
//     next: (response: any) => {
//       this.isLoading = false;
//       console.log("data", response.data);

//       if (!response.data) {
//         this.snackBar.open('No active daily operation found', 'OK', { duration: 3000 });
//         this.currentOperation = null;
//         this.vehicleOperations = [];
//         return;
//       }

//       this.currentOperation = response.data;

//       // ✅ Transform vehicle_operations to include computed properties for the table
//       this.vehicleOperations = (response.data.vehicle_operations || []).map((vo: any) => ({
//         ...vo,
//         // Add properties expected by the HTML template
//         vehicle_name: vo.vehicle?.name || 'Unknown',
//         vehicle_plate: vo.vehicle?.plate_number || 'N/A',
//         sales_count: vo.sale_transactions?.length || 0,
//         costs_count: vo.daily_costs?.length || 0,
//         total_revenue: this.calculateVehicleRevenue(vo),
//       }));

//       // Log status for debugging
//       console.log('Vehicle Operations:', this.vehicleOperations);
//       console.log('Can close day:', this.canCloseDay());
//     },
//     error: (error) => {
//       this.isLoading = false;
//       this.snackBar.open(' loadinErrorg operation', 'OK', { duration: 3000 });
//       console.error('Load operation error:', error);
//     }
//   });
// }

// /**
//  * Calculate revenue for a specific vehicle operation
//  */
// private calculateVehicleRevenue(vehicleOp: any): number {
//   if (!vehicleOp.sale_transactions) return 0;

//   return vehicleOp.sale_transactions.reduce(
//     (sum: number, sale: any) => sum + (sale.total_amount || 0),
//     0
//   );
// }
//   // loadCurrentOperation() {
//   //   this.isLoading = true;
//   //   this.dailyOpService.getOperation(this.operationId()).subscribe({
//   //     next: (response:any) => {
//   //       this.isLoading = false;
//   //       console.log("data",response.data);

//   //       if (!response.data) {
//   //         this.snackBar.open('No active daily operation found', 'OK', { duration: 3000 });
//   //         this.currentOperation = null;
//   //         this.vehicleOperations = [];
//   //         return;
//   //       }

//   //       this.currentOperation = response.data;
//   //       this.vehicleOperations = response.data.vehicle_operations || [];

//   //       // Log status for debugging
//   //       console.log('Vehicle Operations:', this.vehicleOperations);
//   //       console.log('Can close day:', this.canCloseDay());
//   //     },
//   //     error: (error) => {
//   //       this.isLoading = false;
//   //       this.snackBar.open('Error loading operation', 'OK', { duration: 3000 });
//   //       console.error('Load operation error:', error);
//   //     }
//   //   });
//   // }

//   /**
//    * CRITICAL: Validates ALL vehicles are completed
//    * Backend Rule: All vehicle_operations must have status='completed' before closing day
//    */
//   canCloseDay(): boolean {
//     if (!this.vehicleOperations || this.vehicleOperations.length === 0) {
//       return false;
//     }

//     // ALL vehicles must be completed
//     return this.vehicleOperations.every(vo => vo.status === 'COMPLETED');
//   }

//   /**
//    * Returns validation warnings for incomplete vehicles
//    */
//   getValidationWarnings(): string[] {
//     const warnings: string[] = [];

//     if (!this.vehicleOperations || this.vehicleOperations.length === 0) {
//       warnings.push('No vehicle operations found for this day');
//       return warnings;
//     }

//     const incompleteVehicles = this.vehicleOperations.filter(vo => vo.status !== 'COMPLETED');

//     if (incompleteVehicles.length > 0) {
//       incompleteVehicles.forEach(vo => {
//         warnings.push(`Vehicle "${vo.vehicle?.name}" (${vo.vehicle?.plate_number}) is not completed`);
//       });
//     }

//     return warnings;
//   }

//   /**
//    * Mark a specific vehicle operation as complete
//    */
//   markVehicleComplete(vehicleOperationId: number) {
//     const dialogRef = this.dialog.open(ConfirmationDialog, {
//       data: {
//         title: 'Mark Vehicle Complete',
//         message: 'Are you sure this vehicle has completed all operations for today?',
//         confirmText: 'Mark Complete',
//         type: 'primary'
//       }
//     });

//     dialogRef.afterClosed().subscribe((confirmed: boolean) => {
//       if (!confirmed) return;

//       // Backend: PUT /vehicle-operations/:id/complete
//       this.dailyOpService.markVehicleOperationComplete(vehicleOperationId).subscribe({
//         next: () => {
//           this.snackBar.open('Vehicle operation marked as complete', 'OK', { duration: 3000 });

//           // Update local state
//           const vo = this.vehicleOperations.find(v => v.id === vehicleOperationId);
//           if (vo) {
//             vo.status = 'COMPLETED';
//           }

//           // Reload to get fresh data
//           this.loadCurrentOperation();
//         },
//         error: (error) => {
//           this.snackBar.open(
//             error.error?.message || 'Error marking vehicle complete',
//             'OK',
//             { duration: 3000 }
//           );
//         }
//       });
//     });
//   }

//   /**
//    * Calculate total revenue across ALL vehicles
//    */
//   getTotalRevenue(): number {
//     // if (!this.vehicleOperations) return 0;
//     // return this.vehicleOperations.reduce((sum, vo) => sum + (vo. || 0), 0);
//     return this.currentOperation?.profit_distribution?.total_revenue ?? 0;
//   }

//   /**
//    * Calculate total costs across ALL vehicles
//    */
//   getTotalCosts(): number {
//     // if (!this.vehicleOperations) return 0;
//     // // Note: Backend should provide total_costs in VehicleOperationStatus
//     // // If not available, fetch separately or calculate from costs_count
//     // return this.vehicleOperations.reduce((sum, vo) => sum + (vo. || 0), 0);
//     return this.currentOperation?.profit_distribution?.total_costs ?? 0;

//   }

//   /**
//    * Calculate net profit across ALL vehicles
//    */
//   getNetProfit(): number {
//     // return this.getTotalRevenue() - this.getTotalCosts();
//       return this.currentOperation?.profit_distribution?.net_profit ?? 0;

//   }

//   /**
//    * CRITICAL: Close the daily operation
//    * Backend validates ALL vehicle_operations are completed
//    */
//   closeDay() {
//     // Client-side validation
//     if (!this.canCloseDay()) {
//       this.snackBar.open(
//         'Cannot close day: Some vehicles have not completed operations',
//         'OK',
//         { duration: 4000 }
//       );
//       return;
//     }

//     // Confirmation dialog
//     const dialogRef = this.dialog.open(ConfirmationDialog, {
//       data: {
//         title: 'Close Daily Operation',
//         message: `Are you sure you want to close the day?

// Summary:
// - Vehicles: ${this.vehicleOperations.length}
// - Total Revenue: ${this.getTotalRevenue()} EGP
// - Total Costs: ${this.getTotalCosts()} EGP
// - Net Profit: ${this.getNetProfit()} EGP

// This action cannot be undone.`,
//         confirmText: 'Close Day',
//         type: 'danger'
//       }
//     });

//     dialogRef.afterClosed().subscribe((confirmed: boolean) => {
//       if (!confirmed) return;

//       this.performCloseDay();
//     });
//   }

//   /**
//    * Execute close day API call
//    */
//   private performCloseDay() {
//     this.isClosing = true;

//     // Backend: POST /daily-operations/:id/close
//     // Backend validates:
//     // 1. All vehicle_operations.status = 'completed'
//     // 2. No pending transactions
//     // 3. Calculates final profit distribution
//     this.dailyOpService.closeDay(this.currentOperation!.id).subscribe({
//       next: (response:ProfitDistribution) => {
//         this.isClosing = false;

//         this.snackBar.open(
//           `Daily operation closed successfully! Net Profit: ${response.net_profit} EGP`,
//           'OK',
//           { duration: 5000 }
//         );

//         // Navigate to daily operations list or profit distribution
//         this.router.navigate(['/daily-operations']);
//       },
//       error: (error) => {
//         this.isClosing = false;

//         // Backend returns specific error if validation fails
//         const errorMessage = error.error?.message || 'Error closing day';

//         // Common backend errors:
//         // - "Some vehicle operations are not completed"
//         // - "Vehicle X has pending transactions"
//         // - "Cannot close day: No transactions recorded"

//         this.snackBar.open(errorMessage, 'OK', { duration: 5000 });

//         // Reload to get updated status
//         this.loadCurrentOperation();
//       }
//     });
//   }

//   cancel() {
//     this.router.navigate(['/daily-operations']);
//   }
// }
currentOperation: DailyOperation | null = null;
profitDistribution = signal<ProfitDistribution | null>(null);
operationId = signal<number>(0);
summary = signal<boolean>(false);
vehicleOperations: VehicleOperation[] = [];
vehicleColumns = ['vehicle', 'status', 'sales', 'costs', 'revenue','actions'];
isLoading = false;
isClosing = false;

private route = inject(ActivatedRoute);

constructor(
  private dailyOpService: OperationService,
  private snackBar: MatSnackBar,
  private router: Router,
  private dialog: MatDialog
) {}
private utils = inject(ReportUtilitiesService);
 formatCurrency = (amount: number | undefined | null) => this.utils.formatCurrency(amount);
formatNumber = (num: number | undefined | null, decimals?: number) => this.utils.formatNumber(num, decimals);
formatPercentage = (value: number | undefined | null, decimals?: number) => this.utils.formatPercentage(value, decimals);
formatDateTime = (date: string | Date | undefined | null) => this.utils.formatDateTime(date);
  private authService = inject(AuthService);

ngOnInit() {
  this.operationId.set(+this.route.snapshot.params['id']);
  this.loadCurrentOperation();

}

loadCurrentOperation() {
  this.isLoading = true;
  this.dailyOpService.getOperation(this.operationId()).subscribe({
    next: (response: any) => {
      this.isLoading = false;
      console.log("data", response.data);

      if (!response.data) {
        this.snackBar.open('لم يتم العثور على عملية يومية نشطة', 'حسناً', { duration: 3000 });
        this.currentOperation = null;
        this.vehicleOperations = [];
        this.profitDistribution.set(null);
        this.summary.set(false);
        return;
      }

      // ✅ Set currentOperation first
      this.currentOperation = response.data;

      // ✅ Check if day is closed AFTER setting currentOperation
      if (this.isDayClosed() && response.data.profitDistribution) {
        console.log("isDayClosed", response.data.profitDistribution);
        this.profitDistribution.set(response.data.profitDistribution); // ✅ Use .set()
        this.summary.set(true);
      } else {
        this.profitDistribution.set(null);
        this.summary.set(false);
      }

      // ✅ Transform vehicle_operations
      this.vehicleOperations = (response.data.vehicle_operations || []).map((vo: any) => ({
        ...vo,
        vehicle_name: vo.vehicle?.name || 'غير معروف',
        vehicle_plate: vo.vehicle?.plate_number || 'غير متاح',
        sales_count: vo.sale_transactions?.length || 0,
        costs_count: vo.daily_costs?.length || 0,
        total_revenue: this.calculateVehicleRevenue(vo),
        total_costs: this.calculateVehicleCosts(vo),
      }));

      console.log('Vehicle Operations:', this.vehicleOperations);
      console.log('Can close day:', this.canCloseDay());
      console.log('Profit Distribution:', this.profitDistribution());
    },
    error: (error) => {
      this.isLoading = false;
      this.snackBar.open('خطأ في تحميل العملية', 'حسناً', { duration: 3000 });
      console.error('Load operation error:', error);
    }
  });
}

/**
 * Calculate revenue for a specific vehicle operation
 */
private calculateVehicleRevenue(vehicleOp: any): number {
  if (!vehicleOp.sale_transactions) return 0;

  return vehicleOp.sale_transactions.reduce(
    (sum: number, sale: any) => sum + Number(sale.total_amount || 0),
    0
  );
}


/**
 * Calculate costs for a specific vehicle operation
 */
private calculateVehicleCosts(vehicleOp: any): number {
  if (!vehicleOp.daily_costs) return 0;
  return vehicleOp.daily_costs.reduce(
    (sum: number, cost: any) => sum + (cost.amount || 0),
    0
  );
}

/**
 * ✅ COMPUTED: Total Revenue from profit distribution
 * Supports both camelCase (totalRevenue) and snake_case (total_revenue)
 */
totalRevenue = computed(() => {
  const pd = this.profitDistribution();
  if (!pd) return 0;
  return Number((pd as any).totalRevenue || (pd as any).total_revenue || 0);
});

/**
 * ✅ COMPUTED: Total Purchases from profit distribution
 * Supports both camelCase (totalPurchases) and snake_case (total_purchases)
 */
totalPurchases = computed(() => {
  const pd = this.profitDistribution();
  if (!pd) return 0;
  return Number((pd as any).totalPurchases || (pd as any).total_purchases || 0);
});

/**
 * ✅ COMPUTED: Total Costs + Losses from profit distribution
 * Supports both camelCase and snake_case
 */
private calculateGeneralTransportLosses(vehicleOps: any[]): number {
  if (!vehicleOps || vehicleOps.length === 0) return 0;

  return vehicleOps.reduce((totalLoss, vo) => {
    const voLoss = (vo.transport_losses || [])
      .filter((loss: any) => loss.farm_id == null) // Only general losses (no farm_id)
      .reduce((sum: number, loss: any) => sum + Number(loss.loss_amount || 0), 0);
    return totalLoss + voLoss;
  }, 0);
}

totalCosts = computed(() => {
  const pd = this.profitDistribution() as any;
  if (!pd) return 0;
  return Number(pd.totalCosts);
});

totalLosses= computed(() => {
  const pd = this.profitDistribution() as any;
  if (!pd) return 0;
  return Number(pd.totalLosses);
});
lossesWithFarm= computed(() => {
  const pd = this.profitDistribution() as any;
  if (!pd) return 0;
  return Number(pd.lossesWithFarm );
});
lossesWithoutFarm= computed(() => {
  const pd = this.profitDistribution() as any;
  if (!pd) return 0;
  return Number(pd.lossesWithoutFarm);
});

/**
 * ✅ COMPUTED: Net Profit from profit distribution
 * Supports both camelCase (netProfit) and snake_case (net_profit)
 */
netProfit = computed(() => {
  const pd = this.profitDistribution();
  if (!pd) return 0;
  return Number((pd as any).netProfit || (pd as any).net_profit || 0);
});

/**
 * Check if current operation is closed
 */
isDayClosed(): boolean {
  console.log("this.currentOperation?.status",this.currentOperation?.status);

  return this.currentOperation?.status === 'CLOSED';
}

/**
 * CRITICAL: Validates ALL vehicles are completed
 */
canCloseDay(): boolean {
  if (!this.vehicleOperations || this.vehicleOperations.length === 0) {
    return false;
  }
  return this.vehicleOperations.every(vo => vo.status === 'COMPLETED');
}

/**
 * Returns validation warnings for incomplete vehicles
 */
getValidationWarnings(): string[] {
  const warnings: string[] = [];

  if (!this.vehicleOperations || this.vehicleOperations.length === 0) {
    warnings.push('لم يتم العثور على عمليات مركبات لهذا اليوم');
    return warnings;
  }

  const incompleteVehicles = this.vehicleOperations.filter(vo => vo.status !== 'COMPLETED');

  if (incompleteVehicles.length > 0) {
    incompleteVehicles.forEach(vo => {
      warnings.push(`المركبة "${vo.vehicle?.name}" (${vo.vehicle?.plate_number}) غير مكتملة`);
    });
  }

  return warnings;
}

/**
 * Mark a specific vehicle operation as complete
 */
markVehicleComplete(vehicleOperationId: number) {
  const dialogRef = this.dialog.open(ConfirmationDialog, {
    data: {
      title: 'تحديد المركبة كمكتملة',
      message: 'هل أنت متأكد أن هذه المركبة أكملت جميع العمليات لهذا اليوم؟',
      confirmText: 'تحديد كمكتمل',
      type: 'primary'
    }
  });

  dialogRef.afterClosed().subscribe((confirmed: boolean) => {
    if (!confirmed) return;

    this.dailyOpService.markVehicleOperationComplete(vehicleOperationId).subscribe({
      next: () => {
        this.snackBar.open('تم تحديد عملية المركبة كمكتملة', 'حسناً', { duration: 3000 });

        // Update local state
        const vo = this.vehicleOperations.find(v => v.id === vehicleOperationId);
        if (vo) {
          vo.status = 'COMPLETED';
        }

        // Reload to get fresh data
        this.loadCurrentOperation();
      },
      error: (error) => {
        this.snackBar.open(
          error.error?.message || 'خطأ في تحديد المركبة كمكتملة',
          'حسناً',
          { duration: 3000 }
        );
      }
    });
  });
}

/**
 * CRITICAL: Close the daily operation
 */
closeDay() {
  // Client-side validation
  if (!this.canCloseDay()) {
    this.snackBar.open(
      'لا يمكن إغلاق اليوم: بعض المركبات لم تكمل العمليات',
      'حسناً',
      { duration: 4000 }
    );
    return;
  }

  // Confirmation dialog
  const dialogRef = this.dialog.open(ConfirmationDialog, {
    data: {
      title: 'إغلاق العملية اليومية',
      message: `هل أنت متأكد من رغبتك في إغلاق اليوم؟

لا يمكن التراجع عن هذا الإجراء.`,
      confirmText: 'إغلاق اليوم',
      type: 'danger'
    }
  });

  dialogRef.afterClosed().subscribe((confirmed: boolean) => {
    if (!confirmed) return;
    this.performCloseDay();
  });
}

/**
 * Execute close day API call
 */
private performCloseDay() {
  this.isClosing = true;

  this.dailyOpService.closeDay(this.currentOperation!.id).subscribe({
    next: (response: any) => {
      this.isClosing = false;
      console.log("response", response);

      // ✅ CRITICAL FIX: Use .set() instead of direct assignment
      if (response.data?.profitDistribution) {
        this.profitDistribution.set(response.data.profitDistribution);
        this.summary.set(true);

        // Update current operation status
        if (this.currentOperation) {
          this.currentOperation.status = 'CLOSED';
        }

        this.snackBar.open(
          `تم إغلاق العملية اليومية بنجاح! صافي الربح: ${this.netProfit()} جنيه`,
          'حسناً',
          { duration: 5000 }
        );
      }
    },
    error: (error) => {
      this.isClosing = false;
      const errorMessage = error.error?.message || 'خطأ في إغلاق اليوم';
      this.snackBar.open(errorMessage, 'حسناً', { duration: 5000 });
      this.loadCurrentOperation();
    }
  });
}

cancel() {
  // this.router.navigate(['/daily-operations']);
  this.router.navigate(['/operations/daily', this.operationId()]);

}
}
