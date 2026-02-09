// import { Component, OnInit, inject, signal, computed, effect } from '@angular/core';
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
// import { BuyerService } from '../../../../core/services/buyer.service';
// import { ChickenTypeService } from '../../../../core/services/chicken-type.service';
// import { Buyer, ChickenType, Vehicle } from '../../../../core/models';
// import { toSignal } from '@angular/core/rxjs-interop';
// import { VehicleService } from '../../../../core/services/vehicle.service';
// import { MatIconModule } from '@angular/material/icon';


// @Component({
//   selector: 'app-sales',
//   imports: [ CommonModule,
//     ReactiveFormsModule,
//     MatCardModule,
//     MatFormFieldModule,
//     MatInputModule,
//     MatSelectModule,
//     MatButtonModule,
//     MatSnackBarModule,
//     MatProgressSpinnerModule,
//     MatDividerModule,MatIconModule],
//   templateUrl: './sales.html',
//   styleUrl: './sales.css',
// })
// export class Sales implements OnInit {
//   private fb = inject(FormBuilder);
//   private route = inject(ActivatedRoute);
//   private router = inject(Router);
//   private operationService = inject(OperationService);
//   private buyerService:BuyerService = inject(BuyerService);
//   private chickenTypeService = inject(ChickenTypeService);
//   private vehicleService = inject(VehicleService);
//   private snackBar = inject(MatSnackBar);

//   loading = signal(false);
//   submitting = signal(false);
//   buyers = signal<Buyer[]>([]);
//   chickenTypes = signal<ChickenType[]>([]);
//   activeVehicles = signal<Vehicle[]>([]);
//   operationId = signal<number>(0);
//   selectedBuyerDebt = signal<number>(0);
//   saleForm = this.fb.nonNullable.group({
//     vehicle_id: [null, Validators.required],
//     buyer_id: [null as number | null, Validators.required],
//     chicken_type_id: [null as number | null, Validators.required],
//     loaded_cages_weight: [0, [Validators.required, Validators.min(0)]],
//     empty_cages_weight: [0, [Validators.required, Validators.min(0)]],
//     cage_count: [0, [Validators.required, Validators.min(0)]],
//     price_per_kg: [0, [Validators.required, Validators.min(0)]],
//     paid_amount: [0, [Validators.required, Validators.min(0)]],
//     old_debt_paid: [0, [Validators.min(0)]]
//   });
// formValue = toSignal(
//   this.saleForm.valueChanges,
//   { initialValue: this.saleForm.getRawValue() }
// );
//   // Computed signals
//   netSaleWeight = computed(() => {
//     const form = this.formValue();
//     const loaded = form.loaded_cages_weight || 0;
//     const empty = form.empty_cages_weight || 0;
//     return Math.max(0, loaded - empty);
//   });

//   totalSaleAmount = computed(() => {
//     const price = this.formValue().price_per_kg || 0;
//     return this.netSaleWeight() * price;
//   });

//   remainingSaleAmount = computed(() => {
//     const paid = this.formValue().paid_amount || 0;
//     return Math.max(0, this.totalSaleAmount() - paid);
//   });

//   newTotalDebt = computed(() => {
//     const oldDebt = this.selectedBuyerDebt();
//     const oldDebtPaid = this.formValue().old_debt_paid || 0;
//     const newDebt = this.remainingSaleAmount();
//     return Math.max(0, oldDebt - oldDebtPaid + newDebt);
//   });

//   ngOnInit(): void {
//     this.operationId.set(+this.route.snapshot.params['id']);
//     this.loadData();
//   }

//   loadData(): void {
//     this.loading.set(true);
//     Promise.all([
//       this.buyerService.getAll().toPromise(),
//       this.chickenTypeService.getAll().toPromise(),
//        this.operationService.getOperation(this.operationId()).toPromise()
//     ]).then(([buyers, types,operation]:any[]) => {
//       this.buyers.set(buyers.data || []);
//       this.chickenTypes.set(types.data || []);
//       this.activeVehicles.set(operation?.data.vehicles || []);

//       this.loading.set(false);
//     }).catch(() => {
//       this.snackBar.open('فشل تحميل البيانات', 'حسناً', { duration: 3000 });
//       this.loading.set(false);
//     });
//   }

