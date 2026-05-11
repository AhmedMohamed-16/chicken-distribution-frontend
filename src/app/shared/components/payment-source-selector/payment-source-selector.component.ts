import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  Input,
  input,
  output,
  signal
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import {
  Custody,
  PaymentSourceSelection,
  PaymentSourceType,
  PersonType
} from '../../../models/custody.models';
import { Safe } from '../../../core/models/safe.model';
import { CustodyService } from '../../../core/services/custody.service';
import { PaymentMethodSelectorComponent } from "../payment-method-selector/payment-method-selector.component";
import { FormGroup } from '@angular/forms';
import { MatSelect, MatOption, MatFormField, MatLabel } from "@angular/material/select";
import { MatIcon } from "@angular/material/icon";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { MatRadioModule } from '@angular/material/radio';

@Component({
  selector: 'app-payment-source-selector',
  imports: [DecimalPipe, PaymentMethodSelectorComponent, MatSelect, MatOption, MatFormField, MatLabel, MatIcon, MatProgressSpinner, MatRadioModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  template: `
<div class="payment-source-container">

  <!-- =====================================================
       SECTION HEADER
  ====================================================== -->

  <div class="section-header">
    <div class="section-title-group">
      <h3 class="section-title">
        {{ label }}
      </h3>

      <p class="section-subtitle">
        اختر مصدر الدفع أو التحصيل المناسب
      </p>
    </div>
  </div>

  <!-- =====================================================
       SOURCE TYPE TOGGLE
  ====================================================== -->

  <div class="source-toggle-wrapper">

    <mat-radio-group
      class="payment-source-options"
      [value]="sourceType()"
      (change)="onSourceTypeChange($event.value)">

      <mat-radio-button
        class="source-option"
        value="SAFE">

        <div class="option-content">
          <mat-icon>account_balance</mat-icon>

          <div class="option-text">
            <span class="option-title">الخزينة</span>
            <span class="option-description">
              الدفع أو التحصيل من الخزينة
            </span>
          </div>
        </div>

      </mat-radio-button>

      <mat-radio-button
        class="source-option"
        value="CUSTODY"
        [disabled]="shouldDisableCustody()">

        <div class="option-content">
          <mat-icon>wallet</mat-icon>

          <div class="option-text">
            <span class="option-title">العهدة</span>
            <span class="option-description">
              الخصم من عهدة الموظف أو المسؤول
            </span>
          </div>
        </div>

      </mat-radio-button>

    </mat-radio-group>

  </div>

  <!-- =====================================================
       LOADING
  ====================================================== -->

  @if (custodyService.loading()) {
    <div class="state-card loading-state">
      <mat-spinner diameter="32"></mat-spinner>

      <span>
        جاري تحميل مصادر الدفع...
      </span>
    </div>
  }

  <!-- =====================================================
       ERROR
  ====================================================== -->

  @if (custodyService.error()) {
    <div class="state-card error-state">
      <mat-icon>error</mat-icon>

      <span>
        {{ custodyService.error() }}
      </span>
    </div>
  }

  <!-- =====================================================
       SAFE MODE
  ====================================================== -->

  @if (sourceType() === 'SAFE') {

    <div class="source-panel">

      <app-payment-method-selector
        [label]="paymentLabel"
        [parentForm]="parentForm"
        (safeIdSelected)="onSafeSelected($event)">
      </app-payment-method-selector>

      @if (selectedSafe()) {

        <div class="balance-card info-card">

          <div class="balance-icon">
            <mat-icon>
              account_balance_wallet
            </mat-icon>
          </div>

          <div class="balance-content">

            <span class="balance-label">
              الرصيد المتاح بالخزينة
            </span>

            <strong class="balance-value">
              {{ selectedSafe()!.current_balance | number:'1.2-2' }}
              جنيه
            </strong>

          </div>

        </div>
      }

      @if (isSafeInsufficient()) {

        <div class="balance-card warning-card">

          <div class="balance-icon">
            <mat-icon>
              warning
            </mat-icon>
          </div>

          <div class="balance-content">

            <span class="balance-label">
              الرصيد غير كافٍ
            </span>

            <strong class="balance-value">
              المبلغ يتجاوز رصيد الخزينة
            </strong>

          </div>

        </div>
      }

    </div>
  }

  <!-- =====================================================
       CUSTODY MODE
  ====================================================== -->

  @if (sourceType() === 'CUSTODY') {

    <div class="source-panel">

      @if (custodies().length === 0) {

        <div class="empty-state">

          <mat-icon>
            inventory_2
          </mat-icon>

          <div class="empty-content">
            <span class="empty-title">
              لا توجد عهد متاحة
            </span>

            <span class="empty-description">
              لا توجد عهد نشطة متاحة للاستخدام حالياً
            </span>
          </div>

        </div>

      } @else {

        <mat-form-field
          class="form-field"
          appearance="outline">

          <mat-label>
            اختر العهدة
          </mat-label>

          <mat-select
            [value]="selectedCustodyId()"
            (selectionChange)="onCustodyChange($event.value)">

            @for (custody of custodies(); track custody.id) {

              <mat-option [value]="custody.id">

                <div class="custody-option">

                  <div class="custody-main">
                    {{ custody.recipient_name ?? '—' }}
                  </div>

                  <div class="custody-balance">
                    المتاح:
                    {{ custody.unaccounted_amount | number:'1.2-2' }}
                    جنيه
                  </div>

                </div>

              </mat-option>
            }

          </mat-select>

        </mat-form-field>

        @if (selectedCustody()) {

          <div class="balance-stack">

            <div class="balance-card info-card">

              <div class="balance-icon">
                <mat-icon>
                  info
                </mat-icon>
              </div>

              <div class="balance-content">

                <span class="balance-label">
                  ملاحظة
                </span>

                <strong class="balance-value">
                  سيتم الخصم من العهدة بدون التأثير على الخزينة
                </strong>

              </div>

            </div>

            <div class="balance-card success-card">

              <div class="balance-icon">
                <mat-icon>
                  account_balance_wallet
                </mat-icon>
              </div>

              <div class="balance-content">

                <span class="balance-label">
                  الرصيد المتاح بالعهدة
                </span>

                <strong class="balance-value">
                  {{ selectedCustody()!.unaccounted_amount | number:'1.2-2' }}
                  جنيه
                </strong>

              </div>

            </div>

          </div>
        }

        @if (isCustodyInsufficient()) {

          <div class="balance-card warning-card">

            <div class="balance-icon">
              <mat-icon>
                warning
              </mat-icon>
            </div>

            <div class="balance-content">

              <span class="balance-label">
                الرصيد غير كافٍ
              </span>

              <strong class="balance-value">
                المبلغ يتجاوز رصيد العهدة
              </strong>

            </div>

          </div>
        }

      }

    </div>
  }

  <!-- =====================================================
       VALIDATION
  ====================================================== -->

  @if (!isValid() && (selectedSafeId() !== null || selectedCustodyId() !== null)) {

    <div class="validation-banner">

      <mat-icon>
        gpp_bad
      </mat-icon>

      <span>
        يجب اختيار مصدر دفع صالح
      </span>

    </div>
  }

</div>`,
  styles: [`
/* =========================================================
   ROOT CONTAINER
========================================================= */

.payment-source-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  direction: rtl;
}

/* =========================================================
   HEADER
========================================================= */

.section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.section-title-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.section-title {
  margin: 0;

  font-size: clamp(1rem, 2vw, 1.2rem);
  font-weight: 800;

  color: #111827;
}

.section-subtitle {
  margin: 0;

  font-size: 0.85rem;
  line-height: 1.5;

  color: #6b7280;
}

/* =========================================================
   TOGGLE SECTION
========================================================= */

.source-toggle-wrapper {
  padding: 1rem;

  border-radius: 1rem;

  background:
    linear-gradient(
      180deg,
      rgba(249, 250, 251, 0.95) 0%,
      rgba(243, 244, 246, 0.9) 100%
    );

  border: 1px solid rgba(0, 0, 0, 0.06);
}

.payment-source-options {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.875rem;
}

.source-option {
  width: 100%;
  margin: 0;
}

.option-content {
  display: flex;
  align-items: center;
  gap: 0.875rem;

  width: 100%;
}

.option-content mat-icon {
  flex-shrink: 0;

  width: 2.5rem;
  height: 2.5rem;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 0.875rem;

  background: rgba(0, 0, 0, 0.05);
  color: #374151;
}

.option-text {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.option-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #111827;
}

.option-description {
  font-size: 0.78rem;
  color: #6b7280;
  line-height: 1.4;
}

/* =========================================================
   PANELS
========================================================= */

.source-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* =========================================================
   STATES
========================================================= */

.state-card,
.empty-state,
.validation-banner,
.balance-card {
  display: flex;
  align-items: center;
  gap: 0.875rem;

  padding: 1rem;
  border-radius: 1rem;
}

.loading-state {
  justify-content: center;

  background: rgba(59, 130, 246, 0.06);
  color: #1d4ed8;
}

.error-state {
  background: rgba(239, 68, 68, 0.08);
  color: #b91c1c;
}

.empty-state {
  background: rgba(107, 114, 128, 0.08);
  color: #374151;
}

.validation-banner {
  background: rgba(239, 68, 68, 0.08);
  color: #b91c1c;

  font-size: 0.875rem;
  font-weight: 600;
}

/* =========================================================
   BALANCE CARDS
========================================================= */

.balance-stack {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.balance-card {
  border: 1px solid transparent;
}

.balance-icon {
  flex-shrink: 0;

  width: 2.75rem;
  height: 2.75rem;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 0.875rem;
}

.balance-content {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.balance-label {
  font-size: 0.8rem;
  color: inherit;
  opacity: 0.85;
}

.balance-value {
  font-size: 0.95rem;
  line-height: 1.5;
}

/* INFO */

.info-card {
  background: rgba(59, 130, 246, 0.08);
  border-color: rgba(59, 130, 246, 0.15);
  color: #1d4ed8;
}

.info-card .balance-icon {
  background: rgba(59, 130, 246, 0.15);
}

/* SUCCESS */

.success-card {
  background: rgba(34, 197, 94, 0.08);
  border-color: rgba(34, 197, 94, 0.15);
  color: #15803d;
}

.success-card .balance-icon {
  background: rgba(34, 197, 94, 0.15);
}

/* WARNING */

.warning-card {
  background: rgba(245, 158, 11, 0.08);
  border-color: rgba(245, 158, 11, 0.15);
  color: #b45309;
}

.warning-card .balance-icon {
  background: rgba(245, 158, 11, 0.15);
}

/* =========================================================
   FORM FIELD
========================================================= */

.form-field {
  width: 100%;
}

/* =========================================================
   CUSTODY OPTION
========================================================= */

.custody-option {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  padding-block: 0.2rem;
}

.custody-main {
  font-size: 0.92rem;
  font-weight: 600;
  color: #111827;
}

.custody-balance {
  font-size: 0.78rem;
  color: #6b7280;
}

/* =========================================================
   EMPTY STATE
========================================================= */

.empty-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.empty-title {
  font-weight: 700;
  font-size: 0.92rem;
}

.empty-description {
  font-size: 0.8rem;
  line-height: 1.5;
  color: #6b7280;
}

/* =========================================================
   MOBILE
========================================================= */

@media (max-width: 767px) {

  .payment-source-container {
    gap: 0.875rem;
  }

  .source-toggle-wrapper,
  .state-card,
  .empty-state,
  .validation-banner,
  .balance-card {
    padding: 0.875rem;
    border-radius: 0.875rem;
  }

  .option-content {
    align-items: flex-start;
  }

  .option-content mat-icon {
    width: 2.25rem;
    height: 2.25rem;
  }

  .balance-card {
    align-items: flex-start;
  }

  .balance-value {
    font-size: 0.88rem;
  }
}

/* =========================================================
   TABLET
========================================================= */

@media (min-width: 768px) {

  .payment-source-options {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .balance-stack {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

/* =========================================================
   DESKTOP
========================================================= */

@media (min-width: 1024px) {

  .payment-source-container {
    gap: 1.25rem;
  }

  .source-toggle-wrapper {
    padding: 1.25rem;
  }

  .payment-source-options {
    gap: 1rem;
  }
}

/* =========================================================
   MATERIAL TWEAKS
========================================================= */

.form-field ::ng-deep .mdc-notched-outline__leading,
.form-field ::ng-deep .mdc-notched-outline__notch,
.form-field ::ng-deep .mdc-notched-outline__trailing {
  border-radius: 0.875rem;
}

.source-option ::ng-deep .mdc-form-field {
  width: 100%;
}

.source-option ::ng-deep .mdc-label {
  width: 100%;
}

/* =========================================================
   ACCESSIBILITY
========================================================= */

@media (hover: hover) {

  .source-toggle-wrapper,
  .balance-card,
  .empty-state {
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease,
      border-color 0.2s ease;
  }

  .balance-card:hover,
  .empty-state:hover {
    transform: translateY(-1px);

    box-shadow:
      0 8px 24px rgba(0, 0, 0, 0.06);
  }
}`]
})
export class PaymentSourceSelectorComponent {
  // FIX: Changed from input.required<number>() to allow null/undefined safely
  amount = input<number>(0);
  personType = input<PersonType | null>(null);
  personId = input<number | null>(null);

  isDebtPaymentOnly = input<boolean>(false);
  // FIX: balance defaults to 0 so null-safe
  balance = input<number>(0);
  operationType = input<'SALE' | 'COST' | null>(null);

  selectionChange = output<PaymentSourceSelection | null>();
  validationChange = output<boolean>();

  sourceType = signal<PaymentSourceType>('SAFE');
  selectedSafeId = signal<number | null>(null);
  selectedCustodyId = signal<number | null>(null);
  safes = signal<Safe[]>([]);
  custodies = signal<Custody[]>([]);

  custodyService = inject(CustodyService);

  @Input() paymentLabel: string = 'طريقة الدفع';
  @Input() label: string = 'طريقة الدفع';
  @Input() parentForm!: FormGroup;

  selectedSafe = computed(() => this.safes().find(s => s.id === this.selectedSafeId()));
  selectedCustody = computed(() => this.custodies().find(c => c.id === this.selectedCustodyId()));

  // FIX: Custody is disabled when:
  // 1. In SALE mode and NOT debt-payment-only (receiving money → custody not applicable)
  // 2. In debt-payment-only mode and balance >= 0 (person owes us → they pay INTO safe, not FROM custody)
  // 3. In COST mode, custody IS allowed (paying expenses from someone's custody)
  shouldDisableCustody = computed(() => {
    const opType = this.operationType();
    if (opType === 'COST' ) return false;
    const isDebtOnly = this.isDebtPaymentOnly();
    const bal = this.balance();

    // Sale receiving mode: cannot use custody to receive payment
    if (opType === 'SALE' && !isDebtOnly) return true;

    // Debt-only mode where the other party owes us: they pay us → safe, not custody
    if (isDebtOnly && bal >= 0) return true;

    return false;
  });

  // FIX: Use safe safeAmount() with fallback
  safeAmount = computed(() => this.amount() ?? 0);

  isSafeInsufficient = computed(() =>
    this.sourceType() === 'SAFE' &&
    this.selectedSafe() !== undefined &&
    this.safeAmount() > (this.selectedSafe()?.current_balance ?? 0)
  );

  isCustodyInsufficient = computed(() =>
    this.sourceType() === 'CUSTODY' &&
    this.selectedCustody() !== undefined &&
    this.safeAmount() > (this.selectedCustody()?.unaccounted_amount ?? 0)
  );

  isValid = computed(() => {
    if (this.sourceType() === 'SAFE') {
      return this.selectedSafeId() !== null && !this.isSafeInsufficient();
    }
    return this.selectedCustodyId() !== null && !this.isCustodyInsufficient();
  });

  constructor() {
    this.loadData();

    // FIX: Sync safe_id from parent form into selectedSafeId signal
    effect(() => {
      const safeId = this.parentForm?.get('safe_id')?.value;
      if (safeId != null && this.sourceType() === 'SAFE') {
        const numId = Number(safeId);
        if (!isNaN(numId) && numId !== this.selectedSafeId()) {
          this.selectedSafeId.set(numId);
        }
      }
    });

    // Emit selection whenever valid state changes
    effect(() => {
      const valid = this.isValid();
      this.validationChange.emit(valid && !this.isSafeInsufficient() && !this.isCustodyInsufficient());

      if (!valid) {
        this.selectionChange.emit(null);
        return;
      }

      const sourceType = this.sourceType();
      const sourceId = sourceType === 'SAFE' ? this.selectedSafeId() : this.selectedCustodyId();
      if (sourceId === null) {
        this.selectionChange.emit(null);
        return;
      }

      this.selectionChange.emit({
        payment_source_type: sourceType,
        payment_source_id: sourceId
      });
    });
  }

  onSafeSelected(safeId: number): void {
    this.selectedSafeId.set(safeId);
  }

  onSourceTypeChange(type: PaymentSourceType): void {
    this.sourceType.set(type);
    this.selectedSafeId.set(null);
    this.selectedCustodyId.set(null);
  }

  onCustodyChange(rawValue: string): void {
    const value = Number(rawValue);
    this.selectedCustodyId.set(Number.isNaN(value) ? null : value);
  }

  private loadData(): void {
    forkJoin({
      safes: this.custodyService.getActiveSafes({ silent: true }),
      custodies: this.custodyService.getOpenAndPartialCustodies({ silent: true })
    }).subscribe({
      next: ({ safes, custodies }) => {
        this.safes.set(safes);

        const personType = this.personType();
        const personId = this.personId();

        if (personType && personId !== null) {
          this.custodies.set(
            custodies.filter(c =>
              c.given_to_person_type === personType &&
              c.given_to_person_id === personId
            )
          );
        } else {
          this.custodies.set(custodies);
        }
      }
    });
  }
}
