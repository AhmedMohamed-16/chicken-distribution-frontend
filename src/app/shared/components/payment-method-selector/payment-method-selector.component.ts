import { Component, Input, OnInit, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { SafeService } from '../../../core/services/safe.service';
import { Safe } from '../../../core/models';

@Component({
  selector: 'app-payment-method-selector',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule
  ],
  template: `
    <div [formGroup]="parentForm" class="payment-selector-container">

  <!-- Payment Method -->
  <section class="selector-section">
    <div class="section-header">
      <span class="section-title">بيانات الدفع</span>
    </div>

    <div class="fields-grid">

      <!-- طريقة الدفع -->
      <mat-form-field appearance="outline" class="form-field">
        <mat-label>{{ label }}</mat-label>

        <mat-select formControlName="payment_method">
          <mat-option value="CASH">نقدي</mat-option>
          <mat-option value="INSTAPAY">انستاباي</mat-option>
          <mat-option value="BANK">تحويل بنكي</mat-option>
          <mat-option value="VODAFONE_CASH">فودافون كاش</mat-option>
        </mat-select>

        @if (parentForm.get('payment_method')?.hasError('required')) {
          <mat-error>
            طريقة الدفع مطلوبة
          </mat-error>
        }
      </mat-form-field>

      <!-- الخزنة -->
      <mat-form-field appearance="outline" class="form-field">
        <mat-label>الخزنة / الحساب</mat-label>

        <mat-select
          formControlName="safe_id"
          [disabled]="!parentForm.get('payment_method')?.value"
          (selectionChange)="safeIdSelected.emit($event.value)"
        >

          @for (safe of safes(); track safe.id) {
            <mat-option [value]="safe.id">
              <div class="safe-option">
                <span class="safe-name">
                  {{ safe.name }}
                </span>

                <span class="safe-type">
                  {{ getSafeTypeName(safe.type) }}
                </span>
              </div>
            </mat-option>
          }

        </mat-select>

        @if (parentForm.get('safe_id')?.hasError('required')) {
          <mat-error>
            لازم تختار خزنة / حساب
          </mat-error>
        }

        @if (!parentForm.get('payment_method')?.value) {
          <mat-hint>
            اختر طريقة الدفع أولاً
          </mat-hint>
        }
      </mat-form-field>

    </div>
  </section>

</div>
  `,
  styles: [`
    /* =========================================================
   ROOT CONTAINER
========================================================= */

.payment-selector-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  direction: rtl;
}

/* =========================================================
   SECTION
========================================================= */

.selector-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  padding: 1rem;
  border-radius: 1rem;

  background:
    linear-gradient(
      180deg,
      rgba(250, 250, 250, 0.95) 0%,
      rgba(245, 245, 245, 0.9) 100%
    );

  border: 1px solid rgba(0, 0, 0, 0.06);
}

/* =========================================================
   HEADER
========================================================= */

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.section-title {
  font-size: clamp(0.95rem, 2vw, 1.1rem);
  font-weight: 700;
  color: #1f2937;
  line-height: 1.4;
}

/* =========================================================
   GRID LAYOUT
========================================================= */

.fields-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  width: 100%;
}

/* =========================================================
   FORM FIELD
========================================================= */

.form-field {
  width: 100%;
}

.form-field ::ng-deep .mat-mdc-form-field-subscript-wrapper {
  padding-inline: 0.25rem;
}

.form-field ::ng-deep .mdc-notched-outline__leading,
.form-field ::ng-deep .mdc-notched-outline__notch,
.form-field ::ng-deep .mdc-notched-outline__trailing {
  border-radius: 0.875rem;
}

/* =========================================================
   SAFE OPTION
========================================================= */

.safe-option {
  width: 100%;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 0.75rem;
}

.safe-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: #111827;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.safe-type {
  flex-shrink: 0;

  padding: 0.25rem 0.6rem;
  border-radius: 999px;

  font-size: 0.75rem;
  font-weight: 700;

  background: rgba(0, 0, 0, 0.06);
  color: #374151;
}

/* =========================================================
   MOBILE OPTIMIZATION
========================================================= */

@media (max-width: 767px) {

  .payment-selector-container {
    gap: 0.875rem;
  }

  .selector-section {
    padding: 0.875rem;
    border-radius: 0.875rem;
  }

  .fields-grid {
    gap: 0.875rem;
  }

  .safe-option {
    align-items: flex-start;
    flex-direction: column;
  }

  .safe-type {
    align-self: flex-start;
  }

  .form-field ::ng-deep .mat-mdc-text-field-wrapper {
    min-height: 56px;
  }
}

/* =========================================================
   TABLET
========================================================= */

@media (min-width: 768px) {

  .fields-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: start;
  }

  .selector-section {
    padding: 1.25rem;
  }
}

/* =========================================================
   DESKTOP
========================================================= */

@media (min-width: 1024px) {

  .payment-selector-container {
    gap: 1.25rem;
  }

  .selector-section {
    padding: 1.5rem;
  }

  .fields-grid {
    gap: 1.25rem;
  }
}

/* =========================================================
   ACCESSIBILITY & INTERACTION
========================================================= */

@media (hover: hover) {

  .selector-section {
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease,
      transform 0.2s ease;
  }

  .selector-section:hover {
    border-color: rgba(0, 0, 0, 0.1);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.05);
  }
}

/* =========================================================
   RTL SUPPORT
========================================================= */

:host {
  display: block;
  width: 100%;
  direction: rtl;
}
  `]
})
export class PaymentMethodSelectorComponent implements OnInit {
  @Input({ required: true }) parentForm!: FormGroup;
  @Input() label: string = 'طريقة الدفع';

