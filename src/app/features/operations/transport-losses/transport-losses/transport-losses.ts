// import { Component, OnInit, inject, signal } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
// import { ActivatedRoute, Router } from '@angular/router';
// import { MatCardModule } from '@angular/material/card';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatSelectModule } from '@angular/material/select';
// import { MatButtonModule } from '@angular/material/button';
// import { MatSnackBar } from '@angular/material/snack-bar';
// import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
// import { OperationService } from '../../../../core/services/operation.service';
// import { ChickenTypeService } from '../../../../core/services/chicken-type.service';
// import { ChickenType, Vehicle, VehicleOperation } from '../../../../core/models';
// import { MatIconModule } from '@angular/material/icon';
// interface VehicleStats {
//   vehicle_id: number;
//   vehicle_name: string;
//   plate_number: string;
//   status: string;
//   farm_transactions_count: number;
//   sale_transactions_count: number;
//   loss_records_count: number;
//   total_loaded_kg: number;
//   total_sold_kg: number;
//   total_lost_kg: number;
//   remaining_inventory_kg: number;
// }


// @Component({
//   selector: 'app-transport-losses',
//   imports: [    CommonModule,
//     ReactiveFormsModule,
//     MatCardModule,
//     MatFormFieldModule,
//     MatInputModule,
//     MatSelectModule,
//     MatButtonModule,
//     MatProgressSpinnerModule,
//     MatIconModule
// ],
//   templateUrl: './transport-losses.html',
//   styleUrl: './transport-losses.css',
// })
// export class TransportLosses implements OnInit {
//   private fb = inject(FormBuilder);
//   private route = inject(ActivatedRoute);
//   private router = inject(Router);
//   private operationService = inject(OperationService);
//   private chickenTypeService = inject(ChickenTypeService);
//   private snackBar = inject(MatSnackBar);

//   activeVehicles = signal<VehicleStats[]>([]);

//   loading = signal(false);
//   submitting = signal(false);
//   chickenTypes = signal<ChickenType[]>([]);
//   operationId = signal<number>(0);


//  lossForm = this.fb.group({
//   vehicle_id: this.fb.control<number | null>(null, Validators.required),
//   chicken_type_id: this.fb.control<number | null>(null, Validators.required),
//   dead_weight: this.fb.control(0, { validators: [Validators.required, Validators.min(0)] }),
//   price_per_kg: this.fb.control(0, { validators: [Validators.required, Validators.min(0)] }),
//   location: this.fb.control('')
// });

//   lossAmount = signal<number>(0);

//   ngOnInit(): void {
//     this.operationId.set(+this.route.snapshot.params['id']);
//     this.loadChickenTypes();
//  this.loadActiveVehicles(); // NEW: Load vehicles for this operation
//     // Calculate loss amount when values change
//     this.lossForm.valueChanges.subscribe(() => {
//       const weight = this.lossForm.get('dead_weight')?.value || 0;
//       const price = this.lossForm.get('price_per_kg')?.value || 0;
//       this.lossAmount.set(weight * price);
//     });
//   }

//   loadChickenTypes(): void {
//     this.loading.set(true);
//     this.chickenTypeService.getAll().subscribe({
//       next: (data:any) => {
//         this.chickenTypes.set(data.data);
//         this.loading.set(false);
//       },
//       error: () => {
//         this.snackBar.open('فشل تحميل البيانات', 'حسناً', { duration: 3000 });
//         this.loading.set(false);
//       }
//     });
//   }
//  /**
//    * NEW: Load vehicles assigned to this daily operation
//    * Backend Rule: Only vehicles with active VehicleOperation for this operation
//    */
//   /**
//    * Load vehicles assigned to this daily operation
//    * Backend returns VehicleStats with vehicle_id, vehicle_name, plate_number
//    */
//   loadActiveVehicles(): void {
//     this.loading.set(true);

//     this.operationService.getOperationVehicles(this.operationId()).subscribe({
//       next: (response: any) => {
//         const vehicleStats: VehicleStats[] = response.data;
//         console.log('Vehicle stats loaded:', vehicleStats);

//         this.activeVehicles.set(vehicleStats);
//         this.loading.set(false);

//         // If no vehicles found, show warning
//         if (vehicleStats.length === 0) {
//           this.snackBar.open(
//             'لا توجد مركبات نشطة لهذه العملية',
//             'حسناً',
//             { duration: 4000 }
//           );
//           return;
//         }

//         // Auto-select if only one vehicle
//         if (vehicleStats.length === 1) {
//           queueMicrotask(() => {
//             this.lossForm.patchValue({
//               vehicle_id: vehicleStats[0].vehicle_id
//             });
//             console.log('Auto-selected vehicle ID:', vehicleStats[0].vehicle_id);
//           });
//         }
//       },
//       error: () => {
//         this.snackBar.open('فشل تحميل المركبات', 'حسناً', { duration: 3000 });
//         this.loading.set(false);
//       }
//     });
//   }

