import { Component, Inject, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { OperationService } from '../../../../core/services/operation.service';
import { DailyCost } from '../../../../core/models';
import { PersonSelectorComponent } from '../../../../shared/components/person-selector/person-selector.component';
import { PaymentSourceSelectorComponent } from '../../../../shared/components/payment-source-selector/payment-source-selector.component';
import { PaymentSourceSelection, PersonType } from '../../../../models/custody.models';

@Component({
  selector: 'app-cost-payment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatIconModule,
    PersonSelectorComponent,
    PaymentSourceSelectorComponent
  ],
  templateUrl: './cost-payment-dialog.component.html',
  styles: [`
    .dialog-content {
      display: flex;
      direction: rtl;
      flex-direction: column;
      gap: 16px;
      min-width: 400px;
      padding-top: 20px;
    }
    .full-width { width: 100%; }
    .amount-info {
      background: #f5f5f5;
      padding: 12px;
      border-radius: 4px;
      margin-bottom: 8px;
    }
    .amount-info p { margin: 4px 0; }
    .overpay-warning {
      background: #fff8e1;
      border: 1px solid #ffc107;
      border-radius: 4px;
      padding: 10px 14px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: #7b5800;
      margin-top: 4px;
    }
    .overpay-warning mat-icon {
      font-size: 18px;
      height: 18px;
      width: 18px;
      color: #f9a825;
    }
  `]
})
export class CostPaymentDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private operationService = inject(OperationService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<CostPaymentDialogComponent>);

  submitting = signal(false);
  isOverpaying = signal(false);

  // FIX: paymentSource signal needed by template
  paymentSource = signal<PaymentSourceSelection | null>(null);

  paymentForm = this.fb.group({
    amount: [0, [Validators.required, Validators.min(0.01)]],
    payment_method: ['CASH', Validators.required],
    paid_by_person_type: [null as string | null],
    paid_by_person_id: [null as number | null],
    safe_id: [null as number | null],
    notes: ['']
  });

  // FIX: computed signals the template relies on
  currentPersonId = computed(() => this.paymentForm.get('paid_by_person_id')?.value ?? null);
  currentPersonType = computed(() => {
    const type = this.paymentForm.get('paid_by_person_type')?.value;
    return (type as PersonType | null) ?? null;
  });

  // FIX: balance used by payment-source-selector — read from cost's current_balance or remaining
  selectedCostBalance = computed(() => {
    const cost = this.data?.cost as any;
    // current_balance is what CostCategory carries; fall back to remaining_amount
    return cost?.current_balance ?? cost?.remaining_amount ?? 0;
  });

  constructor(@Inject(MAT_DIALOG_DATA) public data: { cost: DailyCost }) {}

  ngOnInit(): void {
    if (this.data.cost) {
      const remaining = this.data.cost.remaining_amount ?? 0;

      this.paymentForm.get('amount')?.setValidators([
        Validators.required,
        Validators.min(0.01),
      ]);
      this.paymentForm.patchValue({ amount: remaining });

      this.paymentForm.get('amount')?.valueChanges.subscribe(val => {
        this.isOverpaying.set((val ?? 0) > remaining);
      });
    }
  }

  onSubmit(): void {
    if (this.paymentForm.invalid) return;
    this.submitting.set(true);

    const costAny = this.data.cost as any;

    const payload = {
      amount: this.paymentForm.value.amount ?? 0,
      operation_id: costAny.operation_id ?? costAny.daily_operation_id,
      payment_method: this.paymentForm.value.payment_method ?? 'CASH',
      // FIX: use paymentSource signal for safe_id
      safe_id: this.paymentSource()?.payment_source_type === 'SAFE'
        ? this.paymentSource()?.payment_source_id ?? undefined
        : undefined,
      payment_source_type: this.paymentSource()?.payment_source_type ?? 'SAFE',
      payment_source_id: this.paymentSource()?.payment_source_id ?? undefined,
      person_type: this.paymentForm.value.paid_by_person_type ?? undefined,
      notes: this.paymentForm.value.notes ?? undefined,
      payment_direction :'TO_CATEGORY',
      paid_by_person_id : this.paymentForm.value.paid_by_person_id ?? undefined
    };

    this.operationService.recordCostPayment(
      costAny.cost_category_id ?? costAny.category_id ?? costAny.category?.id,
      payload
    ).subscribe({
      next: (res: any) => {
        this.snackBar.open('تم تسجيل الدفعة بنجاح', 'حسناً', { duration: 3000 });
        this.dialogRef.close(res?.data ?? res);
      },
      error: (error) => {
        this.submitting.set(false);
        this.snackBar.open(error.error?.message || 'فشل تسجيل الدفعة', 'حسناً', { duration: 3000 });
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
