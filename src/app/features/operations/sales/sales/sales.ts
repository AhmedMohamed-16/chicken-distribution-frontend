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
// import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
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
// import { MatSlideToggleModule } from '@angular/material/slide-toggle';
// import { toSignal } from '@angular/core/rxjs-interop';
// import { startWith } from 'rxjs';

// import { OperationService } from '../../../../core/services/operation.service';
// import { BuyerService } from '../../../../core/services/buyer.service';
// import { ChickenTypeService } from '../../../../core/services/chicken-type.service';
// import { Buyer, ChickenType, Vehicle } from '../../../../core/models';
// import { ReportUtilitiesService } from '../../../../core/services/ReportUtilitiesService';

// @Component({
//   selector: 'app-sales',
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
//     MatSlideToggleModule
//   ],
//   templateUrl: './sales.html',
//   styleUrl: './sales.css',
//   changeDetection: ChangeDetectionStrategy.OnPush
// })
// export class Sales implements OnInit {
//   private fb = inject(FormBuilder);
//   private route = inject(ActivatedRoute);
//   private router = inject(Router);
//   private operationService = inject(OperationService);
//   private buyerService = inject(BuyerService);
//   private chickenTypeService = inject(ChickenTypeService);
//   private snackBar = inject(MatSnackBar);

//   // ============================================
//   // SIGNALS
//   // ============================================
//   loading = signal(false);
//   submitting = signal(false);
//   buyers = signal<Buyer[]>([]);
//   chickenTypes = signal<ChickenType[]>([]);
//   activeVehicles = signal<Vehicle[]>([]);
//   operationId = signal<number>(0);
//   selectedBuyerDebt = signal<number>(0);

//   // ✅ NEW: Debt payment only mode
//   isDebtPaymentOnly = signal<boolean>(false);

//   // ============================================
//   // FORM
//   // ============================================
//   saleForm = this.fb.nonNullable.group({
//     // Payment mode toggle
//     is_debt_payment_only: [false],

//     // Sale fields (required for normal mode)
//     vehicle_id: [null as number | null],
//     chicken_type_id: [null as number | null],
//     loaded_cages_weight: [0],
//     empty_cages_weight: [0],
//     cage_count: [0],
//     price_per_kg: [0],
//     paid_amount: [0],

//     // Buyer selection (always required)
//     buyer_id: [null as number | null, Validators.required],

//     // Old debt payment (conditional)
//     old_debt_paid: [0, [Validators.min(0)]]
//   });

//   // ============================================
//   // COMPUTED VALUES
//   // ============================================

//   formValue = toSignal(
//     this.saleForm.valueChanges.pipe(
//       startWith(this.saleForm.getRawValue())
//     ),
//     { initialValue: this.saleForm.getRawValue() }
//   );

//   // ✅ Dynamic validation based on mode
//   ngAfterViewInit() {
//     this.saleForm.get('is_debt_payment_only')?.valueChanges.subscribe(isDebtOnly => {
//       this.isDebtPaymentOnly.set(isDebtOnly);
//       this.updateFormValidation(isDebtOnly);
//     });
//   }

//   netSaleWeight = computed(() => {
//     if (this.isDebtPaymentOnly()) return 0;

//     const form = this.formValue();
//     const loaded = form.loaded_cages_weight || 0;
//     const empty = form.empty_cages_weight || 0;
//     return Math.max(0, loaded - empty);
//   });

//   totalSaleAmount = computed(() => {
//     if (this.isDebtPaymentOnly()) return 0;

//     const price = this.formValue().price_per_kg || 0;
//     return this.netSaleWeight() * price;
//   });

//   remainingSaleAmount = computed(() => {
//     if (this.isDebtPaymentOnly()) return 0;

//     const paid = this.formValue().paid_amount || 0;
//     return Math.max(0, this.totalSaleAmount() - paid);
//   });

//   // ✅ Calculate new debt after transaction
//   newTotalDebt = computed(() => {
//     const oldDebt = this.selectedBuyerDebt();
//     const oldDebtPaid = this.formValue().old_debt_paid || 0;

//     if (this.isDebtPaymentOnly()) {
//       // Debt payment only: reduce debt by payment amount
//       return Math.max(0, oldDebt - oldDebtPaid);
//     } else {
//       // Normal sale: add new debt, subtract payment
//       const newDebt = this.remainingSaleAmount();
//       return Math.max(0, oldDebt - oldDebtPaid + newDebt);
//     }
//   });

//   // ✅ Show payment field conditions
//   shouldShowPaymentField = computed(() => {
//     return this.selectedBuyerDebt() > 0;
//   });

//   // ✅ Get max payment amount
//   maxPaymentAmount = computed(() => {
//     return this.selectedBuyerDebt();
//   });

//   // ✅ Payment field is required in debt-only mode
//   isPaymentRequired = computed(() => {
//     return this.isDebtPaymentOnly() && this.selectedBuyerDebt() > 0;
//   });
// private utils = inject(ReportUtilitiesService);
//  formatCurrency = (amount: number | undefined | null) => this.utils.formatCurrency(amount);
// formatNumber = (num: number | undefined | null |string, decimals?: number) => this.utils.formatNumber(num, decimals);
// formatPercentage = (value: number | undefined | null, decimals?: number) => this.utils.formatPercentage(value, decimals);
// formatDateTime = (date: string | Date | undefined | null) => this.utils.formatDateTime(date);

//   // ============================================
//   // LIFECYCLE
//   // ============================================

//   ngOnInit(): void {
//     this.operationId.set(+this.route.snapshot.params['id']);
//     this.loadData();
//   }

//   // ============================================
//   // FORM VALIDATION UPDATE
//   // ============================================

//   updateFormValidation(isDebtOnly: boolean): void {
//     const vehicleControl = this.saleForm.get('vehicle_id');
//     const chickenTypeControl = this.saleForm.get('chicken_type_id');
//     const priceControl = this.saleForm.get('price_per_kg');
//     const paymentControl = this.saleForm.get('old_debt_paid');

//     if (isDebtOnly) {
//       // Debt payment only: Remove sale field requirements
//       vehicleControl?.clearValidators();
//       chickenTypeControl?.clearValidators();
//       priceControl?.clearValidators();

//       // Make payment required
//       paymentControl?.setValidators([Validators.required, Validators.min(0.01)]);

//       // Reset sale fields
//       this.saleForm.patchValue({
//         vehicle_id: null,
//         chicken_type_id: null,
//         loaded_cages_weight: 0,
//         empty_cages_weight: 0,
//         cage_count: 0,
//         price_per_kg: 0,
//         paid_amount: 0
//       });
//     } else {
//       // Normal sale: Require sale fields
//       vehicleControl?.setValidators([Validators.required]);
//       chickenTypeControl?.setValidators([Validators.required]);
//       priceControl?.setValidators([Validators.required, Validators.min(0)]);

//       // Make payment optional
//       paymentControl?.setValidators([Validators.min(0)]);
//     }

//     vehicleControl?.updateValueAndValidity();
//     chickenTypeControl?.updateValueAndValidity();
//     priceControl?.updateValueAndValidity();
//     paymentControl?.updateValueAndValidity();
//   }

//   // ============================================
//   // DATA LOADING
//   // ============================================

//   loadData(): void {
//     this.loading.set(true);

//     Promise.all([
//       this.buyerService.getAll().toPromise(),
//       this.chickenTypeService.getAll().toPromise(),
//       this.operationService.getOperation(this.operationId()).toPromise()
//     ]).then(([buyersRes, typesRes, operationRes]: any[]) => {
//       this.buyers.set(buyersRes?.data || []);
//       this.chickenTypes.set(typesRes?.data || []);

//       if (operationRes?.data) {
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
//   }

//   onBuyerChange(): void {
//     const buyerId = this.saleForm.get('buyer_id')?.value;
//     if (buyerId) {
//       const buyer = this.buyers().find(b => b.id === buyerId);
//       this.selectedBuyerDebt.set(buyer?.total_debt || 0);
//     } else {
//       this.selectedBuyerDebt.set(0);
//     }

//     // Reset payment when buyer changes
//     this.saleForm.patchValue({ old_debt_paid: 0 });
//   }

//   // ============================================
//   // FORM SUBMISSION
//   // ============================================

//   onSubmit(): void {
//     if (this.saleForm.invalid) {
//       this.snackBar.open('يرجى ملء جميع الحقول المطلوبة', 'حسناً', { duration: 3000 });
//       return;
//     }

//     // Validate old debt payment
//     const oldDebtPaid = this.saleForm.get('old_debt_paid')?.value || 0;
//     const maxPayment = this.maxPaymentAmount();

//     if (oldDebtPaid > maxPayment) {
//       this.snackBar.open(
//         `المبلغ المدفوع لا يمكن أن يتجاوز ${maxPayment.toFixed(2)} جنيه`,
//         'حسناً',
//         { duration: 3000 }
//       );
//       return;
//     }

//     // Check if debt payment only requires payment
//     if (this.isDebtPaymentOnly() && oldDebtPaid === 0) {
//       this.snackBar.open('يرجى إدخال مبلغ الدفع', 'حسناً', { duration: 3000 });
//       return;
//     }

//     // Check if buyer has debt for debt payment
//     if (this.isDebtPaymentOnly() && this.selectedBuyerDebt() === 0) {
//       this.snackBar.open('محل الفراخ ليس لديه ديون لتسديدها', 'حسناً', { duration: 3000 });
//       return;
//     }

//     this.submitting.set(true);
//     const payload = this.buildPayload();

//     this.operationService.recordSale(this.operationId(), payload as any).subscribe({
//       next: (result) => {
//         this.submitting.set(false);

//         const isDebtOnly = this.isDebtPaymentOnly();
//         let message = isDebtOnly
//           ? 'تم تسجيل الدفع بنجاح'
//           : 'تم تسجيل البيع بنجاح';

//         if (result.data?.balance_info) {
//           const balanceInfo = result.data.balance_info;
//           message += `\nالدين الجديد: ${balanceInfo.new_balance.toFixed(2)} جنيه`;

//           if (balanceInfo.is_settled) {
//             message += '\n✅ تم تسوية الحساب بالكامل';
//           }
//         }

//         this.snackBar.open(message, 'حسناً', { duration: 4000 });
//         this.router.navigate(['/operations/daily', this.operationId()]);
//       },
//       error: (error) => {
//         this.submitting.set(false);
//         console.error('Error recording sale:', error);

//         const errorMessage = error.error?.message || 'فشل تسجيل العملية';
//         this.snackBar.open(errorMessage, 'حسناً', { duration: 3000 });
//       }
//     });
//   }

//   // ✅ Build payload based on mode
//   buildPayload(): any {
//     const formValue = this.saleForm.getRawValue();

//     if (this.isDebtPaymentOnly()) {
//       // Debt payment only
//       return {
//         buyer_id: formValue.buyer_id!,
//         old_debt_paid: formValue.old_debt_paid || 0,
//         is_debt_payment_only: true
//       };
//     } else {
//       // Normal sale with optional payment
//       return {
//         vehicle_id: formValue.vehicle_id!,
//         buyer_id: formValue.buyer_id!,
//         chicken_type_id: formValue.chicken_type_id!,
//         loaded_cages_weight: formValue.loaded_cages_weight || 0,
//         empty_cages_weight: formValue.empty_cages_weight || 0,
//         cage_count: formValue.cage_count || 0,
//         price_per_kg: formValue.price_per_kg || 0,
//         paid_amount: formValue.paid_amount || 0,
//         old_debt_paid: formValue.old_debt_paid || 0,
//         is_debt_payment_only: false
//       };
//     }
//   }

//   cancel(): void {
//     this.router.navigate(['/operations/daily', this.operationId()]);
//   }

//   // ============================================
//   // UTILITY METHODS
//   // ============================================

//   getSubmitButtonText(): string {
//     return this.isDebtPaymentOnly() ? 'تسجيل الدفع' : 'تسجيل البيع';
//   }

//   getDebtWarningMessage(): string {
//   const debtRaw = this.selectedBuyerDebt();
//   const debt = Number(debtRaw) || 0;

//   if (debt > 0) {
//     return `⚠️ محل الفراخ لديه دين سابق: ${debt.toFixed(2)} جنيه`;
//   }

//   return '';
// }

// }

