 // ============================================================
// FRONTEND: partner-profits.component.ts
// Full updated file — PartnerWithdrawalsHistoryDialogComponent
// uses "Load first 10 + Show More" pattern via Angular Signals
// ============================================================

import {
  Component, OnInit, Inject, inject,
  computed, signal, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule }                                    from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators }    from '@angular/forms';
import { MatCardModule }                                   from '@angular/material/card';
import { MatButtonModule }                                 from '@angular/material/button';
import { MatIconModule }                                   from '@angular/material/icon';
import {
  MatDialog, MatDialogModule,
  MatDialogRef, MAT_DIALOG_DATA
}                                                          from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule }                  from '@angular/material/snack-bar';
import { MatProgressSpinnerModule }                        from '@angular/material/progress-spinner';
import { MatInputModule }                                  from '@angular/material/input';
import { MatFormFieldModule }                              from '@angular/material/form-field';
import { MatDatepickerModule }                             from '@angular/material/datepicker';
import { MatNativeDateModule }                             from '@angular/material/core';
import { MatTableModule }                                  from '@angular/material/table';
import { MatDividerModule }                                from '@angular/material/divider';
import { MatGridListModule }                               from '@angular/material/grid-list';
import { MatSelectModule }                                 from '@angular/material/select';
import { MatTooltipModule }                                from '@angular/material/tooltip';
import { MatChipsModule }                                  from '@angular/material/chips';

import {
  PartnerProfitService,
  PaginatedResponse
}                                                          from '../../../core/services/partner-profit.service';
import {
  PartnerBalance,
  PartnerWithdrawal,
  PartnerReinvestment,
  PartnerTransaction
}                                                          from '../../../core/models';
import { ReportUtilitiesService }                          from '../../../core/services/ReportUtilitiesService';
import { PaymentMethodSelectorComponent }                  from '../../../shared/components/payment-method-selector/payment-method-selector.component';
import { firstValueFrom }                                  from 'rxjs';
import { PartnerProfitReinvestmentDialogComponent } from './partner-profit-reinvestment-dialog/partner-profit-reinvestment-dialog.component';

// ============================================================
// MAIN LIST COMPONENT (unchanged logic — included for context)
// ============================================================

@Component({
  selector: 'app-partner-profits',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, MatCardModule, MatButtonModule, MatIconModule,
    MatDialogModule, MatSnackBarModule, MatProgressSpinnerModule,
    MatInputModule, MatFormFieldModule, MatDatepickerModule,
    MatNativeDateModule, MatTableModule, MatDividerModule,
    MatGridListModule, MatSelectModule, MatTooltipModule,
    ReactiveFormsModule
  ],
  templateUrl: './partner-profits.component.html',
  styleUrls: ['./partner-profits.component.css']
})
export class PartnerProfitsComponent implements OnInit {
  private partnerProfitService = inject(PartnerProfitService);
  private snackBar             = inject(MatSnackBar);
  private dialog               = inject(MatDialog);
  private utils                = inject(ReportUtilitiesService);

  partnerBalances = signal<PartnerBalance[]>([]);
  isLoading       = signal(false);
  page            = signal(1);
  pageSize        = signal(20);
  hasMore         = signal(true);
  loadingMore     = signal(false);

  data?: any;
  readonly Math = Math;

  ngOnInit(): void { this.loadBalances(); }

  async loadBalances(append = false): Promise<void> {
    if (!append) {
      this.page.set(1);
      this.hasMore.set(true);
      this.isLoading.set(true);
    } else {
      this.loadingMore.set(true);
    }

    try {
      const res = await firstValueFrom(
        this.partnerProfitService.getAllBalances(this.page(), this.pageSize())
      ) as { data?: PartnerBalance[]; meta?: { page: number; limit: number; total: number; hasMore: boolean } };

      if (!append) {
        this.partnerBalances.set(res.data || []);
      } else {
        this.partnerBalances.set([...this.partnerBalances(), ...(res.data || [])]);
      }
      if (res.meta) this.hasMore.set(res.meta.hasMore);
    } catch {
      this.snackBar.open('فشل تحميل بيانات أرباح الشركاء', 'حسناً', { duration: 3000 });
    } finally {
      this.isLoading.set(false);
      this.loadingMore.set(false);
    }
  }

  loadMore(): void {
    if (!this.loadingMore() && this.hasMore()) {
      this.page.set(this.page() + 1);
      this.loadBalances(true);
    }
  }