  safeIdSelected = output<number>();

  private safeService = inject(SafeService);

  // كل الخزن
  allSafes = signal<Safe[]>([]);

  // الخزن بعد الفلترة
  safes = signal<Safe[]>([]);

  ngOnInit(): void {
  // اقفل الخزنة في الأول
  this.parentForm.get('safe_id')?.disable();

  // تحميل الخزن
  this.safeService.getAll().subscribe({
    next: (res) => {
      this.allSafes.set(res.data);
      this.safes.set(res.data);
          // 🔥 شغل اللوجيك على القيمة الحالية
    const currentMethod = this.parentForm.get('payment_method')?.value;
    this.handlePaymentMethodChange(currentMethod);

    }
  });

  this.parentForm.get('payment_method')?.valueChanges.subscribe(method => {
    this.handlePaymentMethodChange(method);
  });

  // Emit when safe_id changes
  this.parentForm.get('safe_id')?.valueChanges.subscribe(safeId => {
    if (safeId && !Number.isNaN(Number(safeId))) {
      this.safeIdSelected.emit(Number(safeId));
    }
  });
}

  getSafeTypeName(type: string): string {
    switch (type) {
      case 'CASH': return 'نقدي';
      case 'BANK': return 'بنك';
      case 'VODAFONE_CASH': return 'فودافون كاش';
      case 'INSTAPAY': return 'انستاباي';
      default: return type;
    }
  }

  private handlePaymentMethodChange(method: string | null) {
  const safeControl = this.parentForm.get('safe_id');

  if (!method) {
    this.safes.set(this.allSafes());
    safeControl?.disable();
    safeControl?.setValue(null);
    return;
  }

  safeControl?.enable();

  const filtered = this.allSafes().filter(safe => safe.type === method);
  this.safes.set(filtered);

  const currentSafe = safeControl?.value;
  const exists = filtered.some(s => s.id === currentSafe);

  if (!exists) {
    safeControl?.setValue(null);
  }

  if (filtered.length === 1) {
    safeControl?.setValue(filtered[0].id);
  }
}
}
