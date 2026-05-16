// import { Component, OnInit, inject, signal, computed } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
// import { ActivatedRoute, Router } from '@angular/router';
// import { MatCardModule } from '@angular/material/card';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatSelectModule } from '@angular/material/select';
// import { MatButtonModule } from '@angular/material/button';
// import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
// import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
// import { MatDividerModule } from '@angular/material/divider';
// import { OperationService } from '../../../../core/services/operation.service';
// import { FarmService } from '../../../../core/services/farm.service';
// import { ChickenTypeService } from '../../../../core/services/chicken-type.service';
// import { ChickenType, Farm, Vehicle } from '../../../../core/models';
// import { toSignal } from '@angular/core/rxjs-interop';
// import { VehicleService } from '../../../../core/services/vehicle.service';
//  import { startWith } from 'rxjs';

//  @Component({
//   selector: 'app-farm-loading',
//   imports: [   CommonModule,
//     ReactiveFormsModule,
//     MatCardModule,
//     MatFormFieldModule,
//     MatInputModule,
//     MatSelectModule,
//     MatButtonModule,
//     MatSnackBarModule,
//     MatProgressSpinnerModule,
//     MatDividerModule],
//   templateUrl: './farm-loading.html',
//   styleUrl: './farm-loading.css',
// })
// export class FarmLoading implements OnInit {
//   private fb = inject(FormBuilder);
//   private route = inject(ActivatedRoute);
//   private router = inject(Router);
//   private operationService = inject(OperationService);
//   private farmService = inject(FarmService);
//   private chickenTypeService = inject(ChickenTypeService);
//   private snackBar = inject(MatSnackBar);
//   private vehicleService = inject(VehicleService);

//   loading = signal(false);
//   submitting = signal(false);
//   farms = signal<Farm[]>([]);
//   chickenTypes = signal<ChickenType[]>([]);
//   operationId = signal<number>(0);
//   activeVehicles = signal<Vehicle[]>([]);


//   loadingForm = this.fb.nonNullable.group({
//     vehicle_id: [null, Validators.required],
//     farm_id: [null as number | null, Validators.required],
//     chicken_type_id: [null as number | null, Validators.required],
//     empty_vehicle_weight: [0, [Validators.required, Validators.min(0)]],
//     cage_count: [0, [Validators.required, Validators.min(0)]],
//     cage_weight_per_unit: [15, [Validators.required, Validators.min(0)]],
//     loaded_vehicle_weight: [0, [Validators.required, Validators.min(0)]],
//     price_per_kg: [0, [Validators.required, Validators.min(0)]],
//     paid_amount: [0, [Validators.required, Validators.min(0)]]
//   });


// // 🔹 Form value as signal (reactive)
// formValue = toSignal(
//   this.loadingForm.valueChanges.pipe(
//     startWith(this.loadingForm.getRawValue())
//   ),
//   { initialValue: this.loadingForm.getRawValue() }
// );

// netWeight = computed(() => {
//   const form = this.formValue();

//   const empty = form.empty_vehicle_weight ?? 0;
//   const loaded = form.loaded_vehicle_weight ?? 0;
//   const cageCount = form.cage_count ?? 0;
//   const cageWeight = form.cage_weight_per_unit ?? 0;

//   return Math.max(0, loaded - empty - (cageCount * cageWeight));
// });

// totalAmount = computed(() => {
//   const price = this.formValue().price_per_kg ?? 0;
//   return this.netWeight() * price;
// });

// remainingAmount = computed(() => {
//   const paid = this.formValue().paid_amount ?? 0;
//   return Math.max(0, this.totalAmount() - paid);
// });


//   ngOnInit(): void {
//     this.operationId.set(+this.route.snapshot.params['id']);
//     this.loadData();
//   }

//   loadData(): void {
//     this.loading.set(true);
//     Promise.all([
//       this.farmService.getAll().toPromise(),
//       this.chickenTypeService.getAll().toPromise(),
//        this.operationService.getOperation(this.operationId()).toPromise()
//     ]).then(([farmsRes, typesRes,operation]: any[]) => {
//       console.log("op",operation);

//       this.farms.set(farmsRes?.data || []);
//       this.chickenTypes.set(typesRes?.data || []);
//       this.activeVehicles.set(operation?.data.vehicles || []);
//       this.loading.set(false);
//     }).catch(() => {
//       this.snackBar.open('فشل تحميل البيانات', 'حسناً', { duration: 3000 });
//       this.loading.set(false);
//     });
//   }

//   onSubmit(): void {
//     if (this.loadingForm.invalid) return;

//     this.submitting.set(true);
//     const payload = this.loadingForm.getRawValue();