  totalInvested = computed(() =>
    this.partnerBalances().reduce((s, i) => s + (i.partner.investment_percentage || 0), 0)
  );
  totalProfit   = computed(() =>
    this.partnerBalances().reduce((s, i) => s + i.accumulated_profit, 0)
  );
  totalWithdrawn = computed(() =>
    this.partnerBalances().reduce((s, i) => s + i.total_withdrawn, 0)
  );
  totalReinvested = computed(() =>
    this.partnerBalances().reduce((s, i) => s + (i.total_reinvested || 0), 0)
  );
  totalNet = computed(() =>
    this.partnerBalances().reduce((s, i) => s + i.current_balance, 0)
  );

  getNetBalanceColor(net: number): string {
    if (net > 0) return 'green';
    if (net < 0) return 'red';
    return '#333';
  }

  openReinvestmentDialog(partner: PartnerBalance): void {
    const ref = this.dialog.open(PartnerProfitReinvestmentDialogComponent, {
      width: '580px',
      data: { partner },
      direction: 'rtl'
    });
    ref.afterClosed().subscribe((result: boolean | undefined) => {
      if (result === true) {
        this.loadBalances();
        this.snackBar.open('✅ تم إعادة استثمار الأرباح بنجاح', 'حسناً', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      }
    });
  }

  openWithdrawalDialog(partner: PartnerBalance): void {
    const ref = this.dialog.open(PartnerProfitWithdrawalDialogComponent, {
      width: '580px', data: { partner }, direction: 'rtl'
    });
    ref.afterClosed().subscribe((result: boolean | undefined) => {
      if (result === true) {
        this.loadBalances();
        this.snackBar.open('تم تسجيل السحب', 'حسناً', { duration: 3000 });
      }
    });
  }

  openTransactionsHistory(partner: PartnerBalance): void {
    const safePartner = partner.partner;
    if (!safePartner?.id || !safePartner?.name) {
      console.warn('Cannot open transactions history: missing partner data', partner);
      this.snackBar.open('لا يمكن عرض السجل - بيانات الشريك غير مكتملة', 'موافق', { duration: 4000 });
      return;
    }
    this.dialog.open(PartnerTransactionsHistoryDialogComponent, {
      width: '780px',
      data: { partnerId: safePartner.id, partnerName: safePartner.name || 'شريك غير معروف' },
      direction: 'rtl'
    });
  }

  formatCurrency(amount: number): string { return this.utils.formatCurrency(amount); }
}

// Update history dialog name + use transactions endpoint
@Component({
  selector: 'app-partner-transactions-history-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatDialogModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatChipsModule,
    MatTooltipModule
  ],
  template: `
    <!-- Header -->
    <div class="dialog-header">
      <h2 class="dialog-title">
        <mat-icon>history</mat-icon>
        سجل معاملات {{  partnerName }}
      </h2>
      @if (!isLoading() && transactions().length > 0) {
        <div class="summary-chips">
          <span class="chip chip--count">{{ transactions().length }} معاملة</span>
          <span class="chip chip--balance">صافي: {{ formatCurrency(netBalance()) }}</span>
        </div>
      }
    </div>

    <mat-divider></mat-divider>

    @if (isLoading()) {
      <div class="spinner-wrap">
        <mat-spinner diameter="44"></mat-spinner>
        <p>جاري تحميل السجلات...</p>
      </div>
    } @else if (transactions().length === 0) {
      <div class="empty-state">
        <mat-icon>schedule</mat-icon>
        <p>لا توجد معاملات مسجلة</p>
      </div>
    } @else {
      <div class="table-container">
        <table mat-table [dataSource]="transactions()" class="transactions-table">
          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef>التاريخ</th>
            <td mat-cell *matCellDef="let item">{{ formatDate(item.date) }}</td>
          </ng-container>

          <ng-container matColumnDef="type">
            <th mat-header-cell *matHeaderCellDef>النوع</th>
            <td mat-cell *matCellDef="let item">
              <mat-chip-listbox>
                <mat-chip
                  [style.background-color]="item.type === 'PROFIT' ? '#e8f5e9' : (item.type === 'REINVESTMENT' ? '#e3f2fd' : '#fff1f0')"
                  [style.color]="item.type === 'PROFIT' ? '#2e7d32' : (item.type === 'REINVESTMENT' ? '#1565c0' : '#cf1322')"
                >
                  {{ item.type === 'PROFIT' ? 'ربح دوري' : (item.type === 'REINVESTMENT' ? 'إعادة استثمار' : 'سحب أرباح') }}
                </mat-chip>
              </mat-chip-listbox>
            </td>
          </ng-container>

          <ng-container matColumnDef="amount">
            <th mat-header-cell *matHeaderCellDef>المبلغ</th>
            <td mat-cell *matCellDef="let item">
              <span [style.color]="item.amount >= 0 ? '#2e7d32' : '#d32f2f'" [style.font-weight]="'700'">
                {{ formatCurrency(Math.abs(item.amount)) }}
                <small>{{ item.amount >= 0 ? '(+)' : '(-)' }}</small>
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="notes">
            <th mat-header-cell *matHeaderCellDef>ملاحظات</th>
            <td mat-cell *matCellDef="let item">
              <span [matTooltip]="item.notes" class="notes-cell">
                {{ (item.notes || '—') | slice:0:40 }}{{ item.notes?.length > 40 ? '…' : '' }}
              </span>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columns; sticky: true"></tr>
          <tr mat-row *matRowDef="let row; columns: columns;"></tr>
        </table>
      </div>

      @if (hasMore()) {
        <div class="load-more">
          <button mat-stroked-button (click)="loadMore()" [disabled]="loadingMore()">
            عرض المزيد ({{ transactions().length }}/{{ totalCount() }})
          </button>
        </div>
      }
    }

    <mat-divider></mat-divider>
    <div class="dialog-actions">
      <button mat-button mat-dialog-close>إغلاق</button>
    </div>
  `,
  styles: [`
    .dialog-header { padding: 24px; display: flex; flex-direction: column; gap: 12px; }
    .dialog-title { font-size: 1.25rem; font-weight: 700; display: flex; align-items: center; gap: 10px; }
    .summary-chips { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

    .table-container { max-height: 400px; overflow: auto; margin: 16px; border-radius: 8px; border: 1px solid #ddd; }
    .transactions-table { width: 100%; }

    .data-row:nth-child(even) { background: #f8f9ff; }
    .data-row:hover { background: #f0f7ff; }

    th { font-weight: 600; color: #374151; }
    mat-chip { font-weight: 600; height: 28px; }

    .load-more { text-align: center; padding: 16px; }
    .dialog-actions { padding: 16px; justify-content: end; }

    .empty-state, .spinner-wrap { text-align: center; padding: 60px 24px; color: #6b7280; }
  `]
})
export class PartnerTransactionsHistoryDialogComponent implements OnInit {
  transactions = signal<PartnerTransaction[]>([]);
  isLoading = signal(true);
  loadingMore = signal(false);
  hasMore = signal(false);
  page = signal(1);
  pageSize = signal(10);
  totalCount = signal(0);
Math=Math
  columns = ['date', 'type', 'amount', 'notes'];

