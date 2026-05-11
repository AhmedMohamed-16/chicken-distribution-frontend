import { ChangeDetectionStrategy, Component, computed, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { forkJoin, startWith } from 'rxjs';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CustodyService } from '../../../../core/services/custody.service';
import { PersonType, PaymentMethod } from '../../../../models/custody.models';
import { Safe } from '../../../../core/models/safe.model';
import { PaymentMethodSelectorComponent } from '../../../../shared/components/payment-method-selector/payment-method-selector.component';
import { PersonSelectorComponent } from '../../../../shared/components/person-selector/person-selector.component';

@Component({
  selector: 'app-create-custody-dialog',
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
    PersonSelectorComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title class="dialog-title">
  إنشاء عهدة جديدة
</h2>

<mat-dialog-content class="dialog-content">
  <div class="dialog-content-wrapper">

    @if (optionsLoading()) {
      <div class="loading-skeleton">
        <div class="skeleton-item"></div>
        <div class="skeleton-item"></div>
      </div>
    }

    @if (prefetchError()) {
      <div class="error-box" role="alert">
        <mat-icon class="error-icon">error_outline</mat-icon>
        <span>{{ prefetchError() }}</span>
      </div>
    }

    @if (custodyService.error()) {
      <div class="error-box" role="alert">
        <mat-icon class="error-icon">error_outline</mat-icon>
        <span>{{ custodyService.error() }}</span>
      </div>
    }

    <form class="form-content" [formGroup]="form" (ngSubmit)="submit()">

      <app-person-selector
        [parentForm]="form"
        label="المستلم"
        idControlName="given_to_person_id"
        typeControlName="given_to_person_type">
      </app-person-selector>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>المبلغ</mat-label>
        <input matInput type="number" formControlName="amount" placeholder="0.00">
        <span matSuffix class="currency-suffix">جنيه</span>

        @if (selectedSafe()) {
          <mat-hint class="balance-hint">
            الرصيد المتاح: {{ selectedSafe()!.current_balance | number:'1.2-2' }} جنيه
          </mat-hint>
        }

        @if (isSafeBalanceExceeded()) {
          <mat-error class="balance-error">
            ⚠️ المبلغ أكبر من الرصيد المتاح
          </mat-error>
        }
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>التاريخ</mat-label>
        <input matInput [matDatepicker]="picker" formControlName="custody_date">
        <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
        <mat-datepicker #picker></mat-datepicker>
      </mat-form-field>

      <app-payment-method-selector [parentForm]="form"></app-payment-method-selector>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>الوصف</mat-label>
        <textarea matInput formControlName="description" rows="3" placeholder="أدخل وصف العهدة..."></textarea>
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
  <button mat-button type="button" (click)="onCancel()" class="cancel-btn">
    إلغاء
  </button>

  <button mat-raised-button color="primary"
    type="submit"
    (click)="submit()"
    [disabled]="form.invalid || submitting()"
    class="submit-btn">

    @if (submitting()) {
      <mat-spinner diameter="20" class="btn-spinner"></mat-spinner>
    } @else {
      <mat-icon>check_circle</mat-icon>
    }

    <span class="btn-text">إنشاء</span>
  </button>
</mat-dialog-actions>
  `,
  styles: [`
/* -------------------------------------------------------------------
   Create Custody Dialog - Modern ERP Responsive Styles
   Mobile-First | RTL-Friendly | Accessible | Clean Architecture
-------------------------------------------------------------------- */

/* ---------------------------- Variables ---------------------------- */
.dialog-title,
.dialog-content,
.dialog-actions {
  --c-radius-sm: 6px;
  --c-radius-md: 8px;
  --c-radius-lg: 12px;
  --c-space-xs: 4px;
  --c-space-sm: 8px;
  --c-space-md: 12px;
  --c-space-lg: 16px;
  --c-space-xl: 20px;
  --c-space-2xl: 24px;
  --c-primary: #1976d2;
  --c-error: #c53030;
  --c-error-bg: #fff5f5;
  --c-success: #27ae60;
  --c-warning: #e67e22;
  --c-border: #e2e8f0;
  --c-text-primary: #2c3e50;
  --c-text-secondary: #5d6d7e;
  --transition-default: all 0.2s ease;
}

/* ---------------------------- Dialog Title -------------------------- */
.dialog-title {
  text-align: right;
  font-weight: 800;
  font-size: clamp(1.25rem, 5vw, 1.5rem);
  margin: 0;
  padding: var(--c-space-lg) var(--c-space-2xl) var(--c-space-md) var(--c-space-2xl);
  color: var(--c-text-primary);
  border-bottom: 2px solid var(--c-border);
  background: linear-gradient(to bottom, #ffffff, #fafafa);
}

/* ---------------------------- Dialog Content (Mobile-First) --------- */
.dialog-content {
  display: block;
  direction: rtl;
  padding: clamp(16px, 4vw, 24px) !important;
  max-height: 70vh;
  overflow-y: auto;
  scroll-behavior: smooth;
}

.dialog-content-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--c-space-lg);
}

/* Loading Skeleton */
.loading-skeleton {
  display: flex;
  flex-direction: column;
  gap: var(--c-space-md);
}

.skeleton-item {
  height: 56px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
  border-radius: var(--c-radius-md);
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Form Content */
.form-content {
  display: flex;
  flex-direction: column;
  gap: var(--c-space-lg);
}

.full-width {
  width: 100%;
}

/* Currency Input Styling */
.currency-suffix {
  color: var(--c-text-secondary);
  font-weight: 500;
  margin-inline-start: var(--c-space-sm);
}

.balance-hint {
  display: block;
  margin-top: var(--c-space-xs);
  font-size: 0.75rem;
  color: var(--c-text-secondary);
}

.balance-error {
  font-weight: 500;
}

/* Textarea Styling */
textarea {
  resize: vertical;
  min-height: 80px;
}

/* Error Boxes */
.error-box {
  display: flex;
  align-items: center;
  gap: var(--c-space-sm);
  background: var(--c-error-bg);
  padding: var(--c-space-md) var(--c-space-lg);
  border-inline-start: 4px solid var(--c-error);
  border-radius: var(--c-radius-sm);
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

/* ---------------------------- Dialog Actions ------------------------- */
.dialog-actions {
  display: flex;
  gap: var(--c-space-md);
  padding: var(--c-space-lg) var(--c-space-2xl);
  border-top: 1px solid var(--c-border);
  background: #fafafa;
  flex-wrap: wrap;
}

/* Buttons */
.cancel-btn {
  min-width: 100px;
  font-weight: 500;
  transition: var(--transition-default);
}

.cancel-btn:hover {
  background: rgba(0, 0, 0, 0.04);
  transform: translateY(-1px);
}

.submit-btn {
  min-width: 120px;
  font-weight: 600;
  transition: var(--transition-default);
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
  margin-inline-end: var(--c-space-sm);
}

.btn-text {
  margin-inline-start: var(--c-space-xs);
}

/* Disabled button state */
.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ---------------------------- Form Field Enhancements --------------- */
::ng-deep .mat-mdc-form-field-subscript-wrapper {
  padding-inline-start: 0 !important;
}

/* RTL-specific adjustments for form fields */
::ng-deep .mat-mdc-form-field-flex {
  flex-direction: row-reverse;
}

::ng-deep .mat-mdc-form-field-infix {
  text-align: right;
}

/* Input number spinner styling */
input[type="number"] {
  -moz-appearance: textfield;
}

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  opacity: 0.5;
  margin-inline-start: var(--c-space-sm);
}

/* ---------------------------- Responsive Breakpoints ---------------- */

/* Mobile (0px - 767px) */
@media (max-width: 767px) {
  .dialog-title {
    padding: var(--c-space-lg) var(--c-space-lg) var(--c-space-md) var(--c-space-lg);
    font-size: 1.25rem;
  }

  .dialog-content {
    padding: var(--c-space-lg) !important;
    max-height: 65vh;
  }

  .dialog-actions {
    padding: var(--c-space-md) var(--c-space-lg);
    flex-direction: column-reverse;
    gap: var(--c-space-sm);
  }

  .dialog-actions button {
    width: 100%;
    justify-content: center;
  }

  .cancel-btn,
  .submit-btn {
    width: 100%;
    min-width: unset;
  }

  .form-content {
    gap: var(--c-space-md);
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
    padding: var(--c-space-xl) !important;
  }

  .dialog-actions {
    padding: var(--c-space-lg) var(--c-space-2xl);
  }

  .cancel-btn,
  .submit-btn {
    min-width: 110px;
  }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .dialog-title {
    padding: var(--c-space-xl) var(--c-space-3xl) var(--c-space-md) var(--c-space-3xl);
  }

  .dialog-content {
    padding: var(--c-space-2xl) var(--c-space-3xl) !important;
  }

  .dialog-actions {
    padding: var(--c-space-lg) var(--c-space-3xl);
  }
}

/* ---------------------------- RTL & Accessibility -------------------- */

/* RTL Spacing */
[dir="rtl"] .error-box {
  border-inline-start: 4px solid var(--c-error);
  border-inline-end: none;
}

[dir="rtl"] .currency-suffix {
  margin-inline-start: 0;
  margin-inline-end: var(--c-space-sm);
}

/* Focus States for Accessibility */
button:focus-visible,
input:focus-visible,
textarea:focus-visible {
  outline: 2px solid var(--c-primary);
  outline-offset: 2px;
}

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
  .skeleton-item {
    animation: none;
    background: #f0f0f0;
  }

  .error-box {
    animation: none;
  }

  .cancel-btn,
  .submit-btn {
    transition: none;
  }

  .submit-btn:not(:disabled):hover {
    transform: none;
  }
}

/* Touch-Friendly Targets (Mobile) */
@media (hover: none) and (pointer: coarse) {
  .cancel-btn,
  .submit-btn {
    min-height: 48px;
  }

  input,
  textarea,
  .mat-mdc-form-field {
    font-size: 16px !important; /* Prevents zoom on iOS */
  }
}

/* Scrollbar Styling (Optional Enhancement) */
.dialog-content::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.dialog-content::-webkit-scrollbar-track {
  background: var(--c-border);
  border-radius: 3px;
}

.dialog-content::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 3px;
}