// import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
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
// import { MatSlideToggleModule } from '@angular/material/slide-toggle';
// import { MatDialog, MatDialogModule } from '@angular/material/dialog';
// import { toSignal } from '@angular/core/rxjs-interop';
// import { startWith } from 'rxjs';

// import { OperationService } from '../../../../core/services/operation.service';
// import { BuyerService } from '../../../../core/services/buyer.service';
// import { ChickenTypeService } from '../../../../core/services/chicken-type.service';
// import { Buyer, ChickenType, Vehicle } from '../../../../core/models';
// import { ReportUtilitiesService } from '../../../../core/services/ReportUtilitiesService';
// import { ConfirmationDialog, ConfirmationDialogData } from '../../../../shared/components/confirmation-dialog/confirmation-dialog/confirmation-dialog';


// @Component({
//   selector: 'app-sales',
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
//     MatSlideToggleModule,
//     MatDialogModule,
//     ConfirmationDialog
//   ],
//   templateUrl: './sales.html',
//   styleUrl: './sales.css',
//   changeDetection: ChangeDetectionStrategy.OnPush
// })
// export class Sales implements OnInit {
//   private fb               = inject(FormBuilder);
//   private route            = inject(ActivatedRoute);
//   private router           = inject(Router);
//   private operationService = inject(OperationService);
//   private buyerService     = inject(BuyerService);
//   private chickenTypeService = inject(ChickenTypeService);
//   private snackBar         = inject(MatSnackBar);
//   private dialog           = inject(MatDialog);

//   loading            = signal(false);
//   submitting         = signal(false);
//   buyers             = signal<Buyer[]>([]);
//   chickenTypes       = signal<ChickenType[]>([]);
//   activeVehicles     = signal<Vehicle[]>([]);
//   operationId        = signal<number>(0);
//   selectedBuyerDebt  = signal<number>(0);
//   isDebtPaymentOnly  = signal<boolean>(false);
//   weightEntries      = signal<number[]>([0]);

//   saleForm = this.fb.nonNullable.group({
//     is_debt_payment_only: [false],
//     vehicle_id:           [null as number | null],
//     chicken_type_id:      [null as number | null],
//     empty_cages_weight:   [0, [Validators.min(0)]],
//     dead_weight:          [0, [Validators.min(0)]],
//     discount_amount:      [0, [Validators.min(0)]],
//     price_per_kg:         [0],
//     paid_amount:          [0],
//     buyer_id:             [null as number | null, Validators.required],
//     old_debt_paid:        [0, [Validators.min(0)]]
//   });

//   formValue = toSignal(
//     this.saleForm.valueChanges.pipe(startWith(this.saleForm.getRawValue())),
//     { initialValue: this.saleForm.getRawValue() }
//   );

//   ngAfterViewInit() {
//     this.saleForm.get('is_debt_payment_only')?.valueChanges.subscribe(isDebtOnly => {
//       this.isDebtPaymentOnly.set(isDebtOnly);
//       this.updateFormValidation(isDebtOnly);
//     });
//   }

//   // ── Computed ──────────────────────────────────────────────────────────────────

//   grossTotalWeight = computed(() => {
//     if (this.isDebtPaymentOnly()) return 0;
//     return this.weightEntries().reduce((sum, w) => sum + (w || 0), 0);
//   });

//   totalDeductions = computed(() => {
//     if (this.isDebtPaymentOnly()) return 0;
//     const form = this.formValue();
//     return (form.dead_weight || 0) + (form.empty_cages_weight || 0);
//   });

//   netSaleWeight = computed(() => {
//     if (this.isDebtPaymentOnly()) return 0;
//     return Math.max(0, this.grossTotalWeight() - this.totalDeductions());
//   });

//   subtotalAmount = computed(() => {
//     if (this.isDebtPaymentOnly()) return 0;
//     return this.netSaleWeight() * (this.formValue().price_per_kg || 0);
//   });

//   totalSaleAmount = computed(() => {
//     if (this.isDebtPaymentOnly()) return 0;
//     return Math.max(0, this.subtotalAmount() - (this.formValue().discount_amount || 0));
//   });

//   remainingSaleAmount = computed(() => {
//     if (this.isDebtPaymentOnly()) return 0;
//     return Math.max(0, this.totalSaleAmount() - (this.formValue().paid_amount || 0));
//   });

//   debtAutoApplied = computed(() => {
//     if (this.isDebtPaymentOnly()) return 0;
//     const surplus = (this.formValue().paid_amount || 0) - this.totalSaleAmount();
//     if (surplus <= 0) return 0;
//     return Math.min(surplus, this.selectedBuyerDebt());
//   });

//   newTotalDebt = computed(() => {
//       const oldDebt = Number(this.selectedBuyerDebt());
//     if (this.isDebtPaymentOnly()) {
//       return Math.max(0, oldDebt - (this.formValue().old_debt_paid || 0));
//     }
//     console.log("this.remainingSaleAmount()",this.remainingSaleAmount());
//     console.log("this.debtAutoApplied()",this.debtAutoApplied());
//     console.log("(this.remainingSaleAmount() || 0) - this.debtAutoApplied()",(this.remainingSaleAmount() || 0) - this.debtAutoApplied());
//     console.log("(this.remainingSaleAmount() || 0) - this.debtAutoApplied()",(this.remainingSaleAmount() || 0) - this.debtAutoApplied());
//     console.log("oldDebt + (this.remainingSaleAmount() || 0) - this.debtAutoApplied()",Math.max(0, oldDebt + Number(this.remainingSaleAmount())   - this.debtAutoApplied()));

//     return Math.max(0, oldDebt + this.remainingSaleAmount()   - this.debtAutoApplied());
//   });

//   shouldShowPaymentField = computed(() => this.selectedBuyerDebt() > 0);
//   maxPaymentAmount       = computed(() => this.selectedBuyerDebt());
//   isPaymentRequired      = computed(() => this.isDebtPaymentOnly() && this.selectedBuyerDebt() > 0);

//   // ── Utils ─────────────────────────────────────────────────────────────────────

//   private utils     = inject(ReportUtilitiesService);
//   formatCurrency    = (amount: number | undefined | null) => this.utils.formatCurrency(amount);
//   formatNumber      = (num: number | undefined | null | string, decimals?: number) => this.utils.formatNumber(num, decimals);
//   formatPercentage  = (value: number | undefined | null, decimals?: number) => this.utils.formatPercentage(value, decimals);
//   formatDateTime    = (date: string | Date | undefined | null) => this.utils.formatDateTime(date);

//   // ── Lifecycle ─────────────────────────────────────────────────────────────────

//   ngOnInit(): void {
//     this.operationId.set(+this.route.snapshot.params['id']);
//     this.loadData();
//   }

//   // ── Weight entries ────────────────────────────────────────────────────────────

//   addWeightEntry(): void {
//     this.weightEntries.update(entries => [...entries, 0]);
//   }

//   removeWeightEntry(index: number): void {
//     if (this.weightEntries().length <= 1) return;
//     this.weightEntries.update(entries => entries.filter((_, i) => i !== index));
//   }

//   updateWeightEntry(index: number, value: number): void {
//     this.weightEntries.update(entries => {
//       const updated = [...entries];
//       updated[index] = value;
//       return updated;
//     });
//   }

//   // ── Validation ────────────────────────────────────────────────────────────────

//   updateFormValidation(isDebtOnly: boolean): void {
//     const vehicleControl     = this.saleForm.get('vehicle_id');
//     const chickenTypeControl = this.saleForm.get('chicken_type_id');
//     const priceControl       = this.saleForm.get('price_per_kg');
//     const paymentControl     = this.saleForm.get('old_debt_paid');
//     const deadWeightControl  = this.saleForm.get('dead_weight');
//     const discountControl    = this.saleForm.get('discount_amount');

//     if (isDebtOnly) {
//       vehicleControl?.clearValidators();
//       chickenTypeControl?.clearValidators();
//       priceControl?.clearValidators();
//       paymentControl?.setValidators([Validators.required, Validators.min(0.01)]);
//       this.saleForm.patchValue({
//         vehicle_id: null, chicken_type_id: null,
//         empty_cages_weight: 0, dead_weight: 0,
//         discount_amount: 0, price_per_kg: 0, paid_amount: 0
//       });
//       this.weightEntries.set([0]);
//     } else {
//       vehicleControl?.setValidators([Validators.required]);
//       chickenTypeControl?.setValidators([Validators.required]);
//       priceControl?.setValidators([Validators.required, Validators.min(0)]);
//       paymentControl?.setValidators([Validators.min(0)]);
//       deadWeightControl?.setValidators([Validators.min(0)]);
//       discountControl?.setValidators([Validators.min(0)]);
//     }

//     vehicleControl?.updateValueAndValidity();
//     chickenTypeControl?.updateValueAndValidity();
//     priceControl?.updateValueAndValidity();
//     paymentControl?.updateValueAndValidity();
//     deadWeightControl?.updateValueAndValidity();
//     discountControl?.updateValueAndValidity();
//   }

//   // ── Data loading ──────────────────────────────────────────────────────────────

//   loadData(): void {
//     this.loading.set(true);
//     Promise.all([
//       this.buyerService.getAll().toPromise(),
//       this.chickenTypeService.getAll().toPromise(),
//       this.operationService.getOperation(this.operationId()).toPromise()
//     ]).then(([buyersRes, typesRes, operationRes]: any[]) => {
//       this.buyers.set(buyersRes?.data || []);
//       this.chickenTypes.set(typesRes?.data || []);
//       if (operationRes?.data) {
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

//   // ── Event handlers ────────────────────────────────────────────────────────────

//   onVehicleChange(event: any): void {
//     console.log('Selected vehicle:', event.value);
//   }

//   onBuyerChange(): void {
//     const buyerId = this.saleForm.get('buyer_id')?.value;
//     if (buyerId) {
//       const buyer = this.buyers().find(b => b.id === buyerId);
//       this.selectedBuyerDebt.set(Number(buyer?.total_debt) || 0);
//     } else {
//       this.selectedBuyerDebt.set(0);
//     }
//     this.saleForm.patchValue({ old_debt_paid: 0 });
//   }

//   // ── Submit ────────────────────────────────────────────────────────────────────

//   onSubmit(): void {
//     if (this.saleForm.invalid) {
//       this.snackBar.open('يرجى ملء جميع الحقول المطلوبة', 'حسناً', { duration: 3000 });
//       return;
//     }
//     if (this.isDebtPaymentOnly() && (this.formValue().old_debt_paid || 0) === 0) {
//       this.snackBar.open('يرجى إدخال مبلغ الدفع', 'حسناً', { duration: 3000 });
//       return;
//     }
//     if (this.isDebtPaymentOnly() && this.selectedBuyerDebt() === 0) {
//       this.snackBar.open('محل الفراخ ليس لديه ديون لتسديدها', 'حسناً', { duration: 3000 });
//       return;
//     }
//     if (!this.isDebtPaymentOnly()) {
//       const weights = this.weightEntries();
//       if (weights.length === 0 || weights.every(w => !w || w <= 0)) {
//         this.snackBar.open('يرجى إدخال قراءة وزن واحدة على الأقل', 'حسناً', { duration: 3000 });
//         return;
//       }
//       if (weights.some(w => w < 0)) {
//         this.snackBar.open('قراءات الوزن يجب أن تكون أرقاماً موجبة', 'حسناً', { duration: 3000 });
//         return;
//       }
//       if ((this.formValue().discount_amount || 0) > this.subtotalAmount()) {
//         this.snackBar.open('الخصم لا يمكن أن يتجاوز الإجمالي قبل الخصم', 'حسناً', { duration: 3000 });
//         return;
//       }
//       if (this.totalDeductions() >= this.grossTotalWeight()) {
//         this.snackBar.open('إجمالي الخصومات لا يمكن أن يساوي أو يتجاوز إجمالي الوزن', 'حسناً', { duration: 3000 });
//         return;
//       }
//     }

//     this.submitting.set(true);
//     const payload = this.buildPayload();

//     this.operationService.recordSale(this.operationId(), payload as any).subscribe({
//       next: (result) => {
//         this.submitting.set(false);
//         const isDebtOnly = this.isDebtPaymentOnly();