  netBalance = computed(() => this.transactions().reduce((sum, t) => sum + t.amount, 0));

  partnerId = 0;
  partnerName = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) data: { partnerId: number; partnerName: string },
    private service: PartnerProfitService,
    private utils: ReportUtilitiesService
  ) {
    this.partnerId = data.partnerId;
    this.partnerName = data.partnerName;
  }

  ngOnInit(): void {
    this.loadTransactions();
  }

  async loadTransactions(append = false): Promise<void> {
    if (!append) {
      this.page.set(1);
      this.isLoading.set(true);
    } else {
      this.loadingMore.set(true);
    }

    try {
      const res: PaginatedResponse<PartnerTransaction> = await firstValueFrom(
        this.service.getTransactionsHistory(this.partnerId, this.page(), this.pageSize())
      );

      const incoming = res.data || [];

      if (!append) {
        this.transactions.set(incoming);
      } else {
        this.transactions.update(curr => [...curr, ...incoming]);
      }

      this.hasMore.set(!!res.meta?.hasMore);
      this.totalCount.set(res.meta?.total || 0);
    } catch {
      if (!append) this.transactions.set([]);
    } finally {
      this.isLoading.set(false);
      this.loadingMore.set(false);
    }
  }

  loadMore(): void {
    if (this.hasMore() && !this.loadingMore()) {
      this.page.update(p => p + 1);
      this.loadTransactions(true);
    }
  }

  formatCurrency(amount: number): string {
    return this.utils.formatCurrency(amount);
  }

  formatDate(date: string): string {
    return this.utils.formatDate(date);
  }
}

// ============================================================
// WITHDRAWAL DIALOG COMPONENT (unchanged)
// ============================================================

