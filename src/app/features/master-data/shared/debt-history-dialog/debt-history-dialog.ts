import { Component, Inject, OnInit, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { BuyerService } from '../../../../core/services/buyer.service';
 import { FarmService } from '../../../../core/services/farm.service';

@Component({
  selector: 'app-debt-history-dialog',
  imports: [CommonModule,
    MatDialogModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatChipsModule],
  templateUrl: './debt-history-dialog.html',
  styleUrl: './debt-history-dialog.css',
})
export class DebtHistoryDialog implements OnInit {

  private buyerService = inject(BuyerService);
 private farmService = inject(FarmService);

  loading = signal(true);
  dataSource = signal<any[]>([]);
  currentDebt = signal(0);

  displayedColumns = [
    'date',
    'total_amount',
    'paid_amount',
    'remaining_amount'
  ];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { id: number; entityType: 'buyer' | 'farm' }
  ) {}

  ngOnInit(): void {
  const request$ =
    this.data.entityType === 'buyer'
      ? this.buyerService.getDebtHistory(this.data.id)
      : this.farmService.getDebtHistory(this.data.id);

  request$.subscribe({
    next: (res: any) => {
      this.currentDebt.set(res.data.current_debt);

      const transactions = res.data.transactions.map((t: any) => ({
        date: t.transaction_time,
        total_amount: t.total_amount,
        paid_amount:
          this.data.entityType === 'buyer'
            ? Number(t.paid_amount) + Number(t.old_debt_paid)
            : Number(t.paid_amount),
        remaining_amount: t.remaining_amount
      }));

      const payments = res.data.payments.map((p: any) => ({
        date: p.payment_date,
        total_amount: '-',
        paid_amount: p.amount,
        remaining_amount: '-'
      }));

      const merged = [...transactions, ...payments].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      this.dataSource.set(merged);
      this.loading.set(false);
    }
  });
}

}