//         let message = isDebtOnly ? 'تم تسجيل الدفع بنجاح' : 'تم تسجيل البيع بنجاح';
//         if (result.data?.balance_info) {
//           const balanceInfo = result.data.balance_info;
//           message += `\nالرصيد الجديد: ${balanceInfo.new_balance.toFixed(2)} جنيه`;
//           if (balanceInfo.is_settled) message += '\n✅ تم تسوية الحساب بالكامل';
//         }
//         if (result.data?.debt_payment) {
//           const amount = Number(result.data.debt_payment.amount ?? 0);
//           message += `\n💳 تم سداد ${amount.toFixed(2)} جنيه من الديون السابقة تلقائياً`;
//         }
//         this.snackBar.open(message, 'حسناً', { duration: 5000 });

//         if (isDebtOnly) {
//           this.router.navigate(['/operations/daily', this.operationId()]);
//           return;
//         }

//         const transactionId = result.data?.transaction?.id ?? 0;

//         const dialogRef = this.dialog.open(ConfirmationDialog, {
//           width: '350px',
//           direction: 'rtl',
//           data: {
//             title: 'تنزيل الفاتورة',
//             message: 'هل تريد تنزيل فاتورة PDF لهذه العملية؟',
//             confirmText: 'تنزيل PDF',
//             cancelText: 'تخطي',
//             type: 'info'
//           } as ConfirmationDialogData
//         });

//         dialogRef.afterClosed().subscribe((confirmed: boolean) => {
//           if (confirmed && transactionId) {
//             this.downloadInvoicePdf(transactionId);
//           }
//           this.router.navigate(['/operations/daily', this.operationId()]);
//         });
//       },
//       error: (error) => {
//         this.submitting.set(false);
//         console.error('Error recording sale:', error);
//         this.snackBar.open(error.error?.message || 'فشل تسجيل العملية', 'حسناً', { duration: 3000 });
//       }
//     });
//   }

//   // ── Payload ───────────────────────────────────────────────────────────────────

//   buildPayload(): any {
//     const formValue = this.saleForm.getRawValue();
//     if (this.isDebtPaymentOnly()) {
//       return {
//         buyer_id:             formValue.buyer_id!,
//         old_debt_paid:        formValue.old_debt_paid || 0,
//         is_debt_payment_only: true
//       };
//     }
//     return {
//       vehicle_id:         formValue.vehicle_id!,
//       buyer_id:           formValue.buyer_id!,
//       chicken_type_id:    formValue.chicken_type_id!,
//       weights:            this.weightEntries().filter(w => w > 0),
//       empty_cages_weight: formValue.empty_cages_weight || 0,
//       dead_weight:        formValue.dead_weight || 0,
//       price_per_kg:       formValue.price_per_kg || 0,
//       discount_amount:    formValue.discount_amount || 0,
//       paid_amount:        formValue.paid_amount || 0
//     };
//   }

//   // ── UI helpers ────────────────────────────────────────────────────────────────

//   cancel(): void {
//     this.router.navigate(['/operations/daily', this.operationId()]);
//   }

//   getSubmitButtonText(): string {
//     return this.isDebtPaymentOnly() ? 'تسجيل الدفع' : 'تسجيل البيع';
//   }

//   getDebtWarningMessage(): string {
//     const debt = Number(this.selectedBuyerDebt()) || 0;
//     return debt > 0 ? `⚠️ محل الفراخ لديه دين سابق: ${debt.toFixed(2)} جنيه` : '';
//   }

//   // ════════════════════════════════════════════════════════════════════════════
//   //  PDF INVOICE
//   //  Strategy: build HTML → render inside a sandboxed off-screen <iframe>
//   //            (completely isolated from the main page DOM/layout) →
//   //            html2canvas captures the iframe's body → jsPDF saves as PDF.
//   //
//   //  Install: npm install html2canvas jspdf
//   // ════════════════════════════════════════════════════════════════════════════

// downloadInvoicePdf(transactionId: number): void {
//   const fv          = this.saleForm.getRawValue();
//   const buyerName   = this.buyers().find(b => b.id === fv.buyer_id)?.name || '-';
//   const chickenType = this.chickenTypes().find(t => t.id === fv.chicken_type_id)?.name || '-';

//   const weights    = this.weightEntries().filter(w => w > 0);
//   const gross      = this.grossTotalWeight();
//   const net        = this.netSaleWeight();
//   const subtotal   = this.subtotalAmount();
//   const finalTotal = this.totalSaleAmount();
//   const paid       = fv.paid_amount        || 0;
//   const remaining  = this.remainingSaleAmount();
//   const pricePerKg = fv.price_per_kg       || 0;
//   const discount   = fv.discount_amount    || 0;
//   const emptyCages = fv.empty_cages_weight || 0;
//   const deadWeight = fv.dead_weight        || 0;

//   const invoiceNum  = String(transactionId).padStart(5, '0');
//   const today       = new Date();
//   const dateStr     = [
//     today.getDate().toString().padStart(2, '0'),
//     (today.getMonth() + 1).toString().padStart(2, '0'),
//     today.getFullYear(),
//   ].join('/');
//   const dateTimeStr = today.toLocaleString('ar-EG');

//   const weightRows = weights.map((w, i) => `
//     <tr><td>${i + 1}</td><td>${w.toFixed(2)} كجم</td></tr>
//   `).join('');

//   const html = `<!DOCTYPE html>
// <html dir="rtl" lang="ar">
// <head>
// <meta charset="UTF-8"/>
// <style>
//   *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
//   body {
//     font-family: 'Traditional Arabic', 'Arial Unicode MS', Arial, sans-serif;
//     background: #fff;
//     width: 560px;
//     color: #111;
//     font-size: 13px;
//     direction: rtl;
//     padding: 20px 22px 14px;
//   }
//   .title      { text-align: center; font-size: 26px; font-weight: 900; letter-spacing: 3px; }
//   .co-name    { text-align: center; font-size: 13px; font-weight: 700; color: #333; margin: 2px 0 6px; }
//   .double-line { border-top: 3px double #111; margin: 6px 0; }
//   .single-line { border-top: 1px solid #bbb; margin: 8px 0; }

//   /* الهيدر: يمين + شمال */
//   .header-row {
//     display: flex;
//     justify-content: space-between;
//     align-items: flex-start;
//     gap: 12px;
//     padding: 6px 0;
//   }
//   .right-block { line-height: 1.75; font-size: 13px; }
//   .right-block .lbl { font-size: 10px; color: #888; }
//   .right-block .val { font-weight: 800; font-size: 14px; }
//   .right-block .sub-val { font-weight: 600; font-size: 13px; }

//   .left-block { text-align: left; line-height: 1.75; font-size: 13px; }
//   .left-block .lbl { font-size: 10px; color: #888; }
//   .left-block .val { font-weight: 800; font-size: 13px; }

//   /* جدول الميزان */
//   .sec-title {
//     font-size: 11px; font-weight: 800; color: #555;
//     letter-spacing: 1px; margin: 10px 0 3px;
//     border-bottom: 1px solid #ddd; padding-bottom: 2px;
//   }
//   table { width: 100%; border-collapse: collapse; font-size: 13px; }
//   table thead tr { background: #111; color: #fff; }
//   table thead th { padding: 5px 10px; text-align: center; font-size: 12px; }
//   table tbody td { padding: 5px 10px; border: 1px solid #ddd; text-align: center; }
//   table tbody tr:nth-child(even) { background: #f9f9f9; }
//   table .foot-row td { background: #f0f0f0; font-weight: 700; border-top: 2px solid #aaa; }

//   /* ملخص */
//   .summary { margin-top: 10px; border: 1px solid #ccc; border-radius: 4px; overflow: hidden; }
//   .s-row {
//     display: flex; justify-content: space-between;
//     padding: 5px 14px; border-bottom: 1px solid #eee; font-size: 13px;
//   }
//   .s-row:last-child { border-bottom: none; }
//   .s-row .sl { color: #444; }
//   .s-row .sv { font-weight: 700; }
//   .s-row.total { background: #111; color: #fff; font-size: 14px; font-weight: 900; padding: 7px 14px; }
//   .s-row.total .sl, .s-row.total .sv { color: #fff; }
//   .s-row.rem-row .sl,
//   .s-row.rem-row .sv { color: ${remaining > 0 ? '#b45309' : '#166534'}; font-weight: 700; }

//   /* الذيل */
//   .footer {
//     text-align: center; margin-top: 12px; padding-top: 7px;
//     border-top: 1px solid #ccc; font-size: 11px; color: #888; line-height: 1.8;
//   }
//   .footer .thanks { font-size: 12px; font-weight: 800; color: #222; }
// </style>
// </head>
// <body>

//   <div class="title">فاتورة</div>
//   <div class="co-name">درقه للدواجن</div>
//   <div class="double-line"></div>

//   <div class="header-row">
//     <div class="right-block">
//       <div class="lbl">فاتورة إلى</div>
//       <div class="val">${buyerName}</div>
//       <div class="lbl" style="margin-top:4px">نوع الدواجن</div>
//       <div class="sub-val">${chickenType}</div>
//     </div>
//     <div class="left-block">
//       <div class="lbl">رقم الفاتورة</div>
//       <div class="val">${invoiceNum}</div>
//       <div class="lbl" style="margin-top:4px">التاريخ</div>
//       <div class="val">${dateStr}</div>
//     </div>
//   </div>

//   <div class="double-line"></div>

//   <div class="sec-title">قراءات الميزان</div>
//   <table>
//     <thead><tr><th>#</th><th>الوزن</th></tr></thead>
//     <tbody>
//       ${weightRows}
//       <tr class="foot-row">
//         <td>إجمالي الخام</td>
//         <td>${gross.toFixed(2)} كجم</td>
//       </tr>
//     </tbody>
//   </table>

//   <div class="single-line"></div>

//   <div class="summary">
//     <div class="s-row">
//       <span class="sl">وزن الأقفاص الفارغة</span>
//       <span class="sv">- ${emptyCages.toFixed(2)} كجم</span>
//     </div>
//     <div class="s-row">
//       <span class="sl">وزن الفراخ النافقة</span>
//       <span class="sv">- ${deadWeight.toFixed(2)} كجم</span>
//     </div>
//     <div class="s-row">
//       <span class="sl">صافي الوزن</span>
//       <span class="sv">${net.toFixed(2)} كجم</span>
//     </div>
//     <div class="s-row">
//       <span class="sl">سعر الكيلو</span>
//       <span class="sv">${pricePerKg.toFixed(2)} ج.م</span>
//     </div>
//     ${discount > 0 ? `
//     <div class="s-row">
//       <span class="sl">الإجمالي قبل الخصم</span>
//       <span class="sv">${subtotal.toFixed(2)} ج.م</span>
//     </div>
//     <div class="s-row">
//       <span class="sl">الخصم</span>
//       <span class="sv" style="color:#b45309">- ${discount.toFixed(2)} ج.م</span>
//     </div>` : ''}
//     <div class="s-row total">
//       <span class="sl">إجمالي الفاتورة</span>
//       <span class="sv">${finalTotal.toFixed(2)} ج.م</span>
//     </div>
//     <div class="s-row">
//       <span class="sl">المبلغ المدفوع</span>
//       <span class="sv">${paid.toFixed(2)} ج.م</span>
//     </div>
//     <div class="s-row rem-row">
//       <span class="sl">الرصيد المستحق</span>
//       <span class="sv">${remaining.toFixed(2)} ج.م</span>
//     </div>
//   </div>

//   <div class="footer">
//     <div class="thanks">شكراً لتعاملكم معنا</div>
//     <div>طُبع: ${dateTimeStr}</div>
//   </div>

// </body>
// </html>`;

//   this._htmlToPdf(html, `invoice-${invoiceNum}-${dateStr.replace(/\//g, '-')}.pdf`);
// }

//   // ── Core PDF renderer ─────────────────────────────────────────────────────────

//   private async _htmlToPdf(html: string, filename: string): Promise<void> {
//     let iframe: HTMLIFrameElement | null = null;

//     try {
//       const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
//         import('html2canvas'),
//         import('jspdf'),
//       ]);

//       // ── 1. Create a completely isolated off-screen iframe ──────────────────
//       // An iframe has its own layout context — html2canvas inside it
//       // will NEVER touch or reflow the parent page's DOM.
//       iframe = document.createElement('iframe');
//       Object.assign(iframe.style, {
//         position:   'fixed',
//         top:        '0',
//         left:       '-9999px',   // off-screen horizontally — invisible to user
//         width:      '560px',
//         height:     '1px',       // starts at 1px; we expand after load
//         border:     'none',
//         visibility: 'hidden',    // extra safety: never flashes on screen
//         pointerEvents: 'none',
//       });
//       document.body.appendChild(iframe);