@Component({
  selector: 'app-partner-profit-withdrawal-dialog',
  standalone: true,
  imports: [
    CommonModule, MatDialogModule, MatFormFieldModule, MatInputModule,
    MatDatepickerModule, MatNativeDateModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, PaymentMethodSelectorComponent,
    ReactiveFormsModule, MatTooltipModule
  ],
  template: `
    <div class="dialog-content">
    
      <!-- =========================================
      Header
      ========================================== -->
      <div class="dialog-header">
    
        <div class="title-wrapper">
          <div class="title-icon-wrap">
            <mat-icon>account_balance_wallet</mat-icon>
          </div>
    
          <div class="title-content">
            <h2 class="dialog-title">سحب أرباح</h2>
    
            <p class="dialog-subtitle">
              تسجيل عملية سحب أرباح للشريك
            </p>
          </div>
        </div>
    
      </div>
    
      <!-- =========================================
      Summary Card
      ========================================== -->
      <div class="summary-info">
    
        <div class="summary-row">
          <span class="summary-label">الشريك</span>
    
          <strong class="summary-value">
            {{ partner.partner.name }}
          </strong>
        </div>
    
        <div class="summary-row">
          <span class="summary-label">
            الحد الأقصى المتاح للسحب
          </span>
    
          <strong class="summary-balance">
            {{ formatCurrency(partner.current_balance) }}
          </strong>
        </div>
    
      </div>
    
      <!-- =========================================
      Form
      ========================================== -->
      <form
        [formGroup]="withdrawalForm"
        class="withdrawal-form">
    
        <!-- Amount -->
        <mat-form-field
          appearance="outline"
          class="full-width">
    
          <mat-label>المبلغ</mat-label>
    
          <input
            matInput
            type="number"
            min="0.01"
            formControlName="amount" />
    
          <mat-hint>
            الحد الأقصى:
            {{ formatCurrency(partner.current_balance) }}
            جنيه
          </mat-hint>
    
          @if (withdrawalForm.get('amount')?.hasError('required')) {
            <mat-error>
              المبلغ مطلوب
            </mat-error>
          }
    
          @if (withdrawalForm.get('amount')?.hasError('max')) {
            <mat-error>
              المبلغ يتجاوز الحد الأقصى
            </mat-error>
          }
    
          @if (withdrawalForm.get('amount')?.hasError('min')) {
            <mat-error>
              المبلغ يجب أن يكون أكبر من صفر
            </mat-error>
          }
    
        </mat-form-field>
    
        <!-- Withdrawal Date -->
        <mat-form-field
          appearance="outline"
          class="full-width">
    
          <mat-label>تاريخ السحب</mat-label>
    
          <input
            matInput
            [matDatepicker]="picker"
            formControlName="withdrawal_date" />
    
          <mat-datepicker-toggle
            matSuffix
            [for]="picker">
          </mat-datepicker-toggle>
    
          <mat-datepicker #picker></mat-datepicker>
    
        </mat-form-field>
    
        <!-- Payment Method Selector -->
        <div class="payment-section">
          <app-payment-method-selector
            [parentForm]="withdrawalForm">
          </app-payment-method-selector>
        </div>
    
        <!-- Notes -->
        <mat-form-field
          appearance="outline"
          class="full-width">
    
          <mat-label>ملاحظات (اختياري)</mat-label>
    
          <textarea
            matInput
            rows="4"
            formControlName="notes">
          </textarea>
    
          <mat-hint>
            يمكنك إضافة تفاصيل إضافية حول عملية السحب
          </mat-hint>
    
        </mat-form-field>
    
      </form>
    
      <!-- =========================================
      Actions
      ========================================== -->
      <div class="dialog-actions">
    
        <button
          mat-button
          type="button"
          class="cancel-btn"
          (click)="cancel()">
    
          إلغاء
        </button>
    
        <button
          mat-raised-button
          color="primary"
          type="button"
          class="submit-btn"
          (click)="submit()"
          [disabled]="withdrawalForm.invalid || submitting()">
    
          @if (submitting()) {
            <mat-spinner diameter="18"></mat-spinner>
          } @else {
            <mat-icon>check_circle</mat-icon>
          }
    
          <span>تأكيد السحب</span>
    
        </button>
    
      </div>
    
    </div>
    `,
  styles: [`
  /* =========================================================
   Host
========================================================= */

:host {
  display: block;
  direction: rtl;
}

/* =========================================================
   Dialog Layout
========================================================= */

.dialog-content {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  width: min(100%, 100%);
  max-width: 100%;

  padding: 1rem;

  max-height: 85vh;
  overflow-y: auto;

  box-sizing: border-box;
}

/* =========================================================
   Header
========================================================= */

.dialog-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.title-wrapper {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.title-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 3rem;
  height: 3rem;

  border-radius: 1rem;

  background: linear-gradient(
    135deg,
    #e8f5e9 0%,
    #c8e6c9 100%
  );

  flex-shrink: 0;
}

.title-icon-wrap mat-icon {
  color: #2e7d32;
  font-size: 1.5rem;
  width: 1.5rem;
  height: 1.5rem;
}

.title-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.dialog-title {
  margin: 0;

  font-size: clamp(1.1rem, 2vw, 1.4rem);
  font-weight: 700;
  line-height: 1.4;

  color: #1f2937;
}

.dialog-subtitle {
  margin: 0;

  color: #6b7280;
  font-size: 0.9rem;
  line-height: 1.5;
}

/* =========================================================
   Summary Card
========================================================= */

.summary-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  padding: 1rem;

  border-radius: 1rem;

  border: 1px solid #c8e6c9;

  background:
    linear-gradient(
      135deg,
      #f1f8f4 0%,
      #ecfdf3 100%
    );
}

.summary-row {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.summary-label {
  color: #4b5563;
  font-size: 0.9rem;
}

.summary-value {
  color: #111827;
  font-size: 1rem;
  font-weight: 700;
}

.summary-balance {
  color: #2e7d32;

  font-size: clamp(1rem, 2vw, 1.2rem);
  font-weight: 800;

  word-break: break-word;
}

/* =========================================================
   Form
========================================================= */

.withdrawal-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.full-width {
  width: 100%;
}

.payment-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* =========================================================
   Material Field Improvements
========================================================= */

mat-form-field {
  width: 100%;
}

textarea {
  resize: vertical;
  min-height: 90px;
}

/* =========================================================
   Actions
========================================================= */

.dialog-actions {
  display: flex;
  flex-direction: column-reverse;
  gap: 0.75rem;

  padding-top: 0.5rem;
}

.dialog-actions button {
  width: 100%;
  min-height: 46px;

  border-radius: 0.9rem;

  font-weight: 700;
}

.submit-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  box-shadow:
    0 4px 12px rgba(46, 125, 50, 0.2);
}

.submit-btn mat-spinner {
  flex-shrink: 0;
}

.cancel-btn {
  border-radius: 0.9rem;
}

/* =========================================================
   Scrollbar
========================================================= */

.dialog-content::-webkit-scrollbar {
  width: 8px;
}

.dialog-content::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.18);
  border-radius: 999px;
}

/* =========================================================
   Tablet
========================================================= */

@media (min-width: 768px) {

  .dialog-content {
    padding: 1.5rem;

    width: min(580px, 92vw);
  }

  .summary-row {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .dialog-actions {
    flex-direction: row;
    justify-content: flex-end;
  }

  .dialog-actions button {
    width: auto;
    min-width: 150px;
  }
}

/* =========================================================
   Desktop
========================================================= */

@media (min-width: 1024px) {

  .dialog-content {
    width: min(620px, 90vw);
  }

  .withdrawal-form {
    gap: 1.15rem;
  }
}
  `]
})
export class PartnerProfitWithdrawalDialogComponent {
  partner:        PartnerBalance;
  submitting      = signal(false);
  withdrawalForm: any;