//   onBuyerChange(): void {
//     const buyerId = this.saleForm.get('buyer_id')?.value;
//     if (buyerId) {
//       const buyer = this.buyers().find(b => b.id === buyerId);
//       this.selectedBuyerDebt.set(buyer?.total_debt || 0);
//     } else {
//       this.selectedBuyerDebt.set(0);
//     }
//   }

//   onSubmit(): void {
//     if (this.saleForm.invalid) return;

//     this.submitting.set(true);
//     const payload = this.saleForm.getRawValue();

//     this.operationService.recordSale(this.operationId(), payload as any).subscribe({
//       next: (result) => {
//         this.snackBar.open('تم تسجيل البيع بنجاح', 'حسناً', { duration: 3000 });
//         this.router.navigate(['/operations/daily', this.operationId()]);
//       },
//       error: (error) => {
//         this.submitting.set(false);
//         this.snackBar.open(
//           error.error?.message || 'فشل تسجيل البيع',
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
// src/app/features/daily-operations/sales/sales.component.ts
import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { BuyerService } from '../../../../core/services/buyer.service';
import { ChickenTypeService } from '../../../../core/services/chicken-type.service';
import { Buyer, ChickenType, Vehicle } from '../../../../core/models';
import { ReportUtilitiesService } from '../../../../core/services/ReportUtilitiesService';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [
    CommonModule,
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
    MatSlideToggleModule
  ],
  templateUrl: './sales.html',
  styleUrl: './sales.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Sales implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private operationService = inject(OperationService);
  private buyerService = inject(BuyerService);
  private chickenTypeService = inject(ChickenTypeService);
  private snackBar = inject(MatSnackBar);

  // ============================================
  // SIGNALS
  // ============================================
  loading = signal(false);
  submitting = signal(false);
  buyers = signal<Buyer[]>([]);
  chickenTypes = signal<ChickenType[]>([]);
  activeVehicles = signal<Vehicle[]>([]);
  operationId = signal<number>(0);
  selectedBuyerDebt = signal<number>(0);

  // ✅ NEW: Debt payment only mode
  isDebtPaymentOnly = signal<boolean>(false);

  // ============================================
  // FORM
  // ============================================
  saleForm = this.fb.nonNullable.group({
    // Payment mode toggle
    is_debt_payment_only: [false],

    // Sale fields (required for normal mode)
    vehicle_id: [null as number | null],
    chicken_type_id: [null as number | null],
    loaded_cages_weight: [0],
    empty_cages_weight: [0],
    cage_count: [0],
    price_per_kg: [0],
    paid_amount: [0],

    // Buyer selection (always required)
    buyer_id: [null as number | null, Validators.required],

    // Old debt payment (conditional)
    old_debt_paid: [0, [Validators.min(0)]]
  });

  // ============================================
  // COMPUTED VALUES
  // ============================================

  formValue = toSignal(
    this.saleForm.valueChanges.pipe(
      startWith(this.saleForm.getRawValue())
    ),
    { initialValue: this.saleForm.getRawValue() }
  );

  // ✅ Dynamic validation based on mode
  ngAfterViewInit() {
    this.saleForm.get('is_debt_payment_only')?.valueChanges.subscribe(isDebtOnly => {
      this.isDebtPaymentOnly.set(isDebtOnly);
      this.updateFormValidation(isDebtOnly);
    });
  }

  netSaleWeight = computed(() => {
    if (this.isDebtPaymentOnly()) return 0;

    const form = this.formValue();
    const loaded = form.loaded_cages_weight || 0;
    const empty = form.empty_cages_weight || 0;
    return Math.max(0, loaded - empty);
  });

  totalSaleAmount = computed(() => {
    if (this.isDebtPaymentOnly()) return 0;

    const price = this.formValue().price_per_kg || 0;
    return this.netSaleWeight() * price;
  });

  remainingSaleAmount = computed(() => {
    if (this.isDebtPaymentOnly()) return 0;

    const paid = this.formValue().paid_amount || 0;
    return Math.max(0, this.totalSaleAmount() - paid);
  });

  // ✅ Calculate new debt after transaction
  newTotalDebt = computed(() => {
    const oldDebt = this.selectedBuyerDebt();
    const oldDebtPaid = this.formValue().old_debt_paid || 0;

    if (this.isDebtPaymentOnly()) {
      // Debt payment only: reduce debt by payment amount
      return Math.max(0, oldDebt - oldDebtPaid);
    } else {
      // Normal sale: add new debt, subtract payment
      const newDebt = this.remainingSaleAmount();
      return Math.max(0, oldDebt - oldDebtPaid + newDebt);
    }
  });

  // ✅ Show payment field conditions
  shouldShowPaymentField = computed(() => {
    return this.selectedBuyerDebt() > 0;
  });

  // ✅ Get max payment amount
  maxPaymentAmount = computed(() => {
    return this.selectedBuyerDebt();
  });

  // ✅ Payment field is required in debt-only mode
  isPaymentRequired = computed(() => {
    return this.isDebtPaymentOnly() && this.selectedBuyerDebt() > 0;
  });