//       // ── 2. Write the HTML into the iframe document ─────────────────────────
//       const iframeDoc = iframe.contentDocument!;
//       iframeDoc.open();
//       iframeDoc.write(html);
//       iframeDoc.close();

//       // ── 3. Wait for iframe layout to settle ───────────────────────────────
//       await new Promise<void>(resolve => {
//         // 'load' fires after all resources (images, fonts) are ready
//         iframe!.addEventListener('load', () => resolve(), { once: true });
//         // Safety fallback if load already fired
//         setTimeout(resolve, 500);
//       });

//       // ── 4. Expand iframe to full content height so nothing is clipped ─────
//       const body          = iframeDoc.body;
//       const contentHeight = body.scrollHeight;
//       iframe.style.height = `${contentHeight}px`;

//       // One more tick for the browser to apply the new height
//       await new Promise<void>(r => setTimeout(r, 100));

//       // ── 5. Capture using html2canvas inside the iframe's window ───────────
//       const canvas = await html2canvas(body, {
//         scale:           2,              // retina-quality
//         useCORS:         true,
//         allowTaint:      true,
//         backgroundColor: '#ffffff',
//         logging:         false,
//         width:           560,
//         windowWidth:     560,
//         // Pass the iframe's window so html2canvas uses its scroll/layout
//         // instead of the main page's — this is the key fix
//         scrollX: 0,
//         scrollY: 0,
//       });

//       // ── 6. Embed the canvas image into a PDF ──────────────────────────────
//       const imgData = canvas.toDataURL('image/png');
//       const mmW     = 148;  // A5 width in mm
//       const mmH     = Math.ceil((canvas.height / canvas.width) * mmW * 2) / 2;

//       const doc = new jsPDF({
//         orientation: 'portrait',
//         unit:        'mm',
//         format:      [mmW, Math.max(mmH, 210)],  // at least A5 height
//       });

//       doc.addImage(imgData, 'PNG', 0, 0, mmW, mmH);
//       doc.save(filename);

//     } catch (err) {
//       console.error('PDF generation failed:', err);
//       this.snackBar.open('فشل إنشاء الفاتورة', 'حسناً', { duration: 4000 });
//     } finally {
//       // ── 7. Always clean up the iframe ─────────────────────────────────────
//       if (iframe && document.body.contains(iframe)) {
//         document.body.removeChild(iframe);
//       }
//     }
//   }
// }


// import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
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
// import { MatSlideToggleModule } from '@angular/material/slide-toggle';
// import { MatDialog, MatDialogModule } from '@angular/material/dialog';
// import { toSignal } from '@angular/core/rxjs-interop';
// import { startWith } from 'rxjs';

// import { OperationService } from '../../../../core/services/operation.service';
// import { BuyerService } from '../../../../core/services/buyer.service';
// import { ChickenTypeService } from '../../../../core/services/chicken-type.service';
// import { Buyer, ChickenType, Vehicle } from '../../../../core/models';
// import { ReportUtilitiesService } from '../../../../core/services/ReportUtilitiesService';
// import { ConfirmationDialog, ConfirmationDialogData } from '../../../../shared/components/confirmation-dialog/confirmation-dialog/confirmation-dialog';
// import { FarmService } from '../../../../core/services/farm.service';


// @Component({
//   selector: 'app-sales',
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
//     MatSlideToggleModule,
//     MatDialogModule,
//     ConfirmationDialog
//   ],
//   templateUrl: './sales.html',
//   styleUrl: './sales.css',
//   changeDetection: ChangeDetectionStrategy.OnPush
// })
// export class Sales implements OnInit {
//   private fb                 = inject(FormBuilder);
//   private route              = inject(ActivatedRoute);
//   private router             = inject(Router);
//   private operationService   = inject(OperationService);
//   private buyerService       = inject(BuyerService);
//   private chickenTypeService = inject(ChickenTypeService);
//   private snackBar           = inject(MatSnackBar);
//   private dialog             = inject(MatDialog);
//   private farmService = inject(FarmService);


//   loading              = signal(false);
//   submitting           = signal(false);
//   buyers               = signal<Buyer[]>([]);
//   chickenTypes         = signal<ChickenType[]>([]);
//   activeVehicles       = signal<Vehicle[]>([]);
//   operationId          = signal<number>(0);
//   weightEntries        = signal<number[]>([0]);
//   isDebtPaymentOnly    = signal<boolean>(false);
//   selectedBuyerBalance = signal<number>(0);  // signed: +owes us, -we owe them

//   saleForm = this.fb.nonNullable.group({
//     is_debt_payment_only: [false],
//     vehicle_id:           [null as number | null],
//     chicken_type_id:      [null as number | null],
//     empty_cages_weight:   [0, [Validators.min(0)]],
//     dead_weight:          [0, [Validators.min(0)]],
//     discount_amount:      [0, [Validators.min(0)]],
//     price_per_kg:         [0],
//     paid_amount:          [0],
//     buyer_id:             [null as number | null, Validators.required],
//     old_balance_paid:     [0, [Validators.min(0)]]
//   });

//   formValue = toSignal(
//     this.saleForm.valueChanges.pipe(startWith(this.saleForm.getRawValue())),
//     { initialValue: this.saleForm.getRawValue() }
//   );

//   ngAfterViewInit() {
//     this.saleForm.get('is_debt_payment_only')?.valueChanges.subscribe(isDebtOnly => {
//       this.isDebtPaymentOnly.set(isDebtOnly);
//       this.updateFormValidation(isDebtOnly);
//     });
//   }

//   // ── Computed: weight & pricing (unchanged) ────────────────────────────────

//   grossTotalWeight = computed(() => {
//     if (this.isDebtPaymentOnly()) return 0;
//     return this.weightEntries().reduce((sum, w) => sum + (w || 0), 0);
//   });

//   totalDeductions = computed(() => {
//     if (this.isDebtPaymentOnly()) return 0;
//     const form = this.formValue();
//     return (form.dead_weight || 0) + (form.empty_cages_weight || 0);
//   });

//   netSaleWeight = computed(() => {
//     if (this.isDebtPaymentOnly()) return 0;
//     return Math.max(0, this.grossTotalWeight() - this.totalDeductions());
//   });

//   subtotalAmount = computed(() => {
//     if (this.isDebtPaymentOnly()) return 0;
//     return this.netSaleWeight() * (this.formValue().price_per_kg || 0);
//   });

//   totalSaleAmount = computed(() => {
//     if (this.isDebtPaymentOnly()) return 0;
//     return Math.max(0, this.subtotalAmount() - (this.formValue().discount_amount || 0));
//   });

//   remainingSaleAmount = computed(() => {
//     if (this.isDebtPaymentOnly()) return 0;
//     return Math.max(0, this.totalSaleAmount() - (this.formValue().paid_amount || 0));
//   });

//   // ── Computed: balance helpers (unchanged) ─────────────────────────────────

//   // Buyer has existing credit (negative balance) → auto-consumed to reduce
//   // what they owe on this sale → mirrors backend used_credit logic
//   creditAutoApplied = computed(() => {
//     if (this.isDebtPaymentOnly()) return 0;
//     const balance = this.selectedBuyerBalance();
//     if (balance >= 0) return 0;
//     const availableCredit = Math.abs(balance);
//     return Math.min(availableCredit, this.remainingSaleAmount());
//   });

//   // Buyer overpaid → surplus reduces their existing receivable debt
//   // Only fires when balance > 0 (they owe us) AND paid > finalAmount
//   debtAutoApplied = computed(() => {
//     if (this.isDebtPaymentOnly()) return 0;
//     const balance = this.selectedBuyerBalance();
//     if (balance <= 0) return 0;
//     const surplus = (this.formValue().paid_amount || 0) - this.totalSaleAmount();
//     if (surplus <= 0) return 0;
//     return Math.min(surplus, balance);
//   });

//   // ── CORRECTED: projectedBalance ───────────────────────────────────────────
//   //
//   // Mirrors recordSale Step 10 formula exactly:
//   //   balance_change = debt_payment_impact + used_credit + final_remaining - surplus
//   //
//   // In Angular terms:
//   //   surplus          = max(0, paid - finalAmount)   → balance DOWN (-)
//   //   creditAutoApplied = used_credit                 → balance UP  (+)
//   //   remainingSaleAmount = final_remaining           → balance UP  (+)
//   //
//   // OLD (wrong — used Farm sign for creditAutoApplied):
//   //   return currentBalance + remaining - creditAutoApplied - debtAutoApplied
//   //   ❌ subtracted creditAutoApplied instead of adding it
//   //   ❌ used debtAutoApplied instead of full surplus
//   //
//   // CORRECTED:
//   //   surplus = max(0, paid - finalAmount)   (full overpayment, not capped)
//   //   return currentBalance + remaining + creditAutoApplied - surplus

//   projectedBalance = computed(() => {
//     const currentBalance = this.selectedBuyerBalance();
//     const oldBalancePaid = this.formValue().old_balance_paid || 0;

//     if (this.isDebtPaymentOnly()) {
//       if (currentBalance > 0) {
//         // FROM_BUYER: buyer pays → balance DOWN
//         return currentBalance - oldBalancePaid;
//       } else if (currentBalance < 0) {
//         // TO_BUYER: we pay → balance UP toward zero
//         return currentBalance + oldBalancePaid;
//       }
//       return 0;
//     }

//     // Normal sale — CORRECTED formula:
//     const paidAmount   = this.formValue().paid_amount || 0;
//     const finalAmount  = this.totalSaleAmount();
//     const remaining    = this.remainingSaleAmount();     // max(0, final - paid)
//     const creditUsed   = this.creditAutoApplied();       // buyer credit consumed → UP
//     const surplus      = Math.max(0, paidAmount - finalAmount);  // overpayment → DOWN
//     console.log("currentBalance",currentBalance);
//     console.log("paidAmount",paidAmount);
//     console.log("remaining",remaining);
//     console.log("creditUsed",creditUsed);
//     console.log("surplus",surplus);
//     console.log("currentBalance + remaining + creditUsed - surplus",currentBalance + remaining + creditUsed - surplus);

//               // 40 + 0+40+10
//     return currentBalance + remaining  - surplus;
//   });

//   // Absolute value of projected balance for display in template
//   absoluteProjectedBalance = computed(() => Math.abs(this.projectedBalance()));

//   // ── Balance display helpers (unchanged) ───────────────────────────────────

//   hasBalance      = computed(() => this.selectedBuyerBalance() !== 0);
// buyerOwesUs     = computed(() => this.selectedBuyerBalance() >= 0);
//   weOweBuyer      = computed(() => this.selectedBuyerBalance() < 0);
//   absoluteBalance = computed(() => Math.abs(this.selectedBuyerBalance()));

//   shouldShowPaymentField = computed(() => this.hasBalance());
//   maxPaymentAmount       = computed(() => this.absoluteBalance());
//   isPaymentRequired      = computed(() => this.isDebtPaymentOnly() && this.hasBalance());

//   // ── Utils ─────────────────────────────────────────────────────────────────

//   private utils    = inject(ReportUtilitiesService);
//   formatCurrency   = (amount: number | undefined | null) => this.utils.formatCurrency(amount);
//   formatNumber     = (num: number | undefined | null | string, decimals?: number) => this.utils.formatNumber(num, decimals);
//   formatPercentage = (value: number | undefined | null, decimals?: number) => this.utils.formatPercentage(value, decimals);
//   formatDateTime   = (date: string | Date | undefined | null) => this.utils.formatDateTime(date);

//   // ── Lifecycle ─────────────────────────────────────────────────────────────

//   ngOnInit(): void {
//     this.operationId.set(+this.route.snapshot.params['id']);
//     this.loadData();
//   }

//   // ── Weight entries (unchanged) ────────────────────────────────────────────

//   addWeightEntry(): void {
//     this.weightEntries.update(entries => [...entries, 0]);
//   }

//   removeWeightEntry(index: number): void {
//     if (this.weightEntries().length <= 1) return;
//     this.weightEntries.update(entries => entries.filter((_, i) => i !== index));
//   }

//   updateWeightEntry(index: number, value: number): void {
//     this.weightEntries.update(entries => {
//       const updated = [...entries];
//       updated[index] = value;
//       return updated;
//     });
//   }

//   // ── Validation (unchanged) ────────────────────────────────────────────────