//     this.operationService.farmLoading(this.operationId(), payload as any).subscribe({
//       next: (result) => {
//         this.snackBar.open('تم تسجيل التحميل بنجاح', 'حسناً', { duration: 3000 });
//         this.router.navigate(['/operations/daily', this.operationId()]);
//       },
//       error: (error) => {
//         this.submitting.set(false);
//         this.snackBar.open(
//           error.error?.message || 'فشل تسجيل التحميل',
//           'حسناً',
//           { duration: 3000 }
//         );
//       }
//     });
//   }

//   cancel(): void {
//     this.router.navigate(['/operations/daily', this.operationId()]);
//   }
//   onVehicleChange(event: any): void {
//   const vehicleId = event.value;
//   console.log(vehicleId)
//   // Add your logic here
//   // For example, you might want to load vehicle-specific data
//   // or update other form fields based on the selected vehicle
// }
// }

// src/app/features/daily-operations/farm-loading/farm-loading.component.ts
// import { Component, OnInit, inject, signal, computed,ChangeDetectionStrategy } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
// import { ActivatedRoute, Router } from '@angular/router';
// import { MatCardModule } from '@angular/material/card';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatSelectModule } from '@angular/material/select';
// import { MatButtonModule } from '@angular/material/button';
// import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
// import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
// import { MatDividerModule } from '@angular/material/divider';
// import { MatIconModule } from '@angular/material/icon';
// import { MatDialogModule, MatDialog } from '@angular/material/dialog';
// import { toSignal } from '@angular/core/rxjs-interop';
// import { startWith } from 'rxjs';

// import { OperationService } from '../../../../core/services/operation.service';
// import { FarmService } from '../../../../core/services/farm.service';
// import { ChickenTypeService } from '../../../../core/services/chicken-type.service';
// import {
//   ChickenType,
//   Farm,
//   Vehicle,
//   FarmLoadingRequest,
//   BalanceInfo
// } from '../../../../core/models';

// @Component({
//   selector: 'app-farm-loading',
//   standalone: true,
//   imports: [
//     CommonModule,
//     ReactiveFormsModule,
//     MatCardModule,
//     MatFormFieldModule,
//     MatInputModule,
//     MatSelectModule,
//     MatButtonModule,
//     MatSnackBarModule,
//     MatProgressSpinnerModule,
//     MatDividerModule,
//     MatIconModule,
//     MatDialogModule
//   ],
//   templateUrl: './farm-loading.html',
//   styleUrl: './farm-loading.css',
//   changeDetection: ChangeDetectionStrategy.OnPush
// })
// export class FarmLoading implements OnInit {
//   private fb = inject(FormBuilder);
//   private route = inject(ActivatedRoute);
//   private router = inject(Router);
//   private operationService = inject(OperationService);
//   private farmService = inject(FarmService);
//   private chickenTypeService = inject(ChickenTypeService);
//   private snackBar = inject(MatSnackBar);
//   private dialog = inject(MatDialog);

//   // ============================================
//   // SIGNALS
//   // ============================================
//   loading = signal(false);
//   submitting = signal(false);
//   farms = signal<Farm[]>([]);
//   chickenTypes = signal<ChickenType[]>([]);
//   operationId = signal<number>(0);
//   activeVehicles = signal<Vehicle[]>([]);
//   selectedFarm = signal<Farm | null>(null);
//   balanceWarning = signal<string | null>(null);

//   // ============================================
//   // FORM
//   // ============================================
//   loadingForm = this.fb.nonNullable.group({
//     vehicle_id: [null as number | null, Validators.required],
//     farm_id: [null as number | null, Validators.required],
//     chicken_type_id: [null as number | null, Validators.required],
//     empty_vehicle_weight: [0, [Validators.required, Validators.min(0)]],
//     cage_count: [0, [Validators.required, Validators.min(0)]],
//     cage_weight_per_unit: [15, [Validators.required, Validators.min(0)]],
//     loaded_vehicle_weight: [0, [Validators.required, Validators.min(0)]],
//     price_per_kg: [0, [Validators.required, Validators.min(0)]],
//     paid_amount: [0, [Validators.required, Validators.min(0)]]
//   });

//   // ============================================
//   // COMPUTED VALUES
//   // ============================================

//   formValue = toSignal(
//     this.loadingForm.valueChanges.pipe(
//       startWith(this.loadingForm.getRawValue())
//     ),
//     { initialValue: this.loadingForm.getRawValue() }
//   );

//   netWeight = computed(() => {
//     const form = this.formValue();
//     const empty = form.empty_vehicle_weight ?? 0;
//     const loaded = form.loaded_vehicle_weight ?? 0;
//     const cageCount = form.cage_count ?? 0;
//     const cageWeight = form.cage_weight_per_unit ?? 0;
//     return Math.max(0, loaded - empty - (cageCount * cageWeight));
//   });