  constructor(
    private fb:                   FormBuilder,
    private dialogRef:            MatDialogRef<PartnerProfitWithdrawalDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { partner: PartnerBalance },
    private partnerProfitService: PartnerProfitService,
    private snackBar:             MatSnackBar,
    private utils:                ReportUtilitiesService
  ) {
    this.partner = data.partner;
    this.withdrawalForm = this.fb.group({
      amount: [
        null as number | null,
        [Validators.required, Validators.min(0.01), Validators.max(this.partner.current_balance)]
      ],
      withdrawal_date: [new Date(),  Validators.required],
      payment_method:  ['CASH',      Validators.required],
      safe_id:         [null as number | null, Validators.required],
      notes:           ['']
    });
  }

  formatCurrency(amount: number): string { return this.utils.formatCurrency(amount); }
  cancel(): void { this.dialogRef.close(false); }

  async submit(): Promise<void> {
    if (!this.partner || this.withdrawalForm.invalid) return;

    const value  = this.withdrawalForm.value;
    const amount = value.amount ?? 0;

    if (amount > this.partner.current_balance) {
      this.snackBar.open('المبلغ أكبر من صافي الرصيد', 'حسناً', { duration: 3000 });
      return;
    }

    this.submitting.set(true);
    try {
      await firstValueFrom(
        this.partnerProfitService.recordWithdrawal(this.partner.partner.id, value)
      );
      this.dialogRef.close(true);
    } catch {
      this.snackBar.open('فشل تسجيل السحب', 'حسناً', { duration: 3000 });
    } finally {
      this.submitting.set(false);
    }
  }
}

// ============================================================
// WITHDRAWALS HISTORY DIALOG — fully updated with load-more
// ============================================================

