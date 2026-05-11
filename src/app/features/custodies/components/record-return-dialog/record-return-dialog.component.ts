import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PaymentMethod } from '../../../../models/custody.models';
import { CustodyService } from '../../../../core/services/custody.service';
import { startWith } from 'rxjs';
import { Safe } from '../../../../core/models/safe.model';
import { ReportUtilitiesService } from '../../../../core/services/ReportUtilitiesService';
import { PaymentMethodSelectorComponent } from '../../../../shared/components/payment-method-selector/payment-method-selector.component';

export interface RecordReturnDialogData {
  custodyId: number;
  unaccountedAmount: number;
}

@Component({
  selector: 'app-record-return-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    PaymentMethodSelectorComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title class="dialog-title">
      تسجيل إرجاع عهدة
    </h2>

    <mat-dialog-content class="dialog-content-wrapper">
      <div class="dialog-content">
        @if (custodyService.error()) {
          <div class="error-box" role="alert">
            <mat-icon class="error-icon">error_outline</mat-icon>
            <span>{{ custodyService.error() }}</span>
          </div>
        }

        @if (hasValidAmount()) {
          <div class="info-box">
            <mat-icon class="info-icon">info_outline</mat-icon>
            <div class="info-content">
              <span class="info-label">المبلغ غير المحاسَب:</span>
              <span class="info-value">{{ formatCurrency(unaccountedAmount()) }}</span>
            </div>
          </div>
        } @else {
          <div class="error-box" role="alert">
            <mat-icon class="error-icon">error_outline</mat-icon>
            <span>خطأ: مبلغ غير محاسَب غير متاح</span>
          </div>
        }

        <form class="form-content" [formGroup]="form" (ngSubmit)="submit()">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>المبلغ المُرجَع</mat-label>
            <input
              matInput
              type="number"
              min="0.01"
              step="0.01"
              formControlName="amount"
              placeholder="0.00"
            />
            <span matSuffix class="currency-suffix">جنيه</span>
            @if (form.controls.amount.errors?.['maxUnaccounted']) {
              <mat-error class="field-error">
                ⚠️ المبلغ يتجاوز المتبقي غير المحاسَب
              </mat-error>
            }
            <mat-hint class="field-hint">
              المتبقي بعد الإرجاع:
              <strong>{{ remainingAfterReturn() | number: '1.2-2' }}</strong> جنيه
            </mat-hint>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>تاريخ الإرجاع</mat-label>
            <input
              matInput
              [matDatepicker]="picker"
              formControlName="return_date"
            />
            <mat-datepicker-toggle
              matSuffix
              [for]="picker"
            ></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
          </mat-form-field>

          <app-payment-method-selector
            [parentForm]="form"
          ></app-payment-method-selector>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>ملاحظات (اختياري)</mat-label>
            <textarea
              matInput
              formControlName="notes"
              rows="3"
              placeholder="ملاحظات حول دفعة الإرجاع..."
              class="notes-textarea"
            ></textarea>
          </mat-form-field>

          @if (submitError()) {
            <div class="error-box submit-error" role="alert">
              <mat-icon class="error-icon">error_outline</mat-icon>
              <span>{{ submitError() }}</span>
            </div>
          }
        </form>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="dialog-actions">
      <button mat-button type="button" (click)="onCancel()" [disabled]="submitting()" class="cancel-btn">
        إلغاء
      </button>
      <button
        mat-raised-button
        color="primary"
        type="submit"
        (click)="submit()"
        [disabled]="
          custodyService.loading() ||
          form.invalid ||
          submitting() ||
          !hasValidAmount()
        "
        class="submit-btn">
        @if (submitting()) {
          <mat-spinner diameter="20" class="btn-spinner"></mat-spinner>
        } @else {
          <mat-icon>check_circle</mat-icon>
        }
        <span class="btn-text">تسجيل الإرجاع</span>
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    /* -------------------------------------------------------------------
       Record Return Dialog - Modern ERP Responsive Styles
       Mobile-First | RTL-Friendly | Accessible | Clean Architecture
    -------------------------------------------------------------------- */

    /* ---------------------------- Variables ---------------------------- */
    :host {
      --c-dialog-radius: 16px;
      --c-space-xs: 4px;
      --c-space-sm: 8px;
      --c-space-md: 12px;
      --c-space-lg: 16px;
      --c-space-xl: 20px;
      --c-space-2xl: 24px;
      --c-primary: #1976d2;
      --c-primary-dark: #1565c0;
      --c-error: #c53030;
      --c-error-bg: #fff5f5;
      --c-info-bg: #f7fafc;
      --c-info-border: #3182ce;
      --c-border: #e2e8f0;
      --c-text-primary: #2d3748;
      --c-text-secondary: #4a5568;
      --c-bg-subtle: #fafafa;
      --c-transition: all 0.2s ease;
    }

    /* ---------------------------- Dialog Title ------------------------- */
    .dialog-title {
      text-align: right;
      color: var(--c-text-primary);
      font-weight: 800;
      font-size: clamp(1.125rem, 4vw, 1.375rem);
      margin: 0;
      padding: var(--c-space-xl) var(--c-space-2xl) var(--c-space-md) var(--c-space-2xl);
      border-bottom: 2px solid var(--c-border);
      background: linear-gradient(to bottom, #ffffff, var(--c-bg-subtle));
    }

    /* ---------------------------- Dialog Content ----------------------- */
    .dialog-content-wrapper {
      display: block;
      padding: 0 !important;
      max-height: 70vh;
      overflow-y: auto;
    }

    .dialog-content {
      display: flex;
      flex-direction: column;
      gap: var(--c-space-lg);
      padding: clamp(16px, 4vw, 24px);
      direction: rtl;
    }

    /* ---------------------------- Form Content ------------------------- */
    .form-content {
      display: flex;
      flex-direction: column;
      gap: var(--c-space-lg);
    }

    .full-width {
      width: 100%;
    }

    /* Currency Suffix */
    .currency-suffix {
      color: var(--c-text-secondary);
      font-weight: 500;
      margin-inline-start: var(--c-space-sm);
    }

    /* Field Hint */
    .field-hint {
      font-size: 0.75rem;
      color: var(--c-text-secondary);
    }

    .field-hint strong {
      color: var(--c-primary);
      font-weight: 700;
    }

    /* Field Error */
    .field-error {
      font-weight: 500;
    }

    /* Textarea */
    .notes-textarea {
      resize: vertical;
      min-height: 80px;
    }

    /* ---------------------------- Info Box ----------------------------- */
    .info-box {
      display: flex;
      align-items: center;
      gap: var(--c-space-md);
      background: var(--c-info-bg);
      padding: var(--c-space-lg);
      border-radius: 12px;
      border-inline-start: 4px solid var(--c-info-border);
      margin-bottom: var(--c-space-sm);
      transition: var(--c-transition);
    }

    .info-icon {
      color: var(--c-info-border);
      font-size: 24px;
      width: 24px;
      height: 24px;
      flex-shrink: 0;
    }

    .info-content {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: var(--c-space-sm);
      flex: 1;
    }

    .info-label {
      font-size: clamp(0.875rem, 3vw, 0.95rem);
      color: var(--c-text-secondary);
    }

    .info-value {
      font-weight: 800;
      font-size: clamp(1rem, 3.5vw, 1.1rem);
      color: var(--c-text-primary);
    }

    /* ---------------------------- Error Box ---------------------------- */
    .error-box {
      display: flex;
      align-items: center;
      gap: var(--c-space-sm);
      background: var(--c-error-bg);
      padding: var(--c-space-md) var(--c-space-lg);
      border-radius: 8px;
      border-inline-start: 4px solid var(--c-error);
      color: var(--c-error);
      font-size: 0.875rem;
      animation: slideInRight 0.3s ease-out;
    }

    @keyframes slideInRight {
      from {
        opacity: 0;
        transform: translateX(20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .error-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }

    .submit-error {
      margin-top: var(--c-space-sm);
    }

    /* ---------------------------- Dialog Actions ----------------------- */
    .dialog-actions {
      padding: var(--c-space-lg) var(--c-space-2xl);
      border-top: 1px solid var(--c-border);
      background: var(--c-bg-subtle);
      gap: var(--c-space-md);
      flex-wrap: wrap;
    }

    /* Buttons */
    .cancel-btn {
      min-width: 100px;
      font-weight: 500;
      transition: var(--c-transition);
    }

    .cancel-btn:hover:not(:disabled) {
      background: rgba(0, 0, 0, 0.04);
      transform: translateY(-1px);
    }

    .submit-btn {
      min-width: 140px;
      font-weight: 700;
      height: clamp(40px, 10vh, 48px);
      border-radius: 8px;
      transition: var(--c-transition);
      display: inline-flex;
      align-items: center;
      gap: var(--c-space-sm);
    }

    .submit-btn:not(:disabled):hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
    }

    .submit-btn:active:not(:disabled) {
      transform: translateY(0);
    }

    .btn-spinner {
      display: inline-block;
    }

    .btn-text {
      margin-inline-start: var(--c-space-xs);
    }

    /* Disabled state */
    .submit-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* ---------------------------- Responsive Breakpoints -------------- */

    /* Mobile (0px - 767px) */
    @media (max-width: 767px) {
      .dialog-title {
        padding: var(--c-space-lg) var(--c-space-lg) var(--c-space-md) var(--c-space-lg);
      }

      .dialog-content {
        padding: var(--c-space-lg);
        gap: var(--c-space-md);
      }

      .dialog-actions {
        padding: var(--c-space-md) var(--c-space-lg);
        flex-direction: column-reverse;
        gap: var(--c-space-sm);
      }

      .cancel-btn,
      .submit-btn {
        width: 100%;
        min-width: unset;
      }

      .form-content {
        gap: var(--c-space-md);
      }

      .info-box {
        padding: var(--c-space-md);
        flex-direction: column;
        align-items: flex-start;
      }

      .info-content {
        width: 100%;
        justify-content: space-between;
      }

      .error-box {
        padding: var(--c-space-sm) var(--c-space-md);
        font-size: 0.8rem;
      }
    }

    /* Tablet (768px - 1023px) */
    @media (min-width: 768px) and (max-width: 1023px) {
      .dialog-title {
        padding: var(--c-space-xl) var(--c-space-2xl) var(--c-space-md) var(--c-space-2xl);
      }

      .dialog-content {
        padding: var(--c-space-xl);
      }

      .dialog-actions {
        padding: var(--c-space-lg) var(--c-space-2xl);
      }

      .cancel-btn,
      .submit-btn {
        min-width: 120px;
      }
    }

    /* Desktop (1024px+) */
    @media (min-width: 1024px) {
      .dialog-title {
        padding: var(--c-space-xl) var(--c-space-3xl) var(--c-space-md) var(--c-space-3xl);
      }

      .dialog-content {
        padding: var(--c-space-2xl);
      }

      .dialog-actions {
        padding: var(--c-space-lg) var(--c-space-3xl);
      }
    }

    /* ---------------------------- RTL Support -------------------------- */
    [dir="rtl"] .dialog-title {
      text-align: right;
    }

    [dir="rtl"] .info-box {
      border-inline-start: 4px solid var(--c-info-border);
      border-inline-end: none;
    }

    [dir="rtl"] .error-box {
      border-inline-start: 4px solid var(--c-error);
      border-inline-end: none;
    }

    /* ---------------------------- Accessibility ------------------------ */

    /* Focus states */
    button:focus-visible,
    input:focus-visible,
    textarea:focus-visible {
      outline: 2px solid var(--c-primary);
      outline-offset: 2px;
    }

    /* Reduced Motion */
    @media (prefers-reduced-motion: reduce) {
      .error-box,
      .info-box,
      .cancel-btn,
      .submit-btn {
        animation: none;
        transition: none;
      }

      .submit-btn:not(:disabled):hover {
        transform: none;
      }
    }

    /* High Contrast Mode */
    @media (prefers-contrast: high) {
      .info-box {
        border: 1px solid var(--c-info-border);
      }

      .error-box {
        border: 1px solid var(--c-error);
      }

      .submit-btn {
        border: 1px solid currentColor;
      }
    }

    /* Touch-Friendly Targets */
    @media (hover: none) and (pointer: coarse) {
      .cancel-btn,
      .submit-btn {
        min-height: 48px;
      }

      input,
      textarea,
      .mat-mdc-form-field {
        font-size: 16px !important;
      }
    }

    /* ---------------------------- Scrollbar Styling -------------------- */
    .dialog-content-wrapper::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }

    .dialog-content-wrapper::-webkit-scrollbar-track {
      background: var(--c-border);
      border-radius: 3px;
    }

    .dialog-content-wrapper::-webkit-scrollbar-thumb {
      background: #cbd5e0;
      border-radius: 3px;
    }

    .dialog-content-wrapper::-webkit-scrollbar-thumb:hover {
      background: #a0aec0;
    }
  `]
})
export class RecordReturnDialogComponent {
  // ── Inject dialog data instead of using input() signals ──────────────────
  private dialogData = inject<RecordReturnDialogData>(MAT_DIALOG_DATA);

  private fb = inject(FormBuilder);
  custodyService = inject(CustodyService);
  private snackBar = inject(MatSnackBar);
  private utils = inject(ReportUtilitiesService);
  private dialogRef = inject(MatDialogRef<RecordReturnDialogComponent>);

  safes = signal<Safe[]>([]);
  submitError = signal<string | null>(null);
  submitting = signal(false);

  // Expose data as signals so the template keeps working unchanged
  readonly unaccountedAmount = signal<number | undefined>(
    this.dialogData?.unaccountedAmount
  );
  readonly custodyId = signal<number>(this.dialogData?.custodyId);

  hasValidAmount = computed(() => {
    const amt = this.unaccountedAmount();
    return amt != null && amt > 0;
  });

  form = this.fb.group({
    amount: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(0.01),
      this.maxUnaccountedValidator(),
    ]),
    return_date: this.fb.nonNullable.control(this.today(), [
      Validators.required,
    ]),
    safe_id: this.fb.control<number | null>(null),
    payment_method: this.fb.nonNullable.control<PaymentMethod>('CASH', [
      Validators.required,
    ]),
    notes: this.fb.nonNullable.control(''),
  });

  private formValue = toSignal(
    this.form.valueChanges.pipe(startWith(this.form.getRawValue())),
    { initialValue: this.form.getRawValue() }
  );

  remainingAfterReturn = computed(() => {
    const unaccounted = this.unaccountedAmount() ?? 0;
    return unaccounted - (this.formValue()?.amount ?? 0);
  });

  constructor() {
    this.custodyService.getActiveSafes({ silent: true }).subscribe({
      next: (safes) => this.safes.set(safes),
    });
  }

  submit(): void {
    if (this.form.invalid || !this.hasValidAmount()) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitError.set(null);
    this.submitting.set(true);
    const value = this.form.getRawValue();
    this.custodyService
      .recordReturn(this.custodyId(), {
        amount: value.amount!,
        return_date: value.return_date,
        safe_id: value.safe_id,
        payment_method: value.payment_method,
        notes: value.notes || '',
      })
      .subscribe({
        next: () => {
          this.snackBar.open('تم تسجيل استلام المبلغ بنجاح', 'حسناً', {
            duration: 3000,
          });
          this.dialogRef.close(true);
        },
        error: (error: { error?: { message?: string } }) => {
          this.submitError.set(
            error.error?.message ?? 'فشل تسجيل الإرجاع'
          );
          this.submitting.set(false);
        },
      });
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  private maxUnaccountedValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = Number(control.value);
      if (!Number.isFinite(value)) return null;

      const unaccounted = this.unaccountedAmount();
      if (unaccounted == null) return null;

      return value <= unaccounted ? null : { maxUnaccounted: true };
    };
  }

  formatCurrency = (amt: number | undefined | null) =>
    this.utils.formatCurrency(amt);

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
