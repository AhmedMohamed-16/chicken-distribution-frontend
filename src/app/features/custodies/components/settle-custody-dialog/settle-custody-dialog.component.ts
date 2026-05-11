import { ChangeDetectionStrategy, Component, OnInit, Input, computed, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
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
import { ReportUtilitiesService } from '../../../../core/services/ReportUtilitiesService';

@Component({
  selector: 'app-settle-custody-dialog',
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
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title class="dialog-title">
      تسوية وإغلاق العهدة
    </h2>

    <mat-dialog-content class="dialog-content-wrapper">
      <div class="dialog-content">
        @if (custodyService.error()) {
          <div class="error-box" role="alert">
            <mat-icon class="error-icon">error_outline</mat-icon>
            <span>{{ custodyService.error() }}</span>
          </div>
        }

        <div class="settlement-summary">
          <div class="summary-header">
            <mat-icon class="summary-icon">receipt_long</mat-icon>
            <p class="summary-title">تفاصيل التسوية</p>
          </div>

          <div class="summary-row">
            <span class="summary-label">إجمالي العهدة:</span>
            <span class="summary-value">{{ formatCurrency(totalAmount()) }}</span>
          </div>

          <div class="summary-row">
            <span class="summary-label">
              <mat-icon class="row-icon">payments</mat-icon>
              ✓ تم توثيقه كمصروف:
            </span>
            <span class="summary-value spent-value">{{ formatCurrency(spentAmount()) }}</span>
          </div>

          <div class="summary-row">
            <span class="summary-label">
              <mat-icon class="row-icon">reply</mat-icon>
              ✓ تم إرجاعه:
            </span>
            <span class="summary-value returned-value">{{ formatCurrency(returnedAmount()) }}</span>
          </div>

          <hr class="summary-divider" />

          <div class="summary-row total-row">
            <span class="summary-label total-label">غير محاسَب:</span>
            <span class="summary-value total-value"
                  [class.negative]="unaccountedAmount() > 0"
                  [class.positive]="unaccountedAmount() <= 0">
              {{ formatCurrency(unaccountedAmount()) }}
            </span>
          </div>
        </div>

        <div class="success-box" role="status">
          <mat-icon>check_circle</mat-icon>
          <div class="success-content">
            <span class="success-title">✅ جاهزة للتسوية</span>
            <span class="success-message">يمكن إضافة ملاحظات اختيارية</span>
          </div>
        </div>

        <form class="form-content" [formGroup]="form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>ملاحظات (اختياري)</mat-label>
            <textarea matInput formControlName="notes"
                      rows="3"
                      placeholder="ملاحظات حول التسوية..."
                      class="notes-textarea"></textarea>
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
      <button mat-raised-button color="primary" type="submit" (click)="submit()"
        [disabled]="submitting()"
        class="submit-btn">
        @if (submitting()) {
          <mat-spinner diameter="20" class="btn-spinner"></mat-spinner>
        } @else {
          <mat-icon>check_circle</mat-icon>
        }
        <span class="btn-text">تسوية وإغلاق العهدة</span>
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    /* -------------------------------------------------------------------
       Settle Custody Dialog - Modern ERP Responsive Styles
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
      --c-space-3xl: 32px;
      --c-primary: #1976d2;
      --c-success: #38a169;
      --c-success-bg: #f0fff4;
      --c-error: #c53030;
      --c-error-bg: #fff5f5;
      --c-info-bg: #f7fafc;
      --c-info-border: #3182ce;
      --c-border: #e2e8f0;
      --c-text-primary: #2d3748;
      --c-text-secondary: #4a5568;
      --c-text-light: #718096;
      --c-bg-subtle: #fafafa;
      --c-spent-color: #27ae60;
      --c-returned-color: #2980b9;
      --c-transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      --c-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
      --c-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
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
      scroll-behavior: smooth;
    }

    .dialog-content {
      display: flex;
      flex-direction: column;
      gap: var(--c-space-lg);
      padding: clamp(16px, 4vw, 24px);
      direction: rtl;
    }

    /* ---------------------------- Settlement Summary ------------------- */
    .settlement-summary {
      background: var(--c-info-bg);
      padding: var(--c-space-lg);
      border-radius: 12px;
      border-inline-start: 4px solid var(--c-info-border);
      transition: var(--c-transition);
      box-shadow: var(--c-shadow-sm);
    }

    .settlement-summary:hover {
      box-shadow: var(--c-shadow-md);
    }

    .summary-header {
      display: flex;
      align-items: center;
      gap: var(--c-space-sm);
      margin-bottom: var(--c-space-md);
    }

    .summary-icon {
      color: var(--c-info-border);
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .summary-title {
      margin: 0;
      font-weight: 700;
      color: var(--c-text-primary);
      font-size: clamp(0.95rem, 3vw, 1rem);
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--c-space-sm) 0;
      color: var(--c-text-secondary);
      font-size: clamp(0.875rem, 3vw, 0.95rem);
      flex-wrap: wrap;
      gap: var(--c-space-sm);
    }

    .summary-label {
      display: inline-flex;
      align-items: center;
      gap: var(--c-space-sm);
      flex: 1;
    }

    .row-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: var(--c-text-light);
    }

    .summary-value {
      font-weight: 700;
      color: var(--c-text-primary);
    }

    .spent-value {
      color: var(--c-spent-color);
    }

    .returned-value {
      color: var(--c-returned-color);
    }

    .summary-row.total-row {
      padding-top: var(--c-space-sm);
    }

    .total-label {
      font-weight: 800;
      font-size: clamp(0.95rem, 3.5vw, 1rem);
      color: var(--c-text-primary);
    }

    .total-value {
      font-size: clamp(1rem, 4vw, 1.1rem);
      font-weight: 800;
    }

    .total-value.negative {
      color: var(--c-error);
    }

    .total-value.positive {
      color: var(--c-success);
    }

    .summary-divider {
      border: none;
      border-top: 2px solid var(--c-border);
      margin: var(--c-space-sm) 0;
    }

    /* ---------------------------- Success Box -------------------------- */
    .success-box {
      display: flex;
      align-items: center;
      gap: var(--c-space-md);
      background: var(--c-success-bg);
      padding: var(--c-space-md) var(--c-space-lg);
      border-radius: 8px;
      border-inline-start: 4px solid var(--c-success);
      transition: var(--c-transition);
    }

    .success-box mat-icon {
      color: var(--c-success);
      font-size: 24px;
      width: 24px;
      height: 24px;
      flex-shrink: 0;
    }

    .success-content {
      display: flex;
      flex-direction: column;
      gap: var(--c-space-xs);
      flex: 1;
    }

    .success-title {
      font-weight: 700;
      color: #276749;
      font-size: clamp(0.875rem, 3vw, 0.95rem);
    }

    .success-message {
      font-size: clamp(0.75rem, 2.5vw, 0.85rem);
      color: #2f855a;
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

    .notes-textarea {
      resize: vertical;
      min-height: 80px;
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

    .cancel-btn:active:not(:disabled) {
      transform: translateY(0);
    }

    .submit-btn {
      min-width: 180px;
      font-weight: 700;
      height: clamp(40px, 10vh, 48px);
      border-radius: 8px;
      transition: var(--c-transition);
      display: inline-flex;
      align-items: center;
      gap: var(--c-space-sm);
      box-shadow: var(--c-shadow-sm);
    }

    .submit-btn:not(:disabled):hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(25, 118, 210, 0.3);
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
        font-size: 1.125rem;
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

      .settlement-summary {
        padding: var(--c-space-md);
      }

      .summary-row {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--c-space-xs);
      }

      .summary-label {
        width: 100%;
      }

      .success-box {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--c-space-sm);
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
        min-width: 140px;
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

    [dir="rtl"] .settlement-summary {
      border-inline-start: 4px solid var(--c-info-border);
      border-inline-end: none;
    }

    [dir="rtl"] .success-box {
      border-inline-start: 4px solid var(--c-success);
      border-inline-end: none;
    }

    [dir="rtl"] .error-box {
      border-inline-start: 4px solid var(--c-error);
      border-inline-end: none;
    }

    [dir="rtl"] .summary-label {
      flex-direction: row;
    }

    /* ---------------------------- Accessibility ------------------------ */

    /* Focus states */
    button:focus-visible,
    textarea:focus-visible {
      outline: 2px solid var(--c-primary);
      outline-offset: 2px;
    }

    /* Reduced Motion */
    @media (prefers-reduced-motion: reduce) {
      .error-box,
      .settlement-summary,
      .success-box,
      .cancel-btn,
      .submit-btn {
        animation: none;
        transition: none;
        transform: none;
      }

      .submit-btn:not(:disabled):hover {
        transform: none;
      }
    }

    /* High Contrast Mode */
    @media (prefers-contrast: high) {
      .settlement-summary {
        border: 1px solid var(--c-info-border);
      }

      .success-box {
        border: 1px solid var(--c-success);
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
      transition: var(--c-transition);
    }

    .dialog-content-wrapper::-webkit-scrollbar-thumb:hover {
      background: #a0aec0;
    }
  `]
})
export class SettleCustodyDialogComponent implements OnInit {
  // Inject dialog data provided via MatDialog (optional for direct component usage)
  private dialogData = inject<{
    custodyId?: number;
    totalAmount?: number;
    spentAmount?: number;
    returnedAmount?: number;
    unaccountedAmount?: number;
  }>(MAT_DIALOG_DATA, { optional: true }) ?? {};

  // Initialize signals with dialog data if available, otherwise default to 0
  custodyId = signal<number>(this.dialogData.custodyId ?? 0);
  totalAmount = signal<number>(this.dialogData.totalAmount ?? 0);
  spentAmount = signal<number>(this.dialogData.spentAmount ?? 0);
  returnedAmount = signal<number>(this.dialogData.returnedAmount ?? 0);
  unaccountedAmount = signal<number>(this.dialogData.unaccountedAmount ?? 0);
  closed = output<boolean>();

  private fb = inject(FormBuilder);
  custodyService = inject(CustodyService);
  private snackBar = inject(MatSnackBar);
  private utils = inject(ReportUtilitiesService);
  private dialogRef = inject(MatDialogRef<SettleCustodyDialogComponent>);

  submitError = signal<string | null>(null);
  submitting = signal(false);

  form = this.fb.group({
    notes: this.fb.nonNullable.control('')
  });

  // Support property binding when used as a component (e.g., in templates)
  @Input('custodyId')
  set custodyIdInput(value: number | undefined) {
    if (value !== undefined) this.custodyId.set(value);
  }

  @Input('totalAmount')
  set totalAmountInput(value: number | undefined) {
    if (value !== undefined) this.totalAmount.set(value);
  }

  @Input('spentAmount')
  set spentAmountInput(value: number | undefined) {
    if (value !== undefined) this.spentAmount.set(value);
  }

  @Input('returnedAmount')
  set returnedAmountInput(value: number | undefined) {
    if (value !== undefined) this.returnedAmount.set(value);
  }

  @Input('unaccountedAmount')
  set unaccountedAmountInput(value: number | undefined) {
    if (value !== undefined) this.unaccountedAmount.set(value);
  }

  isSubmitDisabled = computed(() => this.custodyService.loading() || this.submitting());

  ngOnInit(): void {
    // Simplified - no complex loading needed
  }

  submit(): void {
    this.submitError.set(null);
    this.submitting.set(true);
    const value = this.form.getRawValue();
    this.custodyService.settle(this.custodyId(), {
      notes: value.notes?.trim() ? value.notes : undefined
    }).subscribe({
      next: () => {
        this.snackBar.open('تم تسوية العهدة بنجاح', 'حسناً', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (error: { error?: { message?: string } }) => {
        this.submitError.set(error.error?.message ?? 'فشل تسوية العهدة');
        this.submitting.set(false);
      }
    });
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  formatCurrency = (amt: number | undefined | null) => this.utils.formatCurrency(amt);
}