@Component({
  selector: 'app-partner-withdrawals-history-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatDialogModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatChipsModule,
    MatTooltipModule
  ],
  template: `
<!-- ── HEADER ─────────────────────────────────────────── -->
<div class="dialog-header">
  <h2 class="dialog-title">
    <mat-icon class="title-icon">account_balance_wallet</mat-icon>
    سحوبات {{ partnerName }}
  </h2>

  @if (!isLoading() && withdrawals().length > 0) {
    <div class="summary-chips">
      <span class="chip chip--count">
        {{ totalCount() }} سجل
      </span>

      <span class="chip chip--amount">
        الإجمالي: {{ formatCurrency(totalWithdrawn()) }}
      </span>

      @if (hasMore()) {
        <span class="chip chip--more">
          يوجد المزيد ↓
        </span>
      }
    </div>
  }
</div>

<mat-divider></mat-divider>

<!-- ── INITIAL LOAD SPINNER ───────────────────────────── -->
@if (isLoading()) {
  <div class="spinner-wrap" aria-label="جاري التحميل">
    <mat-spinner diameter="44"></mat-spinner>
    <p class="spinner-label">جاري تحميل السجلات…</p>
  </div>
}

<!-- ── TABLE ─────────────────────────────────────────── -->
@if (!isLoading()) {

  @if (withdrawals().length === 0) {

    <div class="empty-state">
      <mat-icon class="empty-icon">inbox</mat-icon>
      <p>لا توجد سحوبات مسجلة لهذا الشريك</p>
    </div>

  } @else {

    <div class="table-container">

      <div class="table-scroll-x">

        <table
          mat-table
          [dataSource]="withdrawals()"
          class="withdrawals-table"
        >

          <!-- Date Column -->
          <ng-container matColumnDef="withdrawal_date">
            <th mat-header-cell *matHeaderCellDef>
              التاريخ
            </th>

            <td mat-cell *matCellDef="let item">
              <span class="date-cell">
                {{ formatDate(item.withdrawal_date) }}
              </span>
            </td>
          </ng-container>

          <!-- Amount Column -->
          <ng-container matColumnDef="amount">
            <th mat-header-cell *matHeaderCellDef>
              المبلغ
            </th>

            <td mat-cell *matCellDef="let item">
              <span class="amount-cell">
                {{ formatCurrency(item.amount) }}
              </span>
            </td>
          </ng-container>

          <!-- Payment Method Column -->
          <ng-container matColumnDef="payment_method">
            <th mat-header-cell *matHeaderCellDef>
              طريقة الدفع
            </th>

            <td mat-cell *matCellDef="let item">
              <span
                class="method-badge method-badge--{{ item.payment_method?.toLowerCase() }}"
              >
                {{ paymentMethodName(item.payment_method) }}
              </span>
            </td>
          </ng-container>

          <!-- Safe Column -->
          <ng-container matColumnDef="safe">
            <th mat-header-cell *matHeaderCellDef>
              الخزنة
            </th>

            <td mat-cell *matCellDef="let item">
              {{ item.safe?.name || (item.safe_id ? 'خزنة #' + item.safe_id : '—') }}
            </td>
          </ng-container>

          <!-- Notes Column -->
          <ng-container matColumnDef="notes">
            <th mat-header-cell *matHeaderCellDef>
              ملاحظات
            </th>

            <td mat-cell *matCellDef="let item">
              <span
                class="notes-cell"
                [matTooltip]="item.notes || ''"
              >
                {{
                  item.notes
                    ? (
                        item.notes.length > 30
                          ? (item.notes | slice:0:30) + '…'
                          : item.notes
                      )
                    : '—'
                }}
              </span>
            </td>
          </ng-container>

          <!-- Header & Rows -->
          <tr
            mat-header-row
            *matHeaderRowDef="columns; sticky: true"
          ></tr>

          <tr
            mat-row
            *matRowDef="let row; columns: columns;"
            class="data-row"
          ></tr>

        </table>

      </div>

    </div>

    <!-- ── TOTALS ─────────────────────────────────────── -->
    <div class="totals-bar">

      <span class="totals-label">
        <mat-icon>summarize</mat-icon>
        المجموع المعروض ({{ withdrawals().length }} سجل)
      </span>

      <span class="totals-amount">
        {{ formatCurrency(totalWithdrawn()) }}
      </span>

    </div>

    <!-- ── LOAD MORE ─────────────────────────────────── -->
    @if (hasMore() || loadingMore()) {

      <div class="load-more-container">

        <button
          mat-stroked-button
          class="load-more-btn"
          (click)="loadMore()"
          [disabled]="loadingMore() || !hasMore()"
          [attr.aria-busy]="loadingMore()"
        >

          @if (loadingMore()) {

            <mat-spinner
              diameter="18"
              class="btn-spinner"
            ></mat-spinner>

            <span>جاري التحميل…</span>

          } @else {
            <ng-container>
              <mat-icon>expand_more</mat-icon>
              <span>عرض المزيد</span>
            </ng-container>
          }

        </button>

        <span class="load-more-hint">
          عُرض {{ withdrawals().length }} من أصل {{ totalCount() }}
        </span>

      </div>

    }

    <!-- ── ALL LOADED ────────────────────────────────── -->
    @if (
      !hasMore()
      && withdrawals().length > 0
      && withdrawals().length === totalCount()
    ) {

      <div class="all-loaded-note">
        <mat-icon>check_circle</mat-icon>
        تم عرض جميع السجلات ({{ totalCount() }})
      </div>

    }

  }

}

<!-- ── FOOTER ───────────────────────────────────────── -->
<mat-divider></mat-divider>

<div class="dialog-actions">
  <button
    mat-button
    mat-dialog-close
    color="primary"
  >
    إغلاق
  </button>
</div>
  `,
  styles: [`
    /* ── Layout ─────────────────────────────────────────── */

:host {
  display: flex;
  flex-direction: column;
  direction: rtl;
}

.dialog-header {
  padding: 20px 24px 12px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}

.dialog-title {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: #1a1a2e;
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-icon {
  color: #2e7d32;
  font-size: 1.4rem;
  width: 1.4rem;
  height: 1.4rem;
}

/* ── Summary chips ─────────────────────────────────── */

.summary-chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}

.chip {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
}

.chip--count {
  background: #e8f5e9;
  color: #2e7d32;
}

.chip--amount {
  background: #e3f2fd;
  color: #1565c0;
}

.chip--more {
  background: #fff8e1;
  color: #f57f17;
}

/* ── Spinner ───────────────────────────────────────── */

.spinner-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 0;
  gap: 14px;
}

.spinner-label {
  color: #666;
  font-size: 0.88rem;
  margin: 0;
}

/* ── Empty State ───────────────────────────────────── */

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 0;
  gap: 10px;
  color: #9e9e9e;
  text-align: center;
}

.empty-state p {
  margin: 0;
  font-size: 0.95rem;
}

.empty-icon {
  font-size: 3rem;
  width: 3rem;
  height: 3rem;
  opacity: 0.35;
}

/* ── Table Container ───────────────────────────────── */

.table-container {
  max-height: 380px;
  overflow-y: auto;
  margin: 12px 24px 0;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: #fff;
  scroll-behavior: smooth;

  -webkit-overflow-scrolling: touch;
}

.table-scroll-x {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

/* ── Table ─────────────────────────────────────────── */

.withdrawals-table {
  width: 100%;
  border-collapse: collapse;
}

@media (min-width: 768px) {
  .withdrawals-table {
    min-width: 540px;
  }
}

/* ── Sticky Header ─────────────────────────────────── */

.mat-mdc-header-row {
  position: sticky;
  top: 0;
  z-index: 3;
  background: #f8fafc;
}

/* ── Cells ─────────────────────────────────────────── */

.mat-mdc-header-cell,
.mat-mdc-cell {
  padding: 12px 10px;
  white-space: nowrap;
}

.withdrawals-table th {
  font-weight: 700;
  color: #424242;
  font-size: 0.85rem;
}

/* ── Rows ──────────────────────────────────────────── */

.data-row {
  transition:
    background-color 0.15s ease,
    transform 0.1s ease;
}

.data-row:nth-child(even) {
  background: #fafafa;
}

.data-row:hover {
  background: #f0f7ff;
  transform: translateY(-1px);
}

/* ── Cell Styling ──────────────────────────────────── */

.date-cell {
  font-variant-numeric: tabular-nums;
  font-size: 0.88rem;
  color: #555;
  white-space: nowrap;
}

.amount-cell {
  font-weight: 700;
  color: #c62828;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.method-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.method-badge--cash {
  background: #e8f5e9;
  color: #2e7d32;
}

.method-badge--bank {
  background: #e3f2fd;
  color: #1565c0;
}

.method-badge--instapay {
  background: #fce4ec;
  color: #880e4f;
}

.method-badge--vodafone_cash {
  background: #fff3e0;
  color: #e65100;
}

.notes-cell {
  color: #6b7280;
  font-size: 0.82rem;
  display: inline-block;
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ── Totals ────────────────────────────────────────── */

.totals-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 24px;
  background: #f1f8e9;
  border-top: 2px solid #aed581;
  margin: 0 24px;
  border-radius: 0 0 8px 8px;
}

.totals-label {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #558b2f;
  font-size: 0.88rem;
  font-weight: 600;
}

.totals-label mat-icon {
  font-size: 1.1rem;
  width: 1.1rem;
  height: 1.1rem;
}

.totals-amount {
  font-weight: 800;
  font-size: 1rem;
  color: #c62828;
  font-variant-numeric: tabular-nums;
}

/* ── Load More ─────────────────────────────────────── */

.load-more-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px 24px 8px;
}

.load-more-btn {
  min-width: 160px;
  border: 1.5px solid #1565c0 !important;
  color: #1565c0 !important;
  border-radius: 20px !important;
  font-weight: 600;
  transition:
    background 0.2s,
    transform 0.1s;
}

.load-more-btn:hover:not([disabled]) {
  background: #e3f2fd !important;
  transform: translateY(-1px);
}

.load-more-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.load-more-btn .mdc-button__label {
  display: flex;
  align-items: center;
  gap: 6px;
}

.load-more-btn mat-icon {
  margin: 0;
}

.btn-spinner {
  display: inline-block;
}

.load-more-hint {
  font-size: 0.75rem;
  color: #9e9e9e;
}

/* ── All Loaded ────────────────────────────────────── */

.all-loaded-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #388e3c;
  font-size: 0.82rem;
  padding: 8px 24px;
}

.all-loaded-note mat-icon {
  font-size: 1rem;
  width: 1rem;
  height: 1rem;
}

/* ── Footer ────────────────────────────────────────── */

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
  padding: 10px 24px 14px;
}

/* ── Responsive ────────────────────────────────────── */

@media (max-width: 600px) {

  .dialog-header {
    padding: 12px 16px 8px;
  }

  .summary-chips {
    width: 100%;
    justify-content: center;
  }

  .chip {
    font-size: 0.72rem;
  }

  .table-container {
    margin: 8px 12px 0;
  }

  .totals-bar {
    margin: 0 12px;
    padding: 8px 12px;
  }

  .load-more-container {
    padding: 12px 16px 6px;
  }

  .dialog-actions {
    padding: 8px 16px 12px;
  }

  .notes-cell {
    max-width: 120px;
  }
}
  `]
})
export class PartnerWithdrawalsHistoryDialogComponent implements OnInit {