//   onSubmit(): void {
//     if (this.lossForm.invalid) {
//       // Mark all fields as touched to show validation errors
//       Object.keys(this.lossForm.controls).forEach(key => {
//         this.lossForm.get(key)?.markAsTouched();
//       });
//       return;
//     }

//     this.submitting.set(true);
//     const payload = this.lossForm.getRawValue();

//     this.operationService.recordLoss(this.operationId(), payload as any).subscribe({
//       next: () => {
//         const vehicle = this.activeVehicles().find(v => v.vehicle_id === payload.vehicle_id);
//         this.snackBar.open(
//           `تم تسجيل الخسارة للمركبة ${vehicle?.vehicle_name || ''} بنجاح`,
//           'حسناً',
//           { duration: 3000 }
//         );
//         this.router.navigate(['/operations/daily', this.operationId()]);
//       },
//       error: (error) => {
//         this.submitting.set(false);
//         const errorMsg = error.error?.message || 'فشل تسجيل الخسارة';
//         this.snackBar.open(errorMsg, 'حسناً', { duration: 4000 });
//       }
//     });
//   }

//   cancel(): void {
//     this.router.navigate(['/operations/daily', this.operationId()]);
//   }
// }

import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OperationService } from '../../../../core/services/operation.service';
import { ChickenTypeService } from '../../../../core/services/chicken-type.service';
import { FarmService } from '../../../../core/services/farm.service';
import { ChickenType, Farm } from '../../../../core/models';
import { toSignal } from '@angular/core/rxjs-interop';
import { ReportUtilitiesService } from '../../../../core/services/ReportUtilitiesService';

interface VehicleStats {
  vehicle_id: number;
  vehicle_name: string;
  plate_number: string;
  empty_weight: number;
  status: string;
  farm_transactions_count: number;
  sale_transactions_count: number;
  loss_records_count: number;
  total_loaded_kg: number;
  total_sold_kg: number;
  total_lost_kg: number;
  remaining_inventory_kg: number;
}

@Component({
  selector: 'app-transport-losses',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatCheckboxModule,
    MatTooltipModule
  ],
  templateUrl: './transport-losses.html',
  styleUrl: './transport-losses.css',
})
export class TransportLosses implements OnInit {
  protected readonly Math = Math;
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private operationService = inject(OperationService);
  private chickenTypeService = inject(ChickenTypeService);
  private farmService = inject(FarmService);
  private snackBar = inject(MatSnackBar);

  activeVehicles = signal<VehicleStats[]>([]);
  farms = signal<Farm[]>([]);
  loading = signal(false);
  submitting = signal(false);
  chickenTypes = signal<ChickenType[]>([]);
  operationId = signal<number>(0);
// ===== Farm balance (display only) =====
selectedFarmBalance = signal<number>(0);
selectedFarmBalanceType = signal<'RECEIVABLE' | 'PAYABLE' | 'SETTLED'>('SETTLED');

  lossForm = this.fb.group({
    vehicle_id: this.fb.control<number | null>(null, Validators.required),
    chicken_type_id: this.fb.control<number | null>(null, Validators.required),
    dead_weight: this.fb.control(0, {
      validators: [Validators.required, Validators.min(0.01)]
    }),
    price_per_kg: this.fb.control(0, {
      validators: [Validators.required, Validators.min(0.01)]
    }),
    location: this.fb.control(''),
    farm_id: this.fb.control<number | null>(null),
    notes: this.fb.control(''),
    isFarmResponsible: this.fb.control(false),
  });
deadWeight = toSignal(
  this.lossForm.get('dead_weight')!.valueChanges,
  { initialValue: 0 }
);

pricePerKg = toSignal(
  this.lossForm.get('price_per_kg')!.valueChanges,
  { initialValue: 0 }
);
lossAmount = computed(() => {
  return (this.deadWeight() ?? 0) * (this.pricePerKg() ?? 0);
});

  // Convert form status to signal for change detection compatibility
  private formStatus = toSignal(this.lossForm.statusChanges, {
    initialValue: this.lossForm.status
  });

  // Computed signal for form validity
  isFormInvalid = computed(() => {
    // Trigger re-computation when status changes
    this.formStatus();
    return this.lossForm.invalid;
  });

  // Computed signal for button disabled state
  isSubmitDisabled = computed(() => {
    return this.isFormInvalid() || this.submitting();
  });

private utils = inject(ReportUtilitiesService);
 formatCurrency = (amount: number | undefined | null) => this.utils.formatCurrency(amount);
formatNumber = (num: number | undefined | null |string, decimals?: number) => this.utils.formatNumber(num, decimals);
formatPercentage = (value: number | undefined | null, decimals?: number) => this.utils.formatPercentage(value, decimals);
formatDateTime = (date: string | Date | undefined | null) => this.utils.formatDateTime(date);