//   totalAmount = computed(() => {
//     const price = this.formValue().price_per_kg ?? 0;
//     return this.netWeight() * price;
//   });

//   remainingAmount = computed(() => {
//     const paid = this.formValue().paid_amount ?? 0;
//     return Math.max(0, this.totalAmount() - paid);
//   });

//   // ============================================
//   // LIFECYCLE
//   // ============================================

//   ngOnInit(): void {
//     this.operationId.set(+this.route.snapshot.params['id']);
//     this.loadData();
//   }

//   // ============================================
//   // DATA LOADING
//   // ============================================

//   loadData(): void {
//     this.loading.set(true);

//     Promise.all([
//       this.farmService.getAll().toPromise(),
//       this.chickenTypeService.getAll().toPromise(),
//       this.operationService.getOperation(this.operationId()).toPromise()
//     ]).then(([farmsRes, typesRes, operationRes]: any[]) => {
//       // Set farms and chicken types
//       this.farms.set(farmsRes?.data || []);
//       this.chickenTypes.set(typesRes?.data || []);

//       // Set active vehicles from operation
//       if (operationRes?.data) {
//         // Extract vehicles from vehicle_operations
//         const vehicles = operationRes.data.vehicle_operations
//           ?.filter((vo: any) => vo.status === 'ACTIVE')
//           ?.map((vo: any) => vo.vehicle) || [];

//         this.activeVehicles.set(vehicles);
//       }

//       this.loading.set(false);
//     }).catch((error) => {
//       console.error('Error loading data:', error);
//       this.snackBar.open('فشل تحميل البيانات', 'حسناً', { duration: 3000 });
//       this.loading.set(false);
//     });
//   }

//   // ============================================
//   // EVENT HANDLERS
//   // ============================================

//   onVehicleChange(event: any): void {
//     const vehicleId = event.value;
//     console.log('Selected vehicle:', vehicleId);
//     // Could load vehicle-specific data or update empty weight
//   }

//   onFarmChange(event: any): void {
//     const farmId = event.value;
//     const farm = this.farms().find(f => f.id === farmId);

//     if (farm) {
//       this.selectedFarm.set(farm);

//       // Show balance info to user
//       if (farm.current_balance !== 0) {
//         const balanceDesc = this.farmService.getBalanceDescription(farm);
//         this.balanceWarning.set(balanceDesc);
//       } else {
//         this.balanceWarning.set(null);
//       }
//     }
//   }

//   // ============================================
//   // FORM SUBMISSION
//   // ============================================

//   onSubmit(): void {
//     if (this.loadingForm.invalid) {
//       this.snackBar.open('يرجى ملء جميع الحقول المطلوبة', 'حسناً', { duration: 3000 });
//       return;
//     }

//     this.submitting.set(true);
//     const payload = this.loadingForm.getRawValue() as FarmLoadingRequest;

//     this.operationService.farmLoading(this.operationId(), payload).subscribe({
//       next: (result) => {
//         this.submitting.set(false);

//         // Show success message with balance info
//         let message = 'تم تسجيل التحميل بنجاح';

//         if (result.data?.balance_info) {
//           const balanceInfo: BalanceInfo = result.data.balance_info;

//           // Add balance change to message
//           message += `\n${balanceInfo.display_balance}`;

//           // Show warning if direction changed
//           if (balanceInfo.direction_changed && balanceInfo.alert) {
//             this.snackBar.open(balanceInfo.alert, 'حسناً', {
//               duration: 5000,
//               panelClass: ['warning-snackbar']
//             });
//           }
//         }

//         this.snackBar.open(message, 'حسناً', { duration: 4000 });
//         this.router.navigate(['/operations/daily', this.operationId()]);
//       },
//       error: (error) => {
//         this.submitting.set(false);
//         console.error('Error recording farm loading:', error);

//         const errorMessage = error.error?.message || 'فشل تسجيل التحميل';
//         this.snackBar.open(errorMessage, 'حسناً', { duration: 3000 });
//       }
//     });
//   }

//   cancel(): void {
//     this.router.navigate(['/operations/daily', this.operationId()]);
//   }

//   // ============================================
//   // UTILITY METHODS
//   // ============================================

//   getBalanceTypeClass(farm: Farm): string {
//     return this.farmService.getBalanceColorClass(farm);
//   }

//   formatBalance(farm: Farm): string {
//     return this.farmService.formatBalance(farm);
//   }
// }
// src/app/features/daily-operations/farm-loading/farm-loading.component.ts
// src/app/features/daily-operations/farm-loading/farm-loading.component.ts
import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy, effect } from '@angular/core';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';