private utils = inject(ReportUtilitiesService);
 formatCurrency = (amount: number | undefined | null) => this.utils.formatCurrency(amount);
formatNumber = (num: number | undefined | null |string, decimals?: number) => this.utils.formatNumber(num, decimals);
formatPercentage = (value: number | undefined | null, decimals?: number) => this.utils.formatPercentage(value, decimals);
formatDateTime = (date: string | Date | undefined | null) => this.utils.formatDateTime(date);

  // ============================================
  // LIFECYCLE
  // ============================================

  ngOnInit(): void {
    this.operationId.set(+this.route.snapshot.params['id']);
    this.loadData();
  }

  // ============================================
  // FORM VALIDATION UPDATE
  // ============================================

  updateFormValidation(isDebtOnly: boolean): void {
    const vehicleControl = this.saleForm.get('vehicle_id');
    const chickenTypeControl = this.saleForm.get('chicken_type_id');
    const priceControl = this.saleForm.get('price_per_kg');
    const paymentControl = this.saleForm.get('old_debt_paid');

    if (isDebtOnly) {
      // Debt payment only: Remove sale field requirements
      vehicleControl?.clearValidators();
      chickenTypeControl?.clearValidators();
      priceControl?.clearValidators();

      // Make payment required
      paymentControl?.setValidators([Validators.required, Validators.min(0.01)]);

      // Reset sale fields
      this.saleForm.patchValue({
        vehicle_id: null,
        chicken_type_id: null,
        loaded_cages_weight: 0,
        empty_cages_weight: 0,
        cage_count: 0,
        price_per_kg: 0,
        paid_amount: 0
      });
    } else {
      // Normal sale: Require sale fields
      vehicleControl?.setValidators([Validators.required]);
      chickenTypeControl?.setValidators([Validators.required]);
      priceControl?.setValidators([Validators.required, Validators.min(0)]);

      // Make payment optional
      paymentControl?.setValidators([Validators.min(0)]);
    }

    vehicleControl?.updateValueAndValidity();
    chickenTypeControl?.updateValueAndValidity();
    priceControl?.updateValueAndValidity();
    paymentControl?.updateValueAndValidity();
  }

  // ============================================
  // DATA LOADING
  // ============================================

  loadData(): void {
    this.loading.set(true);

    Promise.all([
      this.buyerService.getAll().toPromise(),
      this.chickenTypeService.getAll().toPromise(),
      this.operationService.getOperation(this.operationId()).toPromise()
    ]).then(([buyersRes, typesRes, operationRes]: any[]) => {
      this.buyers.set(buyersRes?.data || []);
      this.chickenTypes.set(typesRes?.data || []);

      if (operationRes?.data) {
        const vehicles = operationRes.data.vehicle_operations
          ?.filter((vo: any) => vo.status === 'ACTIVE')
          ?.map((vo: any) => vo.vehicle) || [];

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

  onVehicleChange(event: any): void {
    const vehicleId = event.value;
    console.log('Selected vehicle:', vehicleId);
  }

  onBuyerChange(): void {
    const buyerId = this.saleForm.get('buyer_id')?.value;
    if (buyerId) {
      const buyer = this.buyers().find(b => b.id === buyerId);
      this.selectedBuyerDebt.set(buyer?.total_debt || 0);
    } else {
      this.selectedBuyerDebt.set(0);
    }

    // Reset payment when buyer changes
    this.saleForm.patchValue({ old_debt_paid: 0 });
  }

  // ============================================
  // FORM SUBMISSION
  // ============================================

  onSubmit(): void {
    if (this.saleForm.invalid) {
      this.snackBar.open('يرجى ملء جميع الحقول المطلوبة', 'حسناً', { duration: 3000 });
      return;
    }

    // Validate old debt payment
    const oldDebtPaid = this.saleForm.get('old_debt_paid')?.value || 0;
    const maxPayment = this.maxPaymentAmount();

    if (oldDebtPaid > maxPayment) {
      this.snackBar.open(
        `المبلغ المدفوع لا يمكن أن يتجاوز ${maxPayment.toFixed(2)} جنيه`,
        'حسناً',
        { duration: 3000 }
      );
      return;
    }

    // Check if debt payment only requires payment
    if (this.isDebtPaymentOnly() && oldDebtPaid === 0) {
      this.snackBar.open('يرجى إدخال مبلغ الدفع', 'حسناً', { duration: 3000 });
      return;
    }

    // Check if buyer has debt for debt payment
    if (this.isDebtPaymentOnly() && this.selectedBuyerDebt() === 0) {
      this.snackBar.open('محل الفراخ ليس لديه ديون لتسديدها', 'حسناً', { duration: 3000 });
      return;
    }

    this.submitting.set(true);
    const payload = this.buildPayload();

    this.operationService.recordSale(this.operationId(), payload as any).subscribe({
      next: (result) => {
        this.submitting.set(false);

        const isDebtOnly = this.isDebtPaymentOnly();
        let message = isDebtOnly
          ? 'تم تسجيل الدفع بنجاح'
          : 'تم تسجيل البيع بنجاح';

        if (result.data?.balance_info) {
          const balanceInfo = result.data.balance_info;
          message += `\nالدين الجديد: ${balanceInfo.new_balance.toFixed(2)} جنيه`;

          if (balanceInfo.is_settled) {
            message += '\n✅ تم تسوية الحساب بالكامل';
          }
        }

        this.snackBar.open(message, 'حسناً', { duration: 4000 });
        this.router.navigate(['/operations/daily', this.operationId()]);
      },
      error: (error) => {
        this.submitting.set(false);
        console.error('Error recording sale:', error);

        const errorMessage = error.error?.message || 'فشل تسجيل العملية';
        this.snackBar.open(errorMessage, 'حسناً', { duration: 3000 });
      }
    });
  }

  // ✅ Build payload based on mode
  buildPayload(): any {
    const formValue = this.saleForm.getRawValue();

    if (this.isDebtPaymentOnly()) {
      // Debt payment only
      return {
        buyer_id: formValue.buyer_id!,
        old_debt_paid: formValue.old_debt_paid || 0,
        is_debt_payment_only: true
      };
    } else {
      // Normal sale with optional payment
      return {
        vehicle_id: formValue.vehicle_id!,
        buyer_id: formValue.buyer_id!,
        chicken_type_id: formValue.chicken_type_id!,
        loaded_cages_weight: formValue.loaded_cages_weight || 0,
        empty_cages_weight: formValue.empty_cages_weight || 0,
        cage_count: formValue.cage_count || 0,
        price_per_kg: formValue.price_per_kg || 0,
        paid_amount: formValue.paid_amount || 0,
        old_debt_paid: formValue.old_debt_paid || 0,
        is_debt_payment_only: false
      };
    }
  }

  cancel(): void {
    this.router.navigate(['/operations/daily', this.operationId()]);
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  getSubmitButtonText(): string {
    return this.isDebtPaymentOnly() ? 'تسجيل الدفع' : 'تسجيل البيع';
  }

  getDebtWarningMessage(): string {
  const debtRaw = this.selectedBuyerDebt();
  const debt = Number(debtRaw) || 0;

  if (debt > 0) {
    return `⚠️ محل الفراخ لديه دين سابق: ${debt.toFixed(2)} جنيه`;
  }

  return '';
}

}