  // ── Data signals ────────────────────────────────────────
  withdrawals  = signal<PartnerWithdrawal[]>([]);
  isLoading    = signal(false);
  loadingMore  = signal(false);
  hasMore      = signal(false);

  // ── Pagination signals ──────────────────────────────────
  page         = signal(1);
  pageSize     = signal(10);
  totalCount   = signal(0);  // tracks server-side total

  // ── Computed ────────────────────────────────────────────
  totalWithdrawn = computed(() =>
    this.withdrawals().reduce((sum, w) => sum + (w.amount || 0), 0)
  );

  // ── Static config ───────────────────────────────────────
  readonly columns = ['withdrawal_date', 'amount', 'payment_method', 'safe', 'notes'];

  // ── Dialog metadata ─────────────────────────────────────
  partnerName = '';
  partnerId   = 0;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { partnerId: number; partnerName: string },
    private partnerProfitService: PartnerProfitService,
    private utils: ReportUtilitiesService
  ) {
    this.partnerId   = data.partnerId;
    this.partnerName = data.partnerName;
  }

  ngOnInit(): void {
    this.loadWithdrawals();
  }

  // ── Core load method ────────────────────────────────────
  /**
   * @param append  false = initial/reset load; true = load-more append
   */
  async loadWithdrawals(append = false): Promise<void> {
    if (!append) {
      // Reset state for fresh load
      this.page.set(1);
      this.hasMore.set(false);
      this.isLoading.set(true);
    } else {
      // Load-more: only show button spinner — do NOT block the table
      this.loadingMore.set(true);
    }

    try {
  const res: PaginatedResponse<PartnerWithdrawal> = await firstValueFrom(
        this.partnerProfitService.getWithdrawals(
          this.partnerId,
          this.page(),
          this.pageSize()
        )
      );

      const incoming = res.data || [];

      // Append or replace
      if (!append) {
        this.withdrawals.set(incoming);
      } else {
        this.withdrawals.set([...this.withdrawals(), ...incoming]);
      }

      // Update pagination state from server meta
      if (res.meta) {
        this.hasMore.set(res.meta.hasMore);
        this.totalCount.set(res.meta.total);
      }

    } catch {
      // Silent fail on load-more; show error on initial load
      if (!append) {
        this.withdrawals.set([]);
      }
    } finally {
      this.isLoading.set(false);
      this.loadingMore.set(false);
    }
  }

  // ── Load More ────────────────────────────────────────────
  loadMore(): void {
    // Guard: skip if already loading or no more data
    if (this.loadingMore() || !this.hasMore()) return;

    this.page.set(this.page() + 1);
    this.loadWithdrawals(true);
  }

  // ── Utilities ────────────────────────────────────────────
  formatCurrency(amount: number): string {
    return this.utils.formatCurrency(amount);
  }

  formatDate(date: string): string {
    return this.utils.formatDate(date);
  }

  paymentMethodName(method: string): string {
    const map: Record<string, string> = {
      CASH:           'نقدي',
      BANK:           'تحويل بنكي',
      INSTAPAY:       'انستاباي',
      VODAFONE_CASH:  'فودافون كاش'
    };
    return map[method] || method || '—';
  }
}