//   updateFormValidation(isDebtOnly: boolean): void {
//     const vehicleControl     = this.saleForm.get('vehicle_id');
//     const chickenTypeControl = this.saleForm.get('chicken_type_id');
//     const priceControl       = this.saleForm.get('price_per_kg');
//     const paymentControl     = this.saleForm.get('old_balance_paid');
//     const deadWeightControl  = this.saleForm.get('dead_weight');
//     const discountControl    = this.saleForm.get('discount_amount');

//     if (isDebtOnly) {
//       vehicleControl?.clearValidators();
//       chickenTypeControl?.clearValidators();
//       priceControl?.clearValidators();
//       paymentControl?.setValidators([Validators.required, Validators.min(0.01)]);
//       this.saleForm.patchValue({
//         vehicle_id: null, chicken_type_id: null,
//         empty_cages_weight: 0, dead_weight: 0,
//         discount_amount: 0, price_per_kg: 0, paid_amount: 0
//       });
//       this.weightEntries.set([0]);
//     } else {
//       vehicleControl?.setValidators([Validators.required]);
//       chickenTypeControl?.setValidators([Validators.required]);
//       priceControl?.setValidators([Validators.required, Validators.min(0)]);
//       paymentControl?.setValidators([Validators.min(0)]);
//       deadWeightControl?.setValidators([Validators.min(0)]);
//       discountControl?.setValidators([Validators.min(0)]);
//     }

//     vehicleControl?.updateValueAndValidity();
//     chickenTypeControl?.updateValueAndValidity();
//     priceControl?.updateValueAndValidity();
//     paymentControl?.updateValueAndValidity();
//     deadWeightControl?.updateValueAndValidity();
//     discountControl?.updateValueAndValidity();
//   }

//   // ── Data loading (unchanged) ──────────────────────────────────────────────

//   loadData(): void {
//     this.loading.set(true);
//     Promise.all([
//       this.buyerService.getAll().toPromise(),
//       this.chickenTypeService.getAll().toPromise(),
//       this.operationService.getOperation(this.operationId()).toPromise()
//     ]).then(([buyersRes, typesRes, operationRes]: any[]) => {
//       this.buyers.set(buyersRes?.data || []);
//       this.chickenTypes.set(typesRes?.data || []);
//       if (operationRes?.data) {
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

//   // ── Event handlers (unchanged) ────────────────────────────────────────────

//   onVehicleChange(event: any): void {
//     console.log('Selected vehicle:', event.value);
//   }

//   onBuyerChange(): void {
//     const buyerId = this.saleForm.get('buyer_id')?.value;
//     if (buyerId) {
//       const buyer = this.buyers().find(b => b.id === buyerId);
//       const balance = Number(buyer?.current_balance ?? buyer?.total_debt ?? 0);
//       this.selectedBuyerBalance.set(balance);
//     } else {
//       this.selectedBuyerBalance.set(0);
//     }
//     this.saleForm.patchValue({ old_balance_paid: 0 });
//   }

//   // ── Submit (unchanged) ────────────────────────────────────────────────────

//   onSubmit(): void {
//     if (this.saleForm.invalid) {
//       this.snackBar.open('يرجى ملء جميع الحقول المطلوبة', 'حسناً', { duration: 3000 });
//       return;
//     }

//     const balance = this.selectedBuyerBalance();

//     if (this.isDebtPaymentOnly()) {
//       if ((this.formValue().old_balance_paid || 0) === 0) {
//         this.snackBar.open('يرجى إدخال مبلغ الدفع', 'حسناً', { duration: 3000 });
//         return;
//       }
//       if (balance === 0) {
//         this.snackBar.open('لا يوجد رصيد لتسويته', 'حسناً', { duration: 3000 });
//         return;
//       }
//     }

//     if (!this.isDebtPaymentOnly()) {
//       const weights = this.weightEntries();
//       if (weights.length === 0 || weights.every(w => !w || w <= 0)) {
//         this.snackBar.open('يرجى إدخال قراءة وزن واحدة على الأقل', 'حسناً', { duration: 3000 });
//         return;
//       }
//       if (weights.some(w => w < 0)) {
//         this.snackBar.open('قراءات الوزن يجب أن تكون أرقاماً موجبة', 'حسناً', { duration: 3000 });
//         return;
//       }
//       if ((this.formValue().discount_amount || 0) > this.subtotalAmount()) {
//         this.snackBar.open('الخصم لا يمكن أن يتجاوز الإجمالي قبل الخصم', 'حسناً', { duration: 3000 });
//         return;
//       }
//       if (this.totalDeductions() >= this.grossTotalWeight()) {
//         this.snackBar.open('إجمالي الخصومات لا يمكن أن يساوي أو يتجاوز إجمالي الوزن', 'حسناً', { duration: 3000 });
//         return;
//       }
//     }

//     this.submitting.set(true);

//     this.operationService.recordSale(this.operationId(), this.buildPayload() as any).subscribe({
//       next: (result) => {
//         this.submitting.set(false);
//         const isDebtOnly = this.isDebtPaymentOnly();
//         let message = isDebtOnly ? 'تم تسجيل الدفع بنجاح' : 'تم تسجيل البيع بنجاح';

//         if (result.data?.balance_info) {
//           const bi          = result.data.balance_info;
//           const newBalance  = Number(bi.new_balance ?? 0);
//           const balanceType = bi.balance_type;

//           if (balanceType === 'SETTLED') {
//             message += '\n✅ تم تسوية الحساب بالكامل';
//           } else if (balanceType === 'RECEIVABLE') {
//             message += `\nالرصيد المستحق: ${newBalance.toFixed(2)} جنيه`;
//           } else if (balanceType === 'CREDIT') {
//             message += `\nرصيد دائن للمشتري: ${Math.abs(newBalance).toFixed(2)} جنيه`;
//           }
//           if (bi.direction_changed) {
//             message += `\n⚠️ ${bi.alert}`;
//           }
//         }

//         if (result.data?.debt_payment) {
//           const amount = Number(result.data.debt_payment.amount ?? 0);
//           message += `\n💳 تم سداد ${amount.toFixed(2)} جنيه من الرصيد السابق`;
//         }

//         this.snackBar.open(message, 'حسناً', { duration: 5000 });

//         if (isDebtOnly) {
//           this.router.navigate(['/operations/daily', this.operationId()]);
//           return;
//         }

//         const transactionId = result.data?.transaction?.id ?? 0;

//         const dialogRef = this.dialog.open(ConfirmationDialog, {
//           width: '350px',
//           direction: 'rtl',
//           data: {
//             title:       'تنزيل الفاتورة',
//             message:     'هل تريد تنزيل فاتورة PDF لهذه العملية؟',
//             confirmText: 'تنزيل PDF',
//             cancelText:  'تخطي',
//             type:        'info'
//           } as ConfirmationDialogData
//         });

//         dialogRef.afterClosed().subscribe((confirmed: boolean) => {
//           if (confirmed && transactionId) this.downloadInvoicePdf(transactionId);
//           this.router.navigate(['/operations/daily', this.operationId()]);
//         });
//       },
//       error: (error) => {
//         this.submitting.set(false);
//         console.error('Error recording sale:', error);
//         this.snackBar.open(error.error?.message || 'فشل تسجيل العملية', 'حسناً', { duration: 3000 });
//       }
//     });
//   }

//   // ── Payload (unchanged) ───────────────────────────────────────────────────

//   buildPayload(): any {
//     const formValue = this.saleForm.getRawValue();
//     if (this.isDebtPaymentOnly()) {
//       return {
//         buyer_id:             formValue.buyer_id!,
//         old_balance_paid:     formValue.old_balance_paid || 0,
//         is_debt_payment_only: true
//       };
//     }
//     return {
//       vehicle_id:         formValue.vehicle_id!,
//       buyer_id:           formValue.buyer_id!,
//       chicken_type_id:    formValue.chicken_type_id!,
//       weights:            this.weightEntries().filter(w => w > 0),
//       empty_cages_weight: formValue.empty_cages_weight || 0,
//       dead_weight:        formValue.dead_weight        || 0,
//       price_per_kg:       formValue.price_per_kg       || 0,
//       discount_amount:    formValue.discount_amount    || 0,
//       paid_amount:        formValue.paid_amount        || 0
//     };
//   }

//   // ── UI helpers (unchanged) ────────────────────────────────────────────────

//   cancel(): void {
//     this.router.navigate(['/operations/daily', this.operationId()]);
//   }

//   getSubmitButtonText(): string {
//     return this.isDebtPaymentOnly() ? 'تسجيل الدفع' : 'تسجيل البيع';
//   }

//   getBalanceWarningMessage(): string {
//     const balance = this.selectedBuyerBalance();
//     if (balance > 0) return `⚠️ محل الفراخ مدين لنا بمبلغ: ${balance.toFixed(2)} جنيه`;
//     if (balance < 0) return `ℹ️   نحن مدينون للمشتري بمبلغ: ${Math.abs(balance).toFixed(2)} جنيه (سيُطبَّق تلقائياً)`;
//     return '';
//   }

//   getDebtWarningMessage(): string {
//     return this.getBalanceWarningMessage();
//   }

//   // ── PDF invoice (unchanged) ───────────────────────────────────────────────

//   downloadInvoicePdf(transactionId: number): void {
//     const fv          = this.saleForm.getRawValue();
//     const buyerName   = this.buyers().find(b => b.id === fv.buyer_id)?.name || '-';
//     const chickenType = this.chickenTypes().find(t => t.id === fv.chicken_type_id)?.name || '-';
//     const weights     = this.weightEntries().filter(w => w > 0);
//     const gross       = this.grossTotalWeight();
//     const net         = this.netSaleWeight();
//     const subtotal    = this.subtotalAmount();
//     const finalTotal  = this.totalSaleAmount();
//     const paid        = fv.paid_amount        || 0;
//     const remaining   = this.remainingSaleAmount();
//     const pricePerKg  = fv.price_per_kg       || 0;
//     const discount    = fv.discount_amount    || 0;
//     const emptyCages  = fv.empty_cages_weight || 0;
//     const deadWeight  = fv.dead_weight        || 0;
//     const invoiceNum  = String(transactionId).padStart(5, '0');
//     const today       = new Date();
//     const dateStr     = [
//       today.getDate().toString().padStart(2, '0'),
//       (today.getMonth() + 1).toString().padStart(2, '0'),
//       today.getFullYear()
//     ].join('/');
//     const dateTimeStr = today.toLocaleString('ar-EG');
//     const weightRows  = weights.map((w, i) => `<tr><td>${i + 1}</td><td>${w.toFixed(2)} كجم</td></tr>`).join('');