import { OperationService } from '../../../../core/services/operation.service';
import { FarmService } from '../../../../core/services/farm.service';
import { ChickenTypeService } from '../../../../core/services/chicken-type.service';
import {
  ChickenType,
  Farm,
  Vehicle,
  FarmLoadingRequest,
  BalanceInfo,
} from '../../../../core/models';
import { ReportUtilitiesService } from '../../../../core/services/ReportUtilitiesService';
import { PersonSelectorComponent } from '../../../../shared/components/person-selector/person-selector.component';
import { PaymentSourceSelectorComponent } from '../../../../shared/components/payment-source-selector/payment-source-selector.component';
import { PaymentSourceSelection } from '../../../../models/custody.models';

@Component({
  selector: 'app-farm-loading',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatIconModule,
    MatSlideToggleModule,
    PersonSelectorComponent,
    PaymentSourceSelectorComponent
],
  templateUrl: './farm-loading.html',
  styleUrl: './farm-loading.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
  export class FarmLoading implements OnInit {
    private fb = inject(FormBuilder);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private operationService = inject(OperationService);
    private farmService = inject(FarmService);
    private chickenTypeService = inject(ChickenTypeService);
    private snackBar = inject(MatSnackBar);
    private utils = inject(ReportUtilitiesService);

    constructor() {
      effect(() => {
        console.log('Balance:', this.selectedFarmBalance());
        console.log('Total paid:', this.formValue().total_paid);
        console.log('Debt only:', this.isDebtPaymentOnly());
        console.log('Final remaining:', this.finalRemainingAmount());
        console.log('Projected balance:', this.projectedBalance());

        // Check current values
console.log('paymentSourceAmount:', this.paymentSourceAmount());
console.log('paymentSource:', this.paymentSource());
console.log('isPaymentSourceValid:', this.isPaymentSourceValid());

      });
      this.loadingForm.get('payment_method')?.valueChanges.subscribe(value => {
    const safeControl = this.loadingForm.get('safe_id');

        if (value) {
          safeControl?.setValidators([Validators.required]);
        } else {
          safeControl?.clearValidators();
        }

        safeControl?.updateValueAndValidity();
      });
    }

    // ============================================
    // SIGNALS
    // ============================================
    loading = signal(false);
    submitting = signal(false);
    farms = signal<Farm[]>([]);
    chickenTypes = signal<ChickenType[]>([]);
    operationId = signal<number>(0);
    activeVehicles = signal<Vehicle[]>([]);
    paymentSource = signal<PaymentSourceSelection | null>(null);

    // Farm balance tracking
    selectedFarmBalance = signal<number>(0);
    selectedFarmBalanceType = signal<'RECEIVABLE' | 'PAYABLE' | 'SETTLED'>('SETTLED');

    // ============================================
    // FORM
    // ============================================
    loadingForm = this.fb.nonNullable.group({
      // Payment mode toggle
      is_debt_payment_only: [false],

      // Loading fields (required for normal mode)
      vehicle_id: [null as number | null],
      chicken_type_id: [null as number | null],
      empty_vehicle_weight: [0],
      cage_count: [0],
      cage_weight_per_unit: [15],
      loaded_vehicle_weight: [0],
      price_per_kg: [0],

      // NEW: unified payment input (replaces paid_amount)
      total_paid: [0, [Validators.min(0)]],

      // NEW: discount
      discount_amount: [0, [Validators.min(0)]],

      // Farm selection (always required)
      farm_id: [null as number | null, Validators.required],

      // Old balance payment (debt-only mode)
      old_balance_paid: [0, [Validators.min(0)]],

      // NEW: payment metadata (DEFAULT SAFE/CASH)
      payment_method: ['CASH', Validators.required],
      safe_id: [null as number | null],
      person_type: [null as string | null],
      paid_by_person_id: [null as number | null]
    });



    // ============================================
    // FORM VALUE SIGNAL
    // ============================================
    formValue = toSignal(
      this.loadingForm.valueChanges.pipe(
        startWith(this.loadingForm.getRawValue())
      ),
      { initialValue: this.loadingForm.getRawValue() }
    );

    // ============================================
    // COMPUTED: MODE
    // ============================================
    isDebtPaymentOnly = computed(() => {
      return !!this.formValue().is_debt_payment_only;
    });

    // ============================================
    // COMPUTED: WEIGHT & PRICING
    // ============================================
    netWeight = computed(() => {
      if (this.isDebtPaymentOnly()) return 0;
      const form = this.formValue();
      const empty = form.empty_vehicle_weight ?? 0;
      const loaded = form.loaded_vehicle_weight ?? 0;
      const cageCount = form.cage_count ?? 0;
      const cageWeight = form.cage_weight_per_unit ?? 0;
      return Math.max(0, loaded - empty - (cageCount * cageWeight));
    });

    /** Subtotal before discount */
    subtotalAmount = computed(() => {
      if (this.isDebtPaymentOnly()) return 0;
      const price = this.formValue().price_per_kg ?? 0;
      return this.netWeight() * price;
    });

    discountAmount = computed(() => {
      if (this.isDebtPaymentOnly()) return 0;
      return Math.max(0, this.formValue().discount_amount ?? 0);
    });

    /** Total after discount */
    totalAmount = computed(() => {
      return Math.max(0, this.subtotalAmount() - this.discountAmount());
    });

    // ============================================
    // COMPUTED: PAYMENT SPLIT
    // ============================================

    /** How much of total_paid covers this invoice */
    paidForTransaction = computed(() => {
      if (this.isDebtPaymentOnly()) return 0;
      const totalPaid = this.formValue().total_paid ?? 0;
      // return Math.min(totalPaid, this.totalAmount());
      return  totalPaid ;
    });

    /** Surplus beyond invoice total — goes toward old balance */
  surplusAppliedToDebt = computed(() => {
    if (this.isDebtPaymentOnly()) return 0;

    const totalPaid = this.formValue().total_paid ?? 0;
    const surplus = Math.max(0, totalPaid - this.totalAmount());
    const farmBalance = this.selectedFarmBalance();

    // ✅ لو المزرعة مدينة لنا (RECEIVABLE) أو رصيد صفر:
    // الزيادة كلها تتحسب — مفيش cap، لأنها فلوس دفعناها زيادة
    if (farmBalance >= 0) return surplus;

    // ✅ لو نحن مدينين للمزرعة (PAYABLE):
    // الزيادة تقدر تسدد جزء من دينا عليها بس، مش أكتر من الدين
    return Math.min(surplus, Math.abs(farmBalance));
  });


    /** Remaining on the invoice before credit auto-application */
    private rawRemainingAmount = computed(() => {
      if (this.isDebtPaymentOnly()) return 0;
      return Math.max(0, this.totalAmount() - this.paidForTransaction());
    });

    /**
     * running balance after old_balance_paid adjustment (debt-only uses old_balance_paid directly).
     * For normal mode it uses surplusAppliedToDebt.
     */
    private runningBalance = computed(() => {
      const current = this.selectedFarmBalance();
      if (this.isDebtPaymentOnly()) {
        const paid = this.formValue().old_balance_paid ?? 0;
        if (current > 0) return current - paid;
        if (current < 0) return current + paid;
        return 0;
      }
      const surplus = this.surplusAppliedToDebt();
      return current + surplus;

    });

    /** Credit auto-applied from RECEIVABLE balance to offset remaining debt */
    usedCreditDisplay = computed(() => {
      if (this.isDebtPaymentOnly()) return 0;
      const rb = this.runningBalance();
      const remaining = this.rawRemainingAmount();
      if (rb > 0 && remaining > 0) {
        return Math.min(rb, remaining);
      }
      return 0;
    });

    /** Final remaining after credit auto-application */
    finalRemainingAmount = computed(() => {
      if (this.isDebtPaymentOnly()) return 0;
      return Math.max(0, this.rawRemainingAmount() - this.usedCreditDisplay());
    });

    // ============================================
    // COMPUTED: PROJECTED BALANCE
    // ============================================
  //  projectedBalance = computed(() => {
  //   const currentBalance = this.selectedFarmBalance();

  //   if (this.isDebtPaymentOnly()) {
  //     return this.runningBalance();
  //   }

  //   const oldBalancePaid = this.surplusAppliedToDebt(); // ✅ بعد الفيكس، دايمًا 0 لو balance < 0
  //   const totalPaid = this.formValue().total_paid ?? 0;
  //   const rawSurplus = Math.max(0, totalPaid - this.totalAmount());
  //   const remaining = this.rawRemainingAmount();

  //   let debtPaymentImpact = 0;
  //   if (oldBalancePaid > 0) {
  //     // ✅ بعد الفيكس، هنا بس هيدخل لو balance > 0 (RECEIVABLE)
  //     debtPaymentImpact = -oldBalancePaid; // يقلل ما تدين لنا المزرعة
  //   }

  //   const rb = currentBalance + debtPaymentImpact;
  //   const usedCredit = rb > 0 && remaining > 0 ? Math.min(rb, remaining) : 0;
  //   const finalRemaining = remaining - usedCredit;

  //   const netSurplus = Math.max(0, rawSurplus - oldBalancePaid);

  //   return currentBalance + debtPaymentImpact - usedCredit - finalRemaining + netSurplus;
  // });

  projectedBalance = computed(() => {
    const currentBalance = this.selectedFarmBalance();

    if (this.isDebtPaymentOnly()) {
      return this.runningBalance();
    }
    const totalPaid = this.formValue().total_paid ?? 0;
    const surplus = Math.max(0, totalPaid - this.totalAmount());

    const remaining = this.rawRemainingAmount();

    // ✅ الزيادة دايمًا بتزيد ما تدين لنا المزرعة (أو بتقلل دينا عليها)
    const afterSurplus = currentBalance + surplus;

    // لو الرصيد موجب والفاتورة فيها متبقي → استخدم الرصيد تلقائيًا
    const usedCredit = afterSurplus > 0 && remaining > 0
      ? Math.min(afterSurplus, remaining)
      : 0;

    const finalRemaining = remaining - usedCredit;

    // المتبقي من الفاتورة → يزيد دينا على المزرعة (يقلل الرصيد)
    return afterSurplus - usedCredit - finalRemaining;
  });

    // ============================================
    // COMPUTED: DISPLAY CONDITIONS
    // ============================================
    shouldShowPaymentField = computed(() => {
      return +this.selectedFarmBalance() !== 0;
    });
    paymentSourceAmount = computed(() => {
      if (this.isDebtPaymentOnly()) {
        return this.formValue().old_balance_paid ?? 0;
      }
      return this.formValue().total_paid ?? 0;
    });
    currentPersonType = computed(() => (this.formValue().person_type as 'EMPLOYEE' | 'PARTNER' | null) ?? null);
    currentPersonId = computed(() => this.formValue().paid_by_person_id ?? null);
    isPaymentSourceValid = computed(() => this.paymentSourceAmount() <= 0 || this.paymentSource() !== null);

    maxPaymentAmount = computed(() => {
      return Math.abs(this.selectedFarmBalance());
    });

    isPaymentRequired = computed(() => {
      return this.isDebtPaymentOnly() && this.selectedFarmBalance() !== 0;
    });

    creditAutoApplied = computed(() => {
      return this.usedCreditDisplay() > 0;
    });

    // ============================================
    // UTILITIES
    // ============================================
    formatCurrency = (amount: number | undefined | null) => this.utils.formatCurrency(amount);
    formatNumber = (num: number | undefined | null | string, decimals?: number) => this.utils.formatNumber(num, decimals);
    formatPercentage = (value: number | undefined | null, decimals?: number) => this.utils.formatPercentage(value, decimals);
    formatDateTime = (date: string | Date | undefined | null) => this.utils.formatDateTime(date);

    // ============================================
    // LIFECYCLE
    // ============================================
    ngOnInit(): void {
      this.operationId.set(+this.route.snapshot.params['id']);
      this.loadData();
      this.loadingForm.get('farm_id')?.valueChanges.subscribe(() => {
        this.onFarmChange();
      });
    }

    ngAfterViewInit(): void {
      this.loadingForm.get('is_debt_payment_only')?.valueChanges.subscribe(isDebtOnly => {
        this.updateFormValidation(isDebtOnly);
      });
    }

    // ============================================
    // FORM VALIDATION UPDATE
    // ============================================
    updateFormValidation(isDebtOnly: boolean): void {
      const vehicleControl = this.loadingForm.get('vehicle_id');
      const chickenTypeControl = this.loadingForm.get('chicken_type_id');
      const priceControl = this.loadingForm.get('price_per_kg');
      const paymentControl = this.loadingForm.get('old_balance_paid');
      const discountControl = this.loadingForm.get('discount_amount');

      if (isDebtOnly) {
        vehicleControl?.clearValidators();
        chickenTypeControl?.clearValidators();
        priceControl?.clearValidators();
        discountControl?.clearValidators();
        paymentControl?.setValidators([Validators.required, Validators.min(0.01)]);

        this.loadingForm.patchValue({
          vehicle_id: null,
          chicken_type_id: null,
          empty_vehicle_weight: 0,
          cage_count: 0,
          cage_weight_per_unit: 15,
          loaded_vehicle_weight: 0,
          price_per_kg: 0,
          total_paid: 0,
          discount_amount: 0
        });
      } else {
        vehicleControl?.setValidators([Validators.required]);
        chickenTypeControl?.setValidators([Validators.required]);
        priceControl?.setValidators([Validators.required, Validators.min(0)]);
        discountControl?.setValidators([Validators.min(0)]);
        paymentControl?.setValidators([Validators.min(0)]);
      }

      vehicleControl?.updateValueAndValidity();
      chickenTypeControl?.updateValueAndValidity();
      priceControl?.updateValueAndValidity();
      paymentControl?.updateValueAndValidity();
      discountControl?.updateValueAndValidity();
    }

    // ============================================
    // DATA LOADING
    // ============================================
    loadData(): void {
      this.loading.set(true);

      Promise.all([
        this.farmService.getAll().toPromise(),
        this.chickenTypeService.getAll().toPromise(),
        this.operationService.getOperation(this.operationId()).toPromise()
      ]).then(([farmsRes, typesRes, operationRes]: unknown[]) => {
        const farms = farmsRes as { data?: Farm[] };
        const types = typesRes as { data?: ChickenType[] };
        const operation = operationRes as { data?: { vehicle_operations?: { status: string; vehicle: Vehicle }[] } };

        this.farms.set(farms?.data || []);
        this.chickenTypes.set(types?.data || []);

        if (operation?.data) {
          const vehicles = operation.data.vehicle_operations
            ?.filter(vo => vo.status === 'ACTIVE')
            ?.map(vo => vo.vehicle) || [];
          this.activeVehicles.set(vehicles);
        }

        this.loading.set(false);
      }).catch((error) => {
        console.error('Error loading data:', error);
        this.snackBar.open('فشل تحميل البيانات', 'حسناً', { duration: 3000 });
        this.loading.set(false);
      });
    }

    // ============================================
    // EVENT HANDLERS
    // ============================================
    onVehicleChange(event: { value: number }): void {
      console.log('Selected vehicle:', event.value);
    }

    onFarmChange(): void {
      const farmId = this.loadingForm.get('farm_id')?.value;
      if (farmId) {
        const farm = this.farms().find(f => f.id === farmId);
        if (farm) {
          this.selectedFarmBalance.set(Number(farm.current_balance) || 0);

          if (farm.current_balance > 0) {
            this.selectedFarmBalanceType.set('RECEIVABLE');
          } else if (farm.current_balance < 0) {
            this.selectedFarmBalanceType.set('PAYABLE');
          } else {
            this.selectedFarmBalanceType.set('SETTLED');
          }

          this.loadingForm.patchValue({ old_balance_paid: 0 }, { emitEvent: true });
        }
      } else {
        this.selectedFarmBalance.set(0);
        this.selectedFarmBalanceType.set('SETTLED');
      }
    }

    // ============================================
    // FORM SUBMISSION
    // ============================================
    onSubmit(): void {
      if (this.loadingForm.invalid) {
        this.snackBar.open('يرجى ملء جميع الحقول المطلوبة', 'حسناً', { duration: 3000 });
        return;
      }
      if (!this.isPaymentSourceValid()) {
        this.snackBar.open('يجب اختيار مصدر الدفع', 'حسناً', { duration: 3000 });
        return;
      }

      // Validate discount does not exceed subtotal
      if (!this.isDebtPaymentOnly() && this.discountAmount() > this.subtotalAmount()) {
        this.snackBar.open(
          `الخصم (${this.formatCurrency(this.discountAmount())}) لا يمكن أن يتجاوز الإجمالي قبل الخصم (${this.formatCurrency(this.subtotalAmount())})`,
          'حسناً',
          { duration: 4000 }
        );
        return;
      }

      // Validate old balance payment in debt-only mode
      const oldBalancePaid = this.loadingForm.get('old_balance_paid')?.value || 0;
      const maxPayment = this.maxPaymentAmount();

      // if (oldBalancePaid > maxPayment) {
      //   this.snackBar.open(
      //     `المبلغ المدفوع لا يمكن أن يتجاوز ${maxPayment.toFixed(2)} جنيه`,
      //     'حسناً',
      //     { duration: 3000 }
      //   );
      //   return;
      // }

      if (this.isDebtPaymentOnly() && oldBalancePaid === 0) {
        this.snackBar.open('يرجى إدخال مبلغ الدفع', 'حسناً', { duration: 3000 });
        return;
      }

      this.submitting.set(true);
      const payload = this.buildPayload();

      this.operationService.farmLoading(this.operationId(), payload).subscribe({
        next: (result) => {
          this.submitting.set(false);

          const isDebtOnly = this.isDebtPaymentOnly();
          let message = isDebtOnly
            ? 'تم تسجيل الدفع بنجاح'
            : 'تم تسجيل التحميل بنجاح';

          if (result.data?.balance_info) {
            const balanceInfo: BalanceInfo = result.data.balance_info;
            message += `\n${balanceInfo.display_balance}`;

            if (balanceInfo.direction_changed && balanceInfo.alert) {
              this.snackBar.open(balanceInfo.alert, 'حسناً', {
                duration: 5000,
                panelClass: ['warning-snackbar']
              });
            }
          }

          this.snackBar.open(message, 'حسناً', { duration: 4000 });
          this.router.navigate(['/operations/daily', this.operationId()]);
        },
        error: (error) => {
          this.submitting.set(false);
          console.error('Error recording farm loading:', error);
          const errorMessage = error.error?.message || 'فشل تسجيل العملية';
          this.snackBar.open(errorMessage, 'حسناً', { duration: 3000 });
        }
      });
    }

    buildPayload(): FarmLoadingRequest {
      const formValue = this.loadingForm.getRawValue();

      const paymentMetadata:any = {
        payment_method: formValue.payment_method,
        payment_source_type: this.paymentSource()?.payment_source_type ?? 'SAFE',
        payment_source_id: this.paymentSource()?.payment_source_id ?? null,
        safe_id: this.paymentSource()?.payment_source_type === 'SAFE' ? this.paymentSource()?.payment_source_id ?? null : null,
        person_type: formValue.person_type,
      };
      console.log("formValue.payment_method",formValue.payment_method);

      if (this.isDebtPaymentOnly()) {
        if(this.selectedFarmBalance()>0){
          paymentMetadata.received_by_person_id=formValue.paid_by_person_id || null
        }else{
          paymentMetadata.paid_by_person_id=formValue.paid_by_person_id || null
        }
        return {
          farm_id: formValue.farm_id!,
          old_balance_paid: formValue.old_balance_paid || 0,
          is_debt_payment_only: true,
          ...paymentMetadata,
        };
      } else {
        return {
          vehicle_id: formValue.vehicle_id!,
          farm_id: formValue.farm_id!,
          chicken_type_id: formValue.chicken_type_id!,
          empty_vehicle_weight: formValue.empty_vehicle_weight || 0,
          loaded_vehicle_weight: formValue.loaded_vehicle_weight || 0,
          cage_count: formValue.cage_count || 0,
          cage_weight_per_unit: formValue.cage_weight_per_unit || 15,
          price_per_kg: formValue.price_per_kg || 0,
          discount_amount: this.discountAmount(),
          paid_amount: this.paidForTransaction(),
          old_balance_paid: this.surplusAppliedToDebt() ,
          is_debt_payment_only: false,
          ...paymentMetadata,
          paid_by_person_id: formValue.paid_by_person_id || null
        };
      }
    }

    cancel(): void {
      this.router.navigate(['/operations/daily', this.operationId()]);
    }

    // ============================================
    // UTILITY METHODS
    // ============================================
    getBalanceTypeClass(farm: Farm) {
      return this.farmService.getBalanceColorClass(farm);
    }

    formatBalance(farm: Farm): string {
      return this.farmService.formatBalance(farm);
    }

    getBalanceWarningMessage(): string {
      const balance = this.selectedFarmBalance();
      const absBalance = Math.abs(balance);

      if (balance > 0) {
        return `⚠️ المزرعة مدينة لنا بمبلغ ${absBalance.toFixed(2)} جنيه`;
      } else if (balance < 0) {
        return `⚠️ نحن مدينون للمزرعة بمبلغ ${absBalance.toFixed(2)} جنيه`;
      }
      return '';
    }

    getOldBalancePaymentLabel(): string {
      const balanceType = this.selectedFarmBalanceType();

      if (balanceType === 'RECEIVABLE') {
        return 'استلام من المزرعة (تسديد دين سابق)';
      }
      else if (balanceType === 'PAYABLE') {
        return 'دفع للمزرعة (تسديد دين سابق)';
      }
      return 'دفع';
    }

    getOldBalancePaymentHint(): string {
      const maxAmount = this.maxPaymentAmount();
      const balanceType = this.selectedFarmBalanceType();

      if (balanceType === 'RECEIVABLE') {
        return `الحد الأقصى للاستلام: ${maxAmount.toFixed(2)} جنيه`;
      } else if (balanceType === 'PAYABLE') {
        return `الحد الأقصى للدفع: ${maxAmount.toFixed(2)} جنيه`;
      }
      return '';
    }

    getSubmitButtonText(): string {
      return this.isDebtPaymentOnly() ? 'تسجيل الدفع' : 'تسجيل التحميل';
    }

    get paymentLabel(): string {
      if (!this.isDebtPaymentOnly()) {
        return 'طريقة الدفع';
      }
      return this.selectedFarmBalanceType() !== 'RECEIVABLE' ? 'طريقة الدفع' : 'طريقة الاستلام';
    }
    get label(): string {
      if (!this.isDebtPaymentOnly()) {
        return 'مصدر الدفع';
      }
      return this.selectedFarmBalanceType() !== 'RECEIVABLE' ? 'مصدر الدفع' : 'مصدر الاستلام';
    }

    get personLabel(): string {
      if (!this.isDebtPaymentOnly()) {
        return 'الشخص الذي دفع';
      }
      return this.selectedFarmBalanceType() !== 'RECEIVABLE' ? 'الشخص الذي دفع' : 'الشخص الذي استلم';
    }

    preventNegative(event: KeyboardEvent) {
  if (event.key === '-' || event.key === '+') {
    event.preventDefault();
  }
  }

  preventPasteNegative(event: ClipboardEvent) {
    const pasted = event.clipboardData?.getData('text') || '';
    if (pasted.includes('-')) {
      event.preventDefault();
    }
  }

  // isPaymentValid = signal(true);

}
