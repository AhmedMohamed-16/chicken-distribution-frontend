import { Component, signal, computed, inject, OnInit, Inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { firstValueFrom } from 'rxjs';

import { PartnerProfitService, PaginatedResponse } from '../../../../core/services/partner-profit.service';
import { PartnerTransaction } from '../../../../core/models';
import { ReportUtilitiesService } from '../../../../core/services/ReportUtilitiesService';

@Component({
  selector: 'app-partner-transactions-history-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, MatDialogModule, MatTableModule, MatButtonModule,
    MatIconModule, MatProgressSpinnerModule, MatDividerModule,
    MatChipsModule, MatTooltipModule
  ],
  template: `
    <div class="dialog-header">
      <h2 class="dialog-title">
        <mat-icon>history</mat-icon>
        سجل معاملات {{ partnerName || 'شريك غير معروف' }}
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
    <!-- Changed from mat-chip-list to mat-chip-set -->
    <mat-chip-set>
      <mat-chip>
        {{ item.type === 'REINVESTMENT' ? 'استثمار' : 'سحب' }}
      </mat-chip>
    </mat-chip-set>
  </td>
</ng-container>

          <ng-container matColumnDef="amount">
            <th mat-header-cell *matHeaderCellDef>المبلغ</th>
            <td mat-cell *matCellDef="let item">
              <span [style.color]="item.amount >= 0 ? '#2e7d32' : '#d32f2f'"
                    [style.font-weight]="'700'">
                {{ formatCurrency(Math.abs(item.amount)) }}
                <small *ngIf="item.amount >= 0">(+)</small>
                <small *ngIf="item.amount < 0">(-)</small>
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="notes">
            <th mat-header-cell *matHeaderCellDef>ملاحظات</th>
            <td mat-cell *matCellDef="let item">
              <span [matTooltip]="item.notes || 'لا ملاحظات'" class="notes-cell">
                {{ item.notes ? (item.notes.length > 40 ? (item.notes | slice:0:40)+'…' : item.notes) : '—' }}
              </span>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columns" class="sticky-header"></tr>
          <tr mat-row *matRowDef="let row; columns: columns;" class="data-row"></tr>
        </table>
      </div>

      @if (hasMore()) {
        <div class="load-more-container">
          <button mat-stroked-button (click)="loadMore()" [disabled]="loadingMore()">
            <mat-icon *ngIf="!loadingMore()">expand_more</mat-icon>
            <mat-spinner *ngIf="loadingMore()" diameter="18"></mat-spinner>
            عرض المزيد
          </button>
        </div>
      }
    }

    <mat-divider></mat-divider>
    <div class="dialog-actions">
      <button mat-button mat-dialog-close color="primary">إغلاق</button>
    </div>
  `,
  styles: [`
    .dialog-header {
      padding: 24px 20px 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .dialog-title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 10px;
      justify-content: center;
    }
    .summary-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: center;
    }
    .chip {
      font-weight: 600;
      font-size: 0.85rem;
    }
    .chip--balance {
      background: linear-gradient(135deg, #c8e6c9, #a5d6a7) !important;
    }

    .table-container {
      max-height: 420px;
      overflow: auto;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      margin: 16px;
    }
    .transactions-table {
      width: 100%;
      min-width: 500px;
    }
    .sticky-header {
      background: white;
      z-index: 3;
    }
    .data-row:nth-child(even) { background: #fafcff; }
    .data-row:hover { background: #f0f8ff; }

    th { font-weight: 700; color: #374151; font-size: 0.9rem; }
    .notes-cell {
      color: #6b7280;
      font-size: 0.85rem;
      max-width: 200px;
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .load-more-container {
      padding: 16px;
      text-align: center;
    }

    .dialog-actions {
      padding: 16px;
      justify-content: flex-end;
    }

    .empty-state, .spinner-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 60px 20px;
      gap: 16px;
      color: #6b7280;
    }

    @media (max-width: 768px) {
      .transactions-table { min-width: 100%; }
      .table-container { margin: 8px; }
    }
  `]
})
export class PartnerTransactionsHistoryDialogComponent implements OnInit {
  readonly transactions = signal<PartnerTransaction[]>([]);
  readonly isLoading = signal(true);
  readonly loadingMore = signal(false);
  readonly hasMore = signal(false);

  readonly page = signal(1);
  readonly pageSize = signal(10);
  readonly totalCount = signal(0);
  readonly Math = Math;

  readonly columns = ['date', 'type', 'amount', 'notes'];

  partnerId = 0;
  partnerName = '';

  readonly netBalance = computed(() =>
    this.transactions().reduce((sum, t) => sum + t.amount, 0)
  );

  private service = inject(PartnerProfitService);
  private utils = inject(ReportUtilitiesService);

  constructor(
    @Inject(MAT_DIALOG_DATA) data?: { partnerId: number; partnerName: string } | null
  ) {
    this.partnerId = data?.partnerId ?? 0;
    this.partnerName = data?.partnerName ?? 'شريك غير معروف';
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
      const res = await firstValueFrom(
        this.service.getTransactionsHistory(
          this.partnerId,
          this.page(),
          this.pageSize()
        )
      );

      const incoming = res.data || [];

      if (!append) {
        this.transactions.set(incoming);
      } else {
        this.transactions.update(curr => [...curr, ...incoming]);
      }

      if (res.meta) {
        this.hasMore.set(res.meta.hasMore);
        this.totalCount.set(res.meta.total);
      }
    } catch {
      if (!append) this.transactions.set([]);
    } finally {
      this.isLoading.set(false);
      this.loadingMore.set(false);
    }
  }

  loadMore(): void {
    if (!this.loadingMore() && this.hasMore()) {
      this.page.update(p => p + 1);
      this.loadTransactions(true);
    }
  }

  formatCurrency(amount: number): string {
    return this.utils.formatCurrency(Math.abs(amount));
  }

  formatDate(date: string): string {
    return this.utils.formatDate(date);
  }
}