//     const html = `<!DOCTYPE html>
// <html dir="rtl" lang="ar"><head><meta charset="UTF-8"/>
// <style>
//   *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
//   body{font-family:'Traditional Arabic','Arial Unicode MS',Arial,sans-serif;background:#fff;width:560px;color:#111;font-size:13px;direction:rtl;padding:20px 22px 14px}
//   .title{text-align:center;font-size:26px;font-weight:900;letter-spacing:3px}
//   .co-name{text-align:center;font-size:13px;font-weight:700;color:#333;margin:2px 0 6px}
//   .double-line{border-top:3px double #111;margin:6px 0}.single-line{border-top:1px solid #bbb;margin:8px 0}
//   .header-row{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;padding:6px 0}
//   .right-block{line-height:1.75;font-size:13px}.right-block .lbl{font-size:10px;color:#888}
//   .right-block .val{font-weight:800;font-size:14px}.right-block .sub-val{font-weight:600;font-size:13px}
//   .left-block{text-align:left;line-height:1.75;font-size:13px}.left-block .lbl{font-size:10px;color:#888}.left-block .val{font-weight:800;font-size:13px}
//   .sec-title{font-size:11px;font-weight:800;color:#555;letter-spacing:1px;margin:10px 0 3px;border-bottom:1px solid #ddd;padding-bottom:2px}
//   table{width:100%;border-collapse:collapse;font-size:13px}
//   table thead tr{background:#111;color:#fff}table thead th{padding:5px 10px;text-align:center;font-size:12px}
//   table tbody td{padding:5px 10px;border:1px solid #ddd;text-align:center}table tbody tr:nth-child(even){background:#f9f9f9}
//   table .foot-row td{background:#f0f0f0;font-weight:700;border-top:2px solid #aaa}
//   .summary{margin-top:10px;border:1px solid #ccc;border-radius:4px;overflow:hidden}
//   .s-row{display:flex;justify-content:space-between;padding:5px 14px;border-bottom:1px solid #eee;font-size:13px}
//   .s-row:last-child{border-bottom:none}.s-row .sl{color:#444}.s-row .sv{font-weight:700}
//   .s-row.total{background:#111;color:#fff;font-size:14px;font-weight:900;padding:7px 14px}
//   .s-row.total .sl,.s-row.total .sv{color:#fff}
//   .s-row.rem-row .sl,.s-row.rem-row .sv{color:${remaining > 0 ? '#b45309' : '#166534'};font-weight:700}
//   .footer{text-align:center;margin-top:12px;padding-top:7px;border-top:1px solid #ccc;font-size:11px;color:#888;line-height:1.8}
//   .footer .thanks{font-size:12px;font-weight:800;color:#222}
// </style></head><body>
//   <div class="title">فاتورة</div><div class="co-name">درقه للدواجن</div><div class="double-line"></div>
//   <div class="header-row">
//     <div class="right-block"><div class="lbl">فاتورة إلى</div><div class="val">${buyerName}</div><div class="lbl" style="margin-top:4px">نوع الدواجن</div><div class="sub-val">${chickenType}</div></div>
//     <div class="left-block"><div class="lbl">رقم الفاتورة</div><div class="val">${invoiceNum}</div><div class="lbl" style="margin-top:4px">التاريخ</div><div class="val">${dateStr}</div></div>
//   </div>
//   <div class="double-line"></div>
//   <div class="sec-title">قراءات الميزان</div>
//   <table><thead><tr><th>#</th><th>الوزن</th></tr></thead><tbody>${weightRows}<tr class="foot-row"><td>إجمالي الخام</td><td>${gross.toFixed(2)} كجم</td></tr></tbody></table>
//   <div class="single-line"></div>
//   <div class="summary">
//     <div class="s-row"><span class="sl">وزن الأقفاص الفارغة</span><span class="sv">- ${emptyCages.toFixed(2)} كجم</span></div>
//     <div class="s-row"><span class="sl">وزن الفراخ النافقة</span><span class="sv">- ${deadWeight.toFixed(2)} كجم</span></div>
//     <div class="s-row"><span class="sl">صافي الوزن</span><span class="sv">${net.toFixed(2)} كجم</span></div>
//     <div class="s-row"><span class="sl">سعر الكيلو</span><span class="sv">${pricePerKg.toFixed(2)} ج.م</span></div>
//     ${discount > 0 ? `<div class="s-row"><span class="sl">الإجمالي قبل الخصم</span><span class="sv">${subtotal.toFixed(2)} ج.م</span></div><div class="s-row"><span class="sv" style="color:#b45309">- ${discount.toFixed(2)} ج.م</span><span class="sl">الخصم</span></div>` : ''}
//     <div class="s-row total"><span class="sl">إجمالي الفاتورة</span><span class="sv">${finalTotal.toFixed(2)} ج.م</span></div>
//     <div class="s-row"><span class="sl">المبلغ المدفوع</span><span class="sv">${paid.toFixed(2)} ج.م</span></div>
//     <div class="s-row rem-row"><span class="sl">الرصيد المستحق</span><span class="sv">${remaining.toFixed(2)} ج.م</span></div>
//   </div>
//   <div class="footer"><div class="thanks">شكراً لتعاملكم معنا</div><div>طُبع: ${dateTimeStr}</div></div>
// </body></html>`;

//     this._htmlToPdf(html, `invoice-${invoiceNum}-${dateStr.replace(/\//g, '-')}.pdf`);
//   }

//   private async _htmlToPdf(html: string, filename: string): Promise<void> {
//     let iframe: HTMLIFrameElement | null = null;
//     try {
//       const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
//         import('html2canvas'), import('jspdf')
//       ]);
//       iframe = document.createElement('iframe');
//       Object.assign(iframe.style, { position: 'fixed', top: '0', left: '-9999px', width: '560px', height: '1px', border: 'none', visibility: 'hidden', pointerEvents: 'none' });
//       document.body.appendChild(iframe);
//       const iframeDoc = iframe.contentDocument!;
//       iframeDoc.open(); iframeDoc.write(html); iframeDoc.close();
//       await new Promise<void>(resolve => { iframe!.addEventListener('load', () => resolve(), { once: true }); setTimeout(resolve, 500); });
//       const body = iframeDoc.body;
//       iframe.style.height = `${body.scrollHeight}px`;
//       await new Promise<void>(r => setTimeout(r, 100));
//       const canvas = await html2canvas(body, { scale: 2, useCORS: true, allowTaint: true, backgroundColor: '#ffffff', logging: false, width: 560, windowWidth: 560, scrollX: 0, scrollY: 0 });
//       const imgData = canvas.toDataURL('image/png');
//       const mmW = 148;
//       const mmH = Math.ceil((canvas.height / canvas.width) * mmW * 2) / 2;
//       const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [mmW, Math.max(mmH, 210)] });
//       doc.addImage(imgData, 'PNG', 0, 0, mmW, mmH);
//       doc.save(filename);
//     } catch (err) {
//       console.error('PDF generation failed:', err);
//       this.snackBar.open('فشل إنشاء الفاتورة', 'حسناً', { duration: 4000 });
//     } finally {
//       if (iframe && document.body.contains(iframe)) document.body.removeChild(iframe);
//     }
//   }
//    formatBalance(buyr: Buyer): string {
//     return this.farmService.formatBalance(buyr);
//   }
//     getBalanceTypeClass(buyr: Buyer): string {
//       return this.farmService.getBalanceColorClass(buyr);
//     }
// }


import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';

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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';

import { OperationService } from '../../../../core/services/operation.service';
import { BuyerService } from '../../../../core/services/buyer.service';
import { ChickenTypeService } from '../../../../core/services/chicken-type.service';
import { Buyer, ChickenType, Vehicle } from '../../../../core/models';
import { ReportUtilitiesService } from '../../../../core/services/ReportUtilitiesService';
import { ConfirmationDialog, ConfirmationDialogData } from '../../../../shared/components/confirmation-dialog/confirmation-dialog/confirmation-dialog';
import { FarmService } from '../../../../core/services/farm.service';
import { PaymentMethodSelectorComponent } from '../../../../shared/components/payment-method-selector/payment-method-selector.component';
import { PersonSelectorComponent } from '../../../../shared/components/person-selector/person-selector.component';
import { TransportLosses } from '../../transport-losses/transport-losses/transport-losses';
import { PaymentSourceSelectorComponent } from '../../../../shared/components/payment-source-selector/payment-source-selector.component';
import { PaymentSourceSelection } from '../../../../models/custody.models';


