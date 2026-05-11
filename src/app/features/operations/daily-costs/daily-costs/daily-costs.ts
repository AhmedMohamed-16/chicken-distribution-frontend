import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ActivatedRoute, Router } from '@angular/router';
import { OperationService } from '../../../../core/services/operation.service';
import { CostCategoryService } from '../../../../core/services/cost-category.service';
import { HttpErrorResponse } from '@angular/common/http';
import { CostCategory, DailyCost, DailyOperation } from '../../../../core/models';
import { ReportUtilitiesService } from '../../../../core/services/ReportUtilitiesService';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CostPaymentDialogComponent } from '../cost-payment-dialog/cost-payment-dialog.component';
import { PersonSelectorComponent } from '../../../../shared/components/person-selector/person-selector.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { startWith } from 'rxjs';
import { MatDividerModule } from '@angular/material/divider';
import { FarmService } from '../../../../core/services/farm.service';
import { PaymentSourceSelectorComponent } from '../../../../shared/components/payment-source-selector/payment-source-selector.component';
import { PaymentSourceSelection } from '../../../../models/custody.models';

@Component({
  selector: 'app-daily-costs',
  imports: [ CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatDialogModule,
    PersonSelectorComponent,
    MatChipsModule,
    MatTooltipModule,
    MatSlideToggleModule,
    MatDividerModule,
    PaymentSourceSelectorComponent
],
  templateUrl: './daily-costs.html',
  styleUrl: './daily-costs.css',
})
export class DailyCosts implements OnInit {
  // private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  // private operationService = inject(OperationService);
  private snackBar = inject(MatSnackBar);
  private costCategoryService = inject(CostCategoryService);
  private dialog = inject(MatDialog);
  loading = signal(false);

  submitting = signal(false);
  operationId = signal<number>(0);
  // categories = signal<any[]>([]);
private fb = inject(FormBuilder);
  private costService = inject(OperationService);

  operation = signal<DailyOperation | null>(null);
  costCategories = signal<CostCategory[]>([]);
  costs = signal<DailyCost[]>([]);
  selectedCategory = signal<CostCategory | null>(null);

  // NEW: Signals for debt payment mode
  isDebtPaymentOnly = signal(false);
  unpaidCosts = signal<any[]>([]);
  selectedCostForPayment = signal<any | null>(null);
  paymentSource = signal<PaymentSourceSelection | null>(null);
  loadingUnpaid = signal(false);



  costForm = this.fb.nonNullable.group({
    cost_category_id: [null as number | null, Validators.required],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    description: [''],
    vehicle_id: [null as number | null],  // Conditionally required

    // NEW: Payment metadata
    paid_amount: [0, [Validators.min(0)]],
    payment_method: ['CASH'],
    safe_id: [null as number | null],
    paid_by_person_type: [null as string | null],
    paid_by_person_id: [null as number | null],

    // NEW: Debt payment mode fields
    is_debt_payment_only: [false],
    payment_amount: [0, [Validators.min(0)]], // used in debt-only mode
  });

  // ✅ Compute visibility for payment method selector
  paidAmountSignal = toSignal(this.costForm.get('paid_amount')!.valueChanges.pipe(startWith(0)));
  paymentAmountSignal = toSignal(this.costForm.get('payment_amount')!.valueChanges.pipe(startWith(0)));
  showPaymentSelector = computed(() => {
    if (this.isDebtPaymentOnly()) return (this.paymentAmountSignal() || 0) > 0;
    return (this.paidAmountSignal() || 0) > 0;
  });
  paymentSourceAmount = computed(() => {
    if (this.isDebtPaymentOnly()) return this.paymentAmountSignal() || 0;
    return this.paidAmountSignal() || 0;
  });
  currentPersonType = computed(() => (this.costForm.value.paid_by_person_type as 'EMPLOYEE' | 'PARTNER' | null) ?? null);
  currentPersonId = computed(() => this.costForm.value.paid_by_person_id ?? null);
  isPaymentSourceValid = computed(() => !this.showPaymentSelector() || this.paymentSource() !== null);

  // ✅ Compute remaining amount for UI hint
  amountSignal = toSignal(this.costForm.get('amount')!.valueChanges, { initialValue: 0 });
  remainingAmount = computed(() => {
    const total = this.amountSignal() || 0;
    const paid = this.paidAmountSignal() || 0;
    return total - paid;
  });