  constructor() {
    // Handle checkbox changes with dynamic validation
    this.lossForm.get('isFarmResponsible')?.valueChanges.subscribe(checked => {
      setTimeout(() => {
        const farmIdControl = this.lossForm.get('farm_id');

        if (checked) {
          farmIdControl?.setValidators([Validators.required]);
        } else {
          farmIdControl?.clearValidators();
          farmIdControl?.setValue(null);
        }

        farmIdControl?.updateValueAndValidity();
      });
    });
  }

  ngOnInit(): void {
    this.operationId.set(+this.route.snapshot.params['id']);
    this.loadChickenTypes();
    this.loadActiveVehicles();
    this.loadFarms();
  }

  loadChickenTypes(): void {
    this.loading.set(true);
    this.chickenTypeService.getAll().subscribe({
      next: (data: any) => {
        this.chickenTypes.set(data.data);
        this.loading.set(false);
      },
      error: () => {
        this.snackBar.open('فشل تحميل أنواع الفراخ', 'حسناً', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  loadActiveVehicles(): void {
    this.loading.set(true);

    this.operationService.getOperationVehicles(this.operationId()).subscribe({
      next: (response: any) => {
        const vehicleStats: VehicleStats[] = response.data;
        this.activeVehicles.set(vehicleStats);
        this.loading.set(false);

        if (vehicleStats.length === 0) {
          this.snackBar.open(
            'لا توجد مركبات نشطة لهذه العملية',
            'حسناً',
            { duration: 4000 }
          );
          return;
        }

        if (vehicleStats.length === 1) {
          queueMicrotask(() => {
            this.lossForm.patchValue({
              vehicle_id: vehicleStats[0].vehicle_id
            });
          });
        }
      },
      error: () => {
        this.snackBar.open('فشل تحميل المركبات', 'حسناً', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  loadFarms(): void {
    this.farmService.getAll().subscribe({
      next: (data: any) => {
        this.farms.set(data.data || []);
      },
      error: () => {
        console.error('Failed to load farms');
      }
    });
  }

  getSelectedFarm(): Farm | undefined {
    const farmId = this.lossForm.get('farm_id')?.value;
    return this.farms().find(f => f.id === farmId);
  }

  onSubmit(): void {
    Object.keys(this.lossForm.controls).forEach(key => {
      this.lossForm.get(key)?.markAsTouched();
    });

    if (this.lossForm.invalid) {
      this.snackBar.open('يرجى تعبئة جميع الحقول المطلوبة', 'حسناً', { duration: 3000 });
      return;
    }

    this.submitting.set(true);
    const payload = this.lossForm.getRawValue();

    if (!payload.isFarmResponsible) {
      payload.farm_id = null;
    }

    this.operationService.recordLoss(this.operationId(), payload as any).subscribe({
      next: (response: any) => {
        const vehicle = this.activeVehicles().find(v => v.vehicle_id === payload.vehicle_id);
        let message = `تم تسجيل الخسارة للمركبة ${vehicle?.vehicle_name || ''} بنجاح`;

        if (response.data?.farm_balance_update) {
          const farmUpdate = response.data.farm_balance_update;
          message += ` - تم تحديث رصيد المزرعة: ${farmUpdate.display_balance}`;
        }

        this.snackBar.open(message, 'حسناً', { duration: 5000 });
        this.router.navigate(['/operations/daily', this.operationId()]);
      },
      error: (error) => {
        this.submitting.set(false);
        const errorMsg = error.error?.message || 'فشل تسجيل الخسارة';
        this.snackBar.open(errorMsg, 'حسناً', { duration: 4000 });
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/operations/daily', this.operationId()]);
  }
//   lossAmount = computed(() => {
//   const weight = this.lossForm.get('dead_weight')?.value ?? 0;
//   const price = this.lossForm.get('price_per_kg')?.value ?? 0;
//   return weight * price;
// });


getBalanceTypeClass(farm: Farm): string {
  const balance = farm.current_balance;
  if (balance > 0) return 'balance-receivable';
  if (balance < 0) return 'balance-payable';
  return 'balance-settled';
  }

  formatBalance(farm: Farm): string {
    return this.farmService.formatBalance(farm);
  }
 onFarmChange(): void {
  const farmId = this.lossForm.get('farm_id')?.value;

  if (!farmId) {
    this.selectedFarmBalance.set(0);
    this.selectedFarmBalanceType.set('SETTLED');
    return;
  }

  const farm = this.farms().find(f => f.id === farmId);
  if (!farm) return;

  const balance = farm.current_balance;
  this.selectedFarmBalance.set(balance);

  if (balance > 0) {
    this.selectedFarmBalanceType.set('RECEIVABLE');
  } else if (balance < 0) {
    this.selectedFarmBalanceType.set('PAYABLE');
  } else {
    this.selectedFarmBalanceType.set('SETTLED');
  }
}

}