.dialog-content::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}

/* Loading State Overlay */
.loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: inherit;
}

/* Helper Classes */
.text-right {
  text-align: right;
}

.mb-2 {
  margin-bottom: var(--c-space-sm);
}

.mt-2 {
  margin-top: var(--c-space-sm);
}
  `]
})
export class CreateCustodyDialogComponent {

  closed = output<boolean>();

  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<CreateCustodyDialogComponent>);
  custodyService = inject(CustodyService);
  private snackBar = inject(MatSnackBar);

  safes = signal<Safe[]>([]);
  submitError = signal<string | null>(null);
  optionsLoading = signal(true);
  prefetchError = signal<string | null>(null);
  submitting = signal(false);

  form = this.fb.group({
    given_to_person_type: this.fb.nonNullable.control<PersonType>('EMPLOYEE', Validators.required),
    given_to_person_id: this.fb.control<number | null>(null, Validators.required),
    amount: this.fb.control<number | null>(null, [Validators.required, Validators.min(0.01)]),
    custody_date: this.fb.nonNullable.control(this.today(), Validators.required),
    safe_id: this.fb.control<number | null>(null),
    payment_method: this.fb.nonNullable.control<PaymentMethod>('CASH', Validators.required),
    description: this.fb.nonNullable.control('')
  });

  private formValue = toSignal(
    this.form.valueChanges.pipe(startWith(this.form.getRawValue())),
    { initialValue: this.form.getRawValue() }
  );

  selectedSafe = computed(() => {
    const id = this.formValue()?.safe_id;
    return this.safes().find(s => s.id === id);
  });

  isSafeBalanceExceeded = computed(() => {
    const v = this.formValue();
    const amount = Number(v?.amount || 0);
    return amount > (this.selectedSafe()?.current_balance ?? Infinity);
  });

  constructor() {
    forkJoin({
      safes: this.custodyService.getActiveSafes({ silent: true })
    }).subscribe({
      next: ({ safes }) => {
        this.safes.set(safes);
        this.optionsLoading.set(false);
      },
      error: () => {
        this.prefetchError.set('فشل تحميل الخزن');
        this.optionsLoading.set(false);
      }
    });
  }

  submit() {
  if (this.form.invalid) return;

  const value = this.form.getRawValue();

  // ✅ Guard قوي ضد null
  if (!value.given_to_person_id || !value.amount) {
    this.submitError.set('بيانات غير مكتملة');
    return;
  }

  this.submitting.set(true);

  this.custodyService.create({
    given_to_person_type: value.given_to_person_type,
    given_to_person_id: value.given_to_person_id, // بقت number فعليًا
    amount: value.amount,
    custody_date: value.custody_date,
    safe_id: value.safe_id,
    payment_method: value.payment_method,
    description: value.description || ''
  }).subscribe({
    next: () => {
      this.snackBar.open('تم الحفظ', 'OK', { duration: 3000 });
      this.dialogRef.close(true);
    },
    error: (e) => {
      this.submitError.set(e.error?.message || 'خطأ');
      this.submitting.set(false);
    }
  });
  }
  onCancel() {
    this.dialogRef.close(false);
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