@Component({
  selector: 'app-sales',
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
    MatDialogModule,
    PersonSelectorComponent,
    PaymentSourceSelectorComponent
],
  templateUrl: './sales.html',
  styleUrl: './sales.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Sales implements OnInit {
  private fb                 = inject(FormBuilder);
  private route              = inject(ActivatedRoute);
  private router             = inject(Router);
  private operationService   = inject(OperationService);
  private buyerService       = inject(BuyerService);
  private chickenTypeService = inject(ChickenTypeService);
  private snackBar           = inject(MatSnackBar);
  private dialog             = inject(MatDialog);
  private farmService = inject(FarmService);
  loading              = signal(false);
  submitting           = signal(false);
  buyers               = signal<Buyer[]>([]);
  chickenTypes         = signal<ChickenType[]>([]);
  activeVehicles       = signal<Vehicle[]>([]);
  operationId          = signal<number>(0);
  weightEntries        = signal<number[]>([0]);
  isDebtPaymentOnly    = signal<boolean>(false);
  selectedBuyerBalance = signal<number>(0);  // signed: +owes us, -we owe them
  paymentSource = signal<PaymentSourceSelection | null>(null);
Math=Math
  saleForm = this.fb.nonNullable.group({
    is_debt_payment_only: [false],
    vehicle_id:           [null as number | null],
    chicken_type_id:      [null as number | null],
    empty_cages_weight:   [0, [Validators.min(0)]],
    dead_weight:          [0, [Validators.min(0)]],
    discount_amount:      [0, [Validators.min(0)]],
    price_per_kg:         [0],
    paid_amount:          [0],
    buyer_id:             [null as number | null, Validators.required],
    old_balance_paid:     [0, [Validators.min(0)]],   // used in BOTH debt-only AND normal sale

    // NEW: payment metadata (optional)
    payment_method: ['CASH'],
    safe_id: [null as number | null],
    person_type: [null as string | null ],
    received_by_person_id: [null as number | null],

    // NEW: Transport loss info (populated from dialog)
    // safe_id_loss: [null as number | null],
    // payment_method_loss: [null as string | null],
    price_per_kg_loss: [0],
    location_loss: [null as string | null],
    isFarmResponsible_loss: [false],
    farm_id_loss: [null as number | null],
    notes_loss: [null as string | null]
  });

  formValue = toSignal(
    this.saleForm.valueChanges.pipe(startWith(this.saleForm.getRawValue())),
    { initialValue: this.saleForm.getRawValue() }
  );

  ngAfterViewInit() {
    this.saleForm.get('is_debt_payment_only')?.valueChanges.subscribe(isDebtOnly => {
      this.isDebtPaymentOnly.set(isDebtOnly);
      this.updateFormValidation(isDebtOnly);
       this.updatePaymentValidation();
    });
     this.updatePaymentValidation();
     console.log("updatePaymentValidation", !(
    this.isDebtPaymentOnly() &&
    this.buyerOwesUs()
  ));

  }

  // ── Computed: weight & pricing ────────────────────────────────────────────

  grossTotalWeight = computed(() => {
    if (this.isDebtPaymentOnly()) return 0;
    return this.weightEntries().reduce((sum, w) => sum + (w || 0), 0);
  });

  totalDeductions = computed(() => {
    if (this.isDebtPaymentOnly()) return 0;
    const form = this.formValue();
    return (form.dead_weight || 0) + (form.empty_cages_weight || 0);
  });

  netSaleWeight = computed(() => {
    if (this.isDebtPaymentOnly()) return 0;
    return Math.max(0, this.grossTotalWeight() - this.totalDeductions());
  });

  subtotalAmount = computed(() => {
    if (this.isDebtPaymentOnly()) return 0;
    return this.netSaleWeight() * (this.formValue().price_per_kg || 0);
  });

  totalSaleAmount = computed(() => {
    if (this.isDebtPaymentOnly()) return 0;
    return Math.max(0, this.subtotalAmount() - (this.formValue().discount_amount || 0));
  });

  remainingSaleAmount = computed(() => {
    if (this.isDebtPaymentOnly()) return 0;
    return Math.max(0, this.totalSaleAmount() - (this.formValue().paid_amount || 0));
  });

  // ── Computed: balance helpers ─────────────────────────────────────────────

  // Buyer has credit (negative balance) → auto-consumed to reduce remaining
  creditAutoApplied = computed(() => {
    if (this.isDebtPaymentOnly()) return 0;
    const balance = this.selectedBuyerBalance();
    if (balance > 0 || this.remainingSaleAmount()<=0) return 0;
    return Math.min(Math.abs(balance), this.remainingSaleAmount());
  });

  // Buyer overpaid → surplus reduces existing receivable
  debtAutoApplied = computed(() => {
    if (this.isDebtPaymentOnly()) return 0;
    const balance = this.selectedBuyerBalance();
    if (balance <= 0) return 0;
    const surplus = (this.formValue().paid_amount || 0) - this.totalSaleAmount();
    if (surplus <= 0) return 0;
    return Math.min(surplus, balance);
  });

  // ── CORRECTED projectedBalance ────────────────────────────────────────────
  //
  // Mirrors recordSale formula:
  //   balance_change = debt_payment_impact + used_credit + final_remaining - surplus
  //
  // debt_payment_impact from old_balance_paid:
  //   balance > 0 → FROM_BUYER → -old_balance_paid  (buyer pays debt → DOWN)
  //   balance < 0 → TO_BUYER   → +old_balance_paid  (we pay credit → UP)
  //
  // For normal sale:
  //   +remaining   buyer still owes us → UP
  //   +creditUsed  credit consumed     → UP
  //   -surplus     overpayment         → DOWN

  projectedBalance = computed(() => {
    const currentBalance = this.selectedBuyerBalance();
    const oldBalancePaid = this.formValue().old_balance_paid || 0;

    // Debt payment impact from old_balance_paid (applies in BOTH flows)
    let debtPaymentImpact = 0;
    if (oldBalancePaid > 0) {
      if (currentBalance > 0) {
        debtPaymentImpact = -oldBalancePaid;   // FROM_BUYER: reduces positive balance
      } else if (currentBalance < 0) {
        debtPaymentImpact = +oldBalancePaid;   // TO_BUYER: reduces negative balance
      }
    }

    if (this.isDebtPaymentOnly()) {
      return currentBalance + debtPaymentImpact;
    }

    // Normal sale
    const paidAmount  = this.formValue().paid_amount || 0;
    const finalAmount = this.totalSaleAmount();
    const remaining   = this.remainingSaleAmount();
    const creditUsed  = this.creditAutoApplied();
    const surplus     = Math.max(0, paidAmount - finalAmount)

    return currentBalance  + remaining  - surplus;
  });

  absoluteProjectedBalance = computed(() => Math.abs(this.projectedBalance()));

  // ── Balance display helpers ───────────────────────────────────────────────

  hasBalance      = computed(() => this.selectedBuyerBalance() !== 0);
  buyerOwesUs     = computed(() => this.selectedBuyerBalance() >= 0);
  weOweBuyer      = computed(() => this.selectedBuyerBalance() < 0);
  absoluteBalance = computed(() => Math.abs(this.selectedBuyerBalance()));

  // Show old_balance_paid field when buyer has any non-zero balance
  shouldShowPaymentField = computed(() => this.isDebtPaymentOnly() );
  maxPaymentAmount       = computed(() => this.absoluteBalance());
  isPaymentRequired      = computed(() => this.isDebtPaymentOnly() && this.hasBalance());
  paymentSourceAmount = computed(() => {
    if (this.isDebtPaymentOnly()) {
      return this.formValue().old_balance_paid ?? 0;
    }
    return this.formValue().paid_amount ?? 0;
  });
  currentPersonType = computed(() => (this.formValue().person_type as 'EMPLOYEE' | 'PARTNER' | null) ?? null);
  currentPersonId = computed(() => this.formValue().received_by_person_id ?? null);
 isPaymentSourceValid = computed(() => {
  const requiresPaymentSource = !(this.isDebtPaymentOnly() && this.buyerOwesUs());
  if (!requiresPaymentSource) return true;  // ✅ Skip validation when optional

  return this.paymentSourceAmount() <= 0 || this.paymentSource() !== null;
});



  // ── Utils ─────────────────────────────────────────────────────────────────

  private utils    = inject(ReportUtilitiesService);
  formatCurrency   = (amount: number | undefined | null) => this.utils.formatCurrency(amount);
  formatNumber     = (num: number | undefined | null | string, decimals?: number) => this.utils.formatNumber(num, decimals);
  formatPercentage = (value: number | undefined | null, decimals?: number) => this.utils.formatPercentage(value, decimals);
  formatDateTime   = (date: string | Date | undefined | null) => this.utils.formatDateTime(date);

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.operationId.set(+this.route.snapshot.params['id']);
    this.loadData();
  }

  // ── Weight entries ────────────────────────────────────────────────────────

  addWeightEntry(): void {
    this.weightEntries.update(entries => [...entries, 0]);
  }

  removeWeightEntry(index: number): void {
    if (this.weightEntries().length <= 1) return;
    this.weightEntries.update(entries => entries.filter((_, i) => i !== index));
  }

  updateWeightEntry(index: number, value: number): void {
    this.weightEntries.update(entries => {
      const updated = [...entries];
      updated[index] = value;
      return updated;
    });
  }

  // ── Validation ────────────────────────────────────────────────────────────

  updateFormValidation(isDebtOnly: boolean): void {
    const vehicleControl     = this.saleForm.get('vehicle_id');
    const chickenTypeControl = this.saleForm.get('chicken_type_id');
    const priceControl       = this.saleForm.get('price_per_kg');
    const paymentControl     = this.saleForm.get('old_balance_paid');
    const deadWeightControl  = this.saleForm.get('dead_weight');
    const discountControl    = this.saleForm.get('discount_amount');

    if (isDebtOnly) {
      vehicleControl?.clearValidators();
      chickenTypeControl?.clearValidators();
      priceControl?.clearValidators();
      paymentControl?.setValidators([Validators.required, Validators.min(0.01)]);
      this.saleForm.patchValue({
        vehicle_id: null, chicken_type_id: null,
        empty_cages_weight: 0, dead_weight: 0,
        discount_amount: 0, price_per_kg: 0, paid_amount: 0
      });
      this.weightEntries.set([0]);
    } else {
      vehicleControl?.setValidators([Validators.required]);
      chickenTypeControl?.setValidators([Validators.required]);
      priceControl?.setValidators([Validators.required, Validators.min(0)]);
      paymentControl?.setValidators([Validators.min(0)]);
      deadWeightControl?.setValidators([Validators.min(0)]);
      discountControl?.setValidators([Validators.min(0)]);
    }

    vehicleControl?.updateValueAndValidity();
    chickenTypeControl?.updateValueAndValidity();
    priceControl?.updateValueAndValidity();
    paymentControl?.updateValueAndValidity();
    deadWeightControl?.updateValueAndValidity();
    discountControl?.updateValueAndValidity();
     this.updatePaymentValidation();
  }

  // ── Data loading ──────────────────────────────────────────────────────────

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
    }).then(() => {
      // AUTO-DEFAULT PAYMENT SOURCE (same as farm-loading)
      setTimeout(() => {
        console.log('🔧 Sales: Auto-setting CASH safe');
        this.saleForm.patchValue({ payment_method: 'CASH' }, { emitEvent: true });
        this.saleForm.get('payment_method')?.updateValueAndValidity({emitEvent: true});
      }, 300);
    }).catch((error) => {
      console.error('Error loading data:', error);
      this.snackBar.open('فشل تحميل البيانات', 'حسناً', { duration: 3000 });
      this.loading.set(false);
    });
  }

  // ── Event handlers ────────────────────────────────────────────────────────

  onVehicleChange(event: any): void {
    console.log('Selected vehicle:', event.value);
  }

  onBuyerChange(): void {
    const buyerId = this.saleForm.get('buyer_id')?.value;
    if (buyerId) {
      const buyer   = this.buyers().find(b => b.id === buyerId);
      const balance = Number(buyer?.current_balance ?? 0);
      this.selectedBuyerBalance.set(balance);
    } else {
      this.selectedBuyerBalance.set(0);
    }
    this.saleForm.patchValue({ old_balance_paid: 0 });
    this.updatePaymentValidation();
  }

  openTransportLossDialog(): void {
    const dialogRef = this.dialog.open(TransportLosses, {
      width: '90vw',
      maxWidth: '800px',
      direction: 'rtl',
      data: {
        operationId: this.operationId(),
        vehicle_id: this.saleForm.get('vehicle_id')?.value,
        chicken_type_id: this.saleForm.get('chicken_type_id')?.value,
        price_per_kg: this.saleForm.get('price_per_kg')?.value,
        saleType:true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.saleForm.patchValue({
          dead_weight: result.dead_weight,
          // safe_id_loss: result.safe_id,
          // payment_method_loss: result.payment_method,
          price_per_kg_loss: result.price_per_kg,
          location_loss: result.location,
          isFarmResponsible_loss: result.isFarmResponsible,
          farm_id_loss: result.farm_id,
          notes_loss: result.notes
        });
      }
    });
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  onSubmit(): void {
    if (this.saleForm.invalid) {
      this.snackBar.open('يرجى ملء جميع الحقول المطلوبة', 'حسناً', { duration: 3000 });
      return;
    }
    if (!this.isPaymentSourceValid()) {
      this.snackBar.open('يجب اختيار مصدر الدفع', 'حسناً', { duration: 3000 });
      return;
    }

    // const balance = this.selectedBuyerBalance();

    if (this.isDebtPaymentOnly()) {
      if ((this.formValue().old_balance_paid || 0) === 0) {
        this.snackBar.open('يرجى إدخال مبلغ الدفع', 'حسناً', { duration: 3000 });
        return;
      }
      // if (balance === 0) {
      //   this.snackBar.open('لا يوجد رصيد لتسويته', 'حسناً', { duration: 3000 });
      //   return;
      // }
    }

    if (!this.isDebtPaymentOnly()) {
      const weights = this.weightEntries();
      if (weights.length === 0 || weights.every(w => !w || w <= 0)) {
        this.snackBar.open('يرجى إدخال قراءة وزن واحدة على الأقل', 'حسناً', { duration: 3000 });
        return;
      }
      if (weights.some(w => w < 0)) {
        this.snackBar.open('قراءات الوزن يجب أن تكون أرقاماً موجبة', 'حسناً', { duration: 3000 });
        return;
      }
      if ((this.formValue().discount_amount || 0) > this.subtotalAmount()) {
        this.snackBar.open('الخصم لا يمكن أن يتجاوز الإجمالي قبل الخصم', 'حسناً', { duration: 3000 });
        return;
      }
      if (this.totalDeductions() >= this.grossTotalWeight()) {
        this.snackBar.open('إجمالي الخصومات لا يمكن أن يساوي أو يتجاوز إجمالي الوزن', 'حسناً', { duration: 3000 });
        return;
      }
    }

    this.submitting.set(true);

    this.operationService.recordSale(this.operationId(), this.buildPayload() as any).subscribe({
      next: (result) => {
        this.submitting.set(false);
        const isDebtOnly = this.isDebtPaymentOnly();
        let message = isDebtOnly ? 'تم تسجيل الدفع بنجاح' : 'تم تسجيل البيع بنجاح';

        if (result.data?.balance_info) {
          const bi          = result.data.balance_info;
          const newBalance  = Number(bi.new_balance ?? 0);
          const balanceType = bi.balance_type;
          if (balanceType === 'SETTLED') {
            message += '\n✅ تم تسوية الحساب بالكامل';
          } else if (balanceType === 'RECEIVABLE') {
            message += `\nالرصيد المستحق: ${newBalance.toFixed(2)} جنيه`;
          } else if (balanceType === 'CREDIT') {
            message += `\nرصيد دائن للمشتري: ${Math.abs(newBalance).toFixed(2)} جنيه`;
          }
          if (bi.direction_changed) message += `\n⚠️ ${bi.alert}`;
        }

        if (result.data?.debt_payment) {
          const amount = Number(result.data.debt_payment.amount ?? 0);
          message += `\n💳 تم سداد ${amount.toFixed(2)} جنيه من الرصيد السابق`;
        }

        if (result.data?.loss_record) {
          const lossAmt = Number(result.data.loss_record.loss_amount || 0);
          message += `\n⚠️ تم تسجيل خسارة نافق بقيمة ${lossAmt.toFixed(2)} جنيه`;
        }

        this.snackBar.open(message, 'حسناً', { duration: 5000 });

        if (isDebtOnly) {
          this.router.navigate(['/operations/daily', this.operationId()]);
          return;
        }

        const transactionId = result.data?.transaction?.id ?? 0;
        const dialogRef = this.dialog.open(ConfirmationDialog, {
          width: '350px', direction: 'rtl',
          data: {
            title: 'تنزيل الفاتورة', message: 'هل تريد تنزيل فاتورة PDF لهذه العملية؟',
            confirmText: 'تنزيل PDF', cancelText: 'تخطي', type: 'info'
          } as ConfirmationDialogData
        });

        dialogRef.afterClosed().subscribe((confirmed: boolean) => {
          if (confirmed && transactionId) this.downloadInvoicePdf(transactionId);
          this.router.navigate(['/operations/daily', this.operationId()]);
        });
      },
      error: (error) => {
        this.submitting.set(false);
        console.error('Error recording sale:', error);
        this.snackBar.open(error.error?.message || 'فشل تسجيل العملية', 'حسناً', { duration: 3000 });
      }
    });
  }

  // ── Payload ───────────────────────────────────────────────────────────────
  // FIXED: old_balance_paid is now sent in normal sale payload too,
  // so the buyer can settle old balance at the same time as a sale.

  buildPayload(): any {
    const formValue      = this.saleForm.getRawValue();
    const oldBalancePaid = formValue.old_balance_paid || 0;

    const paymentMetadata:any = {
      payment_method: formValue.payment_method,
      payment_source_type: this.paymentSource()?.payment_source_type ?? 'SAFE',
      payment_source_id: this.paymentSource()?.payment_source_id ?? null,
      safe_id: this.paymentSource()?.payment_source_type === 'SAFE'
        ? this.paymentSource()?.payment_source_id ?? null
        : null,
      person_type: formValue.person_type,

    };

    if (this.isDebtPaymentOnly()) {
      if(this.selectedBuyerBalance()>0){
          paymentMetadata.received_by_person_id=formValue.received_by_person_id || null
        }else{
          paymentMetadata.paid_by_person_id=formValue.received_by_person_id || null
        }
      return {
        buyer_id:             formValue.buyer_id!,
        old_balance_paid:     oldBalancePaid,
        is_debt_payment_only: true,
        ...paymentMetadata
      };
    }

    return {
      vehicle_id:         formValue.vehicle_id!,
      buyer_id:           formValue.buyer_id!,
      chicken_type_id:    formValue.chicken_type_id!,
      weights:            this.weightEntries().filter(w => w > 0),
      empty_cages_weight: formValue.empty_cages_weight || 0,
      dead_weight:        formValue.dead_weight        || 0,
      price_per_kg:       formValue.price_per_kg       || 0,
      discount_amount:    formValue.discount_amount    || 0,
      paid_amount:        formValue.paid_amount        || 0,
      old_balance_paid:   this.debtAutoApplied() ,
      ...paymentMetadata,
      received_by_person_id: formValue.received_by_person_id || null,

      // Transport loss info
      // safe_id_loss: formValue.safe_id_loss,
      // payment_method_loss: formValue.payment_method_loss,
      price_per_kg_loss: formValue.price_per_kg_loss,
      location_loss: formValue.location_loss,
      isFarmResponsible_loss: formValue.isFarmResponsible_loss,
      farm_id_loss: formValue.farm_id_loss,
      notes_loss: formValue.notes_loss
    };
  }

  // ── UI helpers ────────────────────────────────────────────────────────────

  cancel(): void {
    this.router.navigate(['/operations/daily', this.operationId()]);
  }

  getSubmitButtonText(): string {
    return this.isDebtPaymentOnly() ? 'تسجيل الدفع' : 'تسجيل البيع';
  }

  getBalanceWarningMessage(): string {
    const balance = this.selectedBuyerBalance();
    if (balance > 0) return `⚠️ محل الفراخ مدين لنا: ${balance.toFixed(2)} جنيه`;
    if (balance < 0) return `ℹ️ نحن مدينون لمحل الفراخ: ${Math.abs(balance).toFixed(2)} جنيه (سيُطبَّق تلقائياً)`;
    return '';
  }

  getDebtWarningMessage(): string {
    return this.getBalanceWarningMessage();
  }

  get paymentLabel(): string {
    if (!this.isDebtPaymentOnly()) {
      return 'طريقة الاستلام';
    }
    return this.selectedBuyerBalance() < 0 ? 'طريقة الدفع' : 'طريقة الاستلام';
  }


    get label(): string {
      if (!this.isDebtPaymentOnly()) {
        return 'مصدر الدفع';
      }
      return this.selectedBuyerBalance() < 0  ? 'مصدر الدفع' : 'مصدر الاستلام';
    }

  get personLabel(): string {
    if (!this.isDebtPaymentOnly()) {
      return 'الشخص الذي استلم';
    }
    return this.selectedBuyerBalance() < 0 ? 'الشخص الذي دفع' : 'الشخص الذي استلم';
  }

  // ── PDF invoice (unchanged) ───────────────────────────────────────────────

  downloadInvoicePdf(transactionId: number): void {
    const fv          = this.saleForm.getRawValue();
    const buyerName   = this.buyers().find(b => b.id === fv.buyer_id)?.name || '-';
    const chickenType = this.chickenTypes().find(t => t.id === fv.chicken_type_id)?.name || '-';
    const weights     = this.weightEntries().filter(w => w > 0);
    const gross       = this.grossTotalWeight();
    const net         = this.netSaleWeight();
    const subtotal    = this.subtotalAmount();
    const finalTotal  = this.totalSaleAmount();
    const paid        = fv.paid_amount        || 0;
    const remaining   = this.remainingSaleAmount();
    const pricePerKg  = fv.price_per_kg       || 0;
    const discount    = fv.discount_amount    || 0;
    const emptyCages  = fv.empty_cages_weight || 0;
    const deadWeight  = fv.dead_weight        || 0;
    const invoiceNum  = String(transactionId).padStart(5, '0');
    const today       = new Date();
    const dateStr     = [
      today.getDate().toString().padStart(2, '0'),
      (today.getMonth() + 1).toString().padStart(2, '0'),
      today.getFullYear()
    ].join('/');
    const dateTimeStr = today.toLocaleString('ar-EG');
    const weightRows  = weights.map((w, i) => `<tr><td>${i + 1}</td><td>${w.toFixed(2)} كجم</td></tr>`).join('');

    const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar"><head><meta charset="UTF-8"/>
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Traditional Arabic','Arial Unicode MS',Arial,sans-serif;background:#fff;width:560px;color:#111;font-size:13px;direction:rtl;padding:20px 22px 14px}
  .title{text-align:center;font-size:26px;font-weight:900;letter-spacing:3px}
  .co-name{text-align:center;font-size:13px;font-weight:700;color:#333;margin:2px 0 6px}
  .double-line{border-top:3px double #111;margin:6px 0}.single-line{border-top:1px solid #bbb;margin:8px 0}
  .header-row{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;padding:6px 0}
  .right-block{line-height:1.75;font-size:13px}.right-block .lbl{font-size:10px;color:#888}
  .right-block .val{font-weight:800;font-size:14px}.right-block .sub-val{font-weight:600;font-size:13px}
  .left-block{text-align:left;line-height:1.75;font-size:13px}.left-block .lbl{font-size:10px;color:#888}.left-block .val{font-weight:800;font-size:13px}
  .sec-title{font-size:11px;font-weight:800;color:#555;letter-spacing:1px;margin:10px 0 3px;border-bottom:1px solid #ddd;padding-bottom:2px}
  table{width:100%;border-collapse:collapse;font-size:13px}
  table thead tr{background:#111;color:#fff}table thead th{padding:5px 10px;text-align:center;font-size:12px}
  table tbody td{padding:5px 10px;border:1px solid #ddd;text-align:center}table tbody tr:nth-child(even){background:#f9f9f9}
  table .foot-row td{background:#f0f0f0;font-weight:700;border-top:2px solid #aaa}
  .summary{margin-top:10px;border:1px solid #ccc;border-radius:4px;overflow:hidden}
  .s-row{display:flex;justify-content:space-between;padding:5px 14px;border-bottom:1px solid #eee;font-size:13px}
  .s-row:last-child{border-bottom:none}.s-row .sl{color:#444}.s-row .sv{font-weight:700}
  .s-row.total{background:#111;color:#fff;font-size:14px;font-weight:900;padding:7px 14px}
  .s-row.total .sl,.s-row.total .sv{color:#fff}
  .s-row.rem-row .sl,.s-row.rem-row .sv{color:${remaining > 0 ? '#b45309' : '#166534'};font-weight:700}
  .footer{text-align:center;margin-top:12px;padding-top:7px;border-top:1px solid #ccc;font-size:11px;color:#888;line-height:1.8}
  .footer .thanks{font-size:12px;font-weight:800;color:#222}
</style></head><body>
  <div class="title">فاتورة</div><div class="co-name">درقه للدواجن</div><div class="double-line"></div>
  <div class="header-row">
    <div class="right-block"><div class="lbl">فاتورة إلى</div><div class="val">${buyerName}</div><div class="lbl" style="margin-top:4px">نوع الدواجن</div><div class="sub-val">${chickenType}</div></div>
    <div class="left-block"><div class="lbl">رقم الفاتورة</div><div class="val">${invoiceNum}</div><div class="lbl" style="margin-top:4px">التاريخ</div><div class="val">${dateStr}</div></div>
  </div>
  <div class="double-line"></div>
  <div class="sec-title">قراءات الميزان</div>
  <table><thead><tr><th>#</th><th>الوزن</th></tr></thead><tbody>${weightRows}<tr class="foot-row"><td>إجمالي الخام</td><td>${gross.toFixed(2)} كجم</td></tr></tbody></table>
  <div class="single-line"></div>
  <div class="summary">
    <div class="s-row"><span class="sl">وزن الأقفاص الفارغة</span><span class="sv">- ${emptyCages.toFixed(2)} كجم</span></div>
    <div class="s-row"><span class="sl">وزن الفراخ النافقة</span><span class="sv">- ${deadWeight.toFixed(2)} كجم</span></div>
    <div class="s-row"><span class="sl">صافي الوزن</span><span class="sv">${net.toFixed(2)} كجم</span></div>
    <div class="s-row"><span class="sl">سعر الكيلو</span><span class="sv">${pricePerKg.toFixed(2)} ج.م</span></div>
    ${discount > 0 ? `<div class="s-row"><span class="sl">الإجمالي قبل الخصم</span><span class="sv">${subtotal.toFixed(2)} ج.م</span></div><div class="s-row"><span class="sl">الخصم</span><span class="sv" style="color:#b45309">- ${discount.toFixed(2)} ج.م</span></div>` : ''}
    <div class="s-row total"><span class="sl">إجمالي الفاتورة</span><span class="sv">${finalTotal.toFixed(2)} ج.م</span></div>
    <div class="s-row"><span class="sl">المبلغ المدفوع</span><span class="sv">${paid.toFixed(2)} ج.م</span></div>
    <div class="s-row rem-row"><span class="sl">الرصيد المستحق</span><span class="sv">${remaining.toFixed(2)} ج.م</span></div>
  </div>
  <div class="footer"><div class="thanks">شكراً لتعاملكم معنا</div><div>طُبع: ${dateTimeStr}</div></div>
</body></html>`;

    this._htmlToPdf(html, `invoice-${invoiceNum}-${dateStr.replace(/\//g, '-')}.pdf`);
  }

  private async _htmlToPdf(html: string, filename: string): Promise<void> {
    let iframe: HTMLIFrameElement | null = null;
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')]);
      iframe = document.createElement('iframe');
      Object.assign(iframe.style, { position: 'fixed', top: '0', left: '-9999px', width: '560px', height: '1px', border: 'none', visibility: 'hidden', pointerEvents: 'none' });
      document.body.appendChild(iframe);
      const iframeDoc = iframe.contentDocument!;
      iframeDoc.open(); iframeDoc.write(html); iframeDoc.close();
      await new Promise<void>(resolve => { iframe!.addEventListener('load', () => resolve(), { once: true }); setTimeout(resolve, 500); });
      const body = iframeDoc.body;
      iframe.style.height = `${body.scrollHeight}px`;
      await new Promise<void>(r => setTimeout(r, 100));
      const canvas = await html2canvas(body, { scale: 2, useCORS: true, allowTaint: true, backgroundColor: '#ffffff', logging: false, width: 560, windowWidth: 560, scrollX: 0, scrollY: 0 });
      const imgData = canvas.toDataURL('image/png');
      const mmW = 148;
      const mmH = Math.ceil((canvas.height / canvas.width) * mmW * 2) / 2;
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [mmW, Math.max(mmH, 210)] });
      doc.addImage(imgData, 'PNG', 0, 0, mmW, mmH);
      doc.save(filename);
    } catch (err) {
      console.error('PDF generation failed:', err);
      this.snackBar.open('فشل إنشاء الفاتورة', 'حسناً', { duration: 4000 });
    } finally {
      if (iframe && document.body.contains(iframe)) document.body.removeChild(iframe);
    }
  }
    formatBalance(buyr: Buyer): string {
    return this.farmService.formatBalance(buyr);
  }
    getBalanceTypeClass(buyr: Buyer) {
      return this.farmService.getBalanceColorClass(buyr);
    }

private updatePaymentValidation(): void {
  const shouldRequirePaymentFields = !(
    this.isDebtPaymentOnly() &&
    this.buyerOwesUs()
  );

  const controls = [
    this.saleForm.get('payment_method'),
    this.saleForm.get('safe_id'),
    this.saleForm.get('person_type'),
    this.saleForm.get('received_by_person_id')
  ];

  controls.forEach(control => {
    if (control) {
      if (shouldRequirePaymentFields) {
        control.setValidators([Validators.required]);
      } else {
        control.clearValidators();
      }
      control.updateValueAndValidity();
    }
  });
}

}