  // NEW: Computed signal for debt-only mode

private utils = inject(ReportUtilitiesService);
 formatNumber = (num: number | undefined | null|string, decimals?: number) => this.utils.formatNumber(num, decimals);

  ngOnInit() {
    this.operationId.set(+this.route.snapshot.params['id']);
    this.loadOperation();
    this.loadCategories();
    // ✅ Watch category changes to enforce vehicle selection
    this.costForm.get('cost_category_id')?.valueChanges.subscribe(id => {
      const category = this.costCategories().find(c => c.id === id);
      this.selectedCategory.set(category || null);

      // ✅ Make vehicle_id required for vehicle costs
      if (category?.is_vehicle_cost) {
        this.costForm.get('vehicle_id')?.setValidators([Validators.required]);
      } else {
        this.costForm.get('vehicle_id')?.clearValidators();
        this.costForm.patchValue({ vehicle_id: null });
      }

      this.costForm.get('vehicle_id')?.updateValueAndValidity();
    });
  }
  // ngOnInit(): void {
  //   this.operationId.set(+this.route.snapshot.params['id']);
  //   this.loadCategories();

  // }
  loadOperation(): void {
this.loading.set(true);
    this.costService.getOperation(this.operationId()).subscribe({
      next: (res: any) => {
        // إذا API بيرجع { data: [] } أو مصفوفة مباشرة
        this.operation.set(res?.data ?? res);
        console.log(this.operation());

        this.loading.set(false);
      },
      error: () => {
        this.snackBar.open('فشل تحميل العمليه', 'حسناً', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  loadUnpaidCosts(): void {
    this.loadingUnpaid.set(true);
    this.costService.getUnpaidCosts().subscribe({
      next: (res: any) => {
        this.unpaidCosts.set(res?.data ?? res);
        console.log("this.unpaidCosts",this.unpaidCosts());

        this.loadingUnpaid.set(false);
      },
      error: (err:HttpErrorResponse) => {
        this.snackBar.open(err.error.message||'فشل تحميل التكاليف غير المدفوعة', 'حسناً', { duration: 3000 });
        this.loadingUnpaid.set(false);
      }
    });
  }

  onCostSelected(categoryId: number): void {
    const costAgg = this.unpaidCosts().find(c => c.category_id === categoryId);
    this.selectedCostForPayment.set(costAgg || null);
    if (costAgg) {
      this.costForm.patchValue({ payment_amount: costAgg.total_unpaid });
    }
  }

  onModeToggle(isDebtOnly: boolean): void {
    this.isDebtPaymentOnly.set(isDebtOnly);
    if (isDebtOnly) {
      this.loadUnpaidCosts();
      // Clear normal form validators
      ['cost_category_id', 'amount'].forEach(field => {
        this.costForm.get(field)?.clearValidators();
        this.costForm.get(field)?.updateValueAndValidity();
      });
      this.costForm.get('payment_amount')?.setValidators([Validators.required, Validators.min(0.01)]);
      this.costForm.get('payment_amount')?.updateValueAndValidity();
    } else {
      this.selectedCostForPayment.set(null);
      // Restore normal form validators
      this.costForm.get('cost_category_id')?.setValidators([Validators.required]);
      this.costForm.get('amount')?.setValidators([Validators.required, Validators.min(0.01)]);
      this.costForm.get('cost_category_id')?.updateValueAndValidity();
      this.costForm.get('amount')?.updateValueAndValidity();
      this.costForm.get('payment_amount')?.clearValidators();
      this.costForm.get('payment_amount')?.updateValueAndValidity();
    }
  }
  loadCategories(): void {
    this.loading.set(true);
    this.costCategoryService.getAll().subscribe({
      next: (res: any) => {
        // إذا API بيرجع { data: [] } أو مصفوفة مباشرة
        this.costCategories.set(res?.data ?? res);
        this.loading.set(false);
      },
      error: () => {
        this.snackBar.open('فشل تحميل فئات التكاليف', 'حسناً', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  // onSubmit(): void {
  //   if (this.costForm.invalid) return;

  //   this.submitting.set(true);
  //   const payload = this.costForm.getRawValue();

  //   this.operationService.recordCost(this.operationId(), payload as any).subscribe({
  //     next: () => {
  //       this.snackBar.open('تم تسجيل التكلفة بنجاح', 'حسناً', { duration: 3000 });
  //       this.router.navigate(['/operations/daily', this.operationId()]);
  //     },
  //     error: (error:HttpErrorResponse) => {
  //       this.submitting.set(false);
  //       this.snackBar.open(error.error?.message||'فشل تسجيل التكلفة', 'حسناً', { duration: 3000 });
  //     }
  //   });
  // }

  onSubmit() {
    if (this.costForm.invalid || !this.operation()) return;
    if (!this.isPaymentSourceValid()) {
      this.snackBar.open('يجب اختيار مصدر الدفع', 'حسناً', { duration: 3000 });
      return;
    }
    this.submitting.set(true);

    if (this.isDebtPaymentOnly()) {

      // DEBT PAYMENT MODE
      const costAgg = this.selectedCostForPayment();
     const payment:any={};
      if (!costAgg) {
        this.snackBar.open('يرجى اختيار التكلفة المراد سدادها', 'حسناً', { duration: 3000 });
        this.submitting.set(false);
        return;
      }

       if(costAgg?.current_balance <= 0){
        payment.payment_direction='TO_CATEGORY';
        payment.paid_by_person_id=this.costForm.value.paid_by_person_id || undefined;
      }
      else {

        payment.payment_direction='FROM_CATEGORY';
      payment.received_by_person_id=this.costForm.value.paid_by_person_id || undefined;

      }
      const paymentData = {
        amount: this.costForm.value.payment_amount,

        operation_id: this.operation()!.id,
        notes: this.costForm.value.description || undefined,
        payment_method: this.costForm.value.payment_method || 'CASH',
        payment_source_type: this.paymentSource()?.payment_source_type ?? 'SAFE',
        payment_source_id: this.paymentSource()?.payment_source_id ?? undefined,
        safe_id: this.paymentSource()?.payment_source_type === 'SAFE'
          ? this.paymentSource()?.payment_source_id ?? undefined
          : undefined,
        person_type: this.costForm.value.paid_by_person_type || undefined,
        ...payment
      };

      this.costService.recordCostPayment(costAgg.category_id, paymentData).subscribe({
        next: (res: any) => {
          this.snackBar.open('تم تسجيل الدفعة بنجاح', 'حسناً', { duration: 3000 });
          this.submitting.set(false);
          this.costForm.patchValue({ payment_amount: 0 });
          this.selectedCostForPayment.set(null);
          this.loadUnpaidCosts(); // refresh list
          this.loadOperation(); // reload original costs too
        },
        error: (error: any) => {
          this.submitting.set(false);
          console.log("error.error?.message",error.error?.message);

          this.snackBar.open(error.error?.message || 'فشل تسجيل الدفعة', 'حسناً', { duration: 3000 });
        }
      });

    } else {
      // NORMAL COST RECORDING MODE
      const data = {
        cost_category_id: this.costForm.value.cost_category_id!,
        vehicle_id: this.costForm.value.vehicle_id || undefined,
        amount: this.costForm.value.amount!,
        description: this.costForm.value.description || undefined,
        paid_amount: this.costForm.value.paid_amount || 0,
        payment_method: this.costForm.value.payment_method || 'CASH',
        payment_source_type: this.paymentSource()?.payment_source_type ?? 'SAFE',
        payment_source_id: this.paymentSource()?.payment_source_id ?? undefined,
        safe_id: this.paymentSource()?.payment_source_type === 'SAFE'
          ? this.paymentSource()?.payment_source_id ?? undefined
          : undefined,
        paid_by_person_type: this.costForm.value.paid_by_person_type || undefined,
        paid_by_person_id: this.costForm.value.paid_by_person_id || undefined,
      };
      this.costService.recordCost(this.operation()!.id, data).subscribe({
        next: (cost: any) => {
          this.snackBar.open('تم تسجيل التكلفة بنجاح', 'حسناً', { duration: 3000 });
          console.log("cost",cost);
          this.costs.update(list => [...list, cost.data.cost]);

          this.costForm.reset({ payment_method: 'CASH', paid_amount: 0 });
          this.submitting.set(false);
          this.loadOperation(); // reload to get updated balances
        },
        error: (error: any) => {
          this.submitting.set(false);
          this.snackBar.open(error.error?.message || 'فشل تسجيل التكلفة', 'حسناً', { duration: 3000 });
        }
      });
    }
  }

  getVehicleName(vehicleId: number): string {
    return this.operation()?.vehicles?.find(v => v.id === vehicleId)?.name || '';
  }
  cancel(): void {
    this.router.navigate(['/operations/daily', this.operationId()]);
  }

  // ✅ Status helper for table
  getStatusInfo(cost: DailyCost) {
    if (cost.is_paid && cost.paid_amount >= cost.amount) {
      return { label: 'مدفوع', color: 'success' };
    }
    if ( cost.paid_amount > 0) {
      return { label: 'جزئي', color: 'warning' };
    }
    return { label: 'غير مدفوع', color: 'error' };
  }


  openPaymentDialog(cost: DailyCost): void {
  cost.operation_id = this.operation()!.id;
console.log("openPaymentDialog",cost);

  const dialogRef = this.dialog.open(CostPaymentDialogComponent, {
    width: '500px',
    data: { cost }
  });

  dialogRef.afterClosed().subscribe((res: any) => {
    console.log("res",res);
    if (!res?.payment) return;
    console.log("!res?.payment",!res?.payment);

    const paidNow = parseFloat(res.payment.amount ?? '0');
    const categoryId = res.payment.cost_category_id;

    this.costs.update(list =>
      list.map(c => {
        // Match by original cost object reference (same id passed in)
        if (c.id !== cost.id) return c;
        const paid_amount=parseFloat(c.paid_amount.toString());
        const amount=parseFloat(c.amount.toString());

        const newPaid = (paid_amount ?? 0) + paidNow;
        const newRemaining = Math.max(0, (amount ?? 0) - newPaid);

        return {
          ...c,
          paid_amount: newPaid,
          remaining_amount: newRemaining,
          is_paid: newRemaining <= 0,
        };
      })
    );
  });
}


get paymentValueLabel(): string {
  const cost = this.selectedCostForPayment();


  return cost.balance_type === 'PAYABLE'
    ? ''
    : 'طريقة الاستلام';
}



// ─── PATCH: replace the getter methods at the bottom of DailyCosts class ───
// These are the null-safe versions. The rest of the component stays the same.

get paymentLabel(): string {
  const cost = this.selectedCostForPayment();
  if (!this.isDebtPaymentOnly() || !cost) {
    return 'طريقة الدفع';
  }
  return (cost.balance_type === 'PAYABLE' || (cost.current_balance ?? 0) < 0)
    ? 'طريقة الدفع'
    : 'طريقة الاستلام';
}

get label(): string {
  if (!this.isDebtPaymentOnly()) {
    return 'مصدر الدفع';
  }
  const cost = this.selectedCostForPayment();
  if (!cost) return 'مصدر الدفع';
  return (cost.balance_type === 'PAYABLE' || (cost.current_balance ?? 0) < 0)
    ? 'مصدر الدفع'
    : 'مصدر الاستلام';
}

get personLabel(): string {
  const cost = this.selectedCostForPayment();
  if (!this.isDebtPaymentOnly() || !cost) {
    return 'الشخص الذي دفع';
  }
  return (cost.balance_type === 'PAYABLE' || (cost.current_balance ?? 0) < 0)
    ? 'الشخص الذي دفع'
    : 'الشخص الذي استلم';
}

// FIX: selectedCostBalance must guard null
selectedCostBalance = computed(() => {
  const costAgg = this.selectedCostForPayment();
  if (!costAgg) return 0;
  // current_balance is the authoritative field from backend; fall back to total_unpaid
  return costAgg.current_balance ?? costAgg.total_unpaid ?? 0;
});

// FIX: getBalanceTypeClass and formatBalance guard null
formatBalance(cost: CostCategory | null | undefined): string {
  if (!cost?.current_balance) return '0.00';
  return this.utils.formatNumber(cost.current_balance);
}


getBalanceTypeClass(cost: CostCategory | null | undefined): string {
  const balance = cost?.current_balance ?? 0;
  if (balance > 0) return 'balance-receivable';
  if (balance < 0) return 'balance-payable';
  return 'balance-settled';
  }
getCostBalanceClass(cost: CostCategory | null | undefined): string {
  if (!cost) return 'cost-balance-zero';
  const balance = cost.current_balance ?? 0;
  if (balance > 0) return 'cost-balance-positive';
  if (balance < 0) return 'cost-balance-negative';
  return 'cost-balance-zero';
}
}

