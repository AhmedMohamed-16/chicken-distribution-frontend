// import { Component, Inject, OnInit, inject, signal } from '@angular/core';
// import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
// import { CommonModule } from '@angular/common';
// import { MatTableModule } from '@angular/material/table';
// import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
// import { MatChipsModule } from '@angular/material/chips';
// import { BuyerService } from '../../../../core/services/buyer.service';
//  import { FarmService } from '../../../../core/services/farm.service';

// @Component({
//   selector: 'app-debt-history-dialog',
//   imports: [CommonModule,
//     MatDialogModule,
//     MatTableModule,
//     MatProgressSpinnerModule,
//     MatChipsModule],
//   templateUrl: './debt-history-dialog.html',
//   styleUrl: './debt-history-dialog.css',
// })
// export class DebtHistoryDialog implements OnInit {

//   private buyerService = inject(BuyerService);
//  private farmService = inject(FarmService);

//   loading = signal(true);
//   dataSource = signal<any[]>([]);
//   currentDebt = signal(0);

//   displayedColumns = [
//     'date',
//     'total_amount',
//     'paid_amount',
//     'remaining_amount'
//   ];

//   constructor(
//     @Inject(MAT_DIALOG_DATA) public data: { id: number; entityType: 'buyer' | 'farm' }
//   ) {}

//   ngOnInit(): void {
//   const request$ =
//     this.data.entityType === 'buyer'
//       ? this.buyerService.getDebtHistory(this.data.id)
//       : this.farmService.getDebtHistory(this.data.id);

//   request$.subscribe({
//     next: (res: any) => {
//       this.currentDebt.set(res.data.current_debt);

//       const transactions = res.data.transactions.map((t: any) => ({
//         date: t.transaction_time,
//         total_amount: t.total_amount,
//         paid_amount:
//           this.data.entityType === 'buyer'
//             ? Number(t.paid_amount) + Number(t.old_debt_paid)
//             : Number(t.paid_amount),
//         remaining_amount: t.remaining_amount
//       }));

//       const payments = res.data.payments.map((p: any) => ({
//         date: p.payment_date,
//         total_amount: '-',
//         paid_amount: p.amount,
//         remaining_amount: '-'
//       }));

//       const merged = [...transactions, ...payments].sort(
//         (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
//       );

//       this.dataSource.set(merged);
//       this.loading.set(false);
//     }
//   });
// }

// }
import { Component, Inject, OnInit, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { BuyerService } from '../../../../core/services/buyer.service';
import { FarmService } from '../../../../core/services/farm.service';
import { ReportUtilitiesService } from '../../../../core/services/ReportUtilitiesService';

interface DebtHistoryItem {
  date: string;
  type: 'transaction' | 'payment';
  total_amount?: number;
  paid_amount?: number;
  amount?: number;
  payment_direction?: string;
  debt_before: number;
  debt_change: number;
  debt_after: number;
  formatted_date?: number;
}

@Component({
  selector: 'app-debt-history-dialog',
  imports: [
    CommonModule,
    MatDialogModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatButtonModule
  ],
  templateUrl: './debt-history-dialog.html',
  styleUrl: './debt-history-dialog.css',
})
export class DebtHistoryDialog implements OnInit {

  private buyerService = inject(BuyerService);
  private farmService = inject(FarmService);

  loading = signal(true);
  dataSource = signal<any[]>([]);
  currentDebt = signal(0);
private utils = inject(ReportUtilitiesService);
 formatCurrency = (amount: number | undefined | null) => this.utils.formatCurrency(amount);
formatNumber = (num: number | undefined | null, decimals?: number) => this.utils.formatNumber(num, decimals);
formatPercentage = (value: number | undefined | null, decimals?: number) => this.utils.formatPercentage(value, decimals);
formatDateTime = (date: string | Date | undefined | null) => this.utils.formatDateTime(date);

  displayedColumns = [
    'date',
    'total_amount',
    'paid_amount',
    'debt_after'
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
        // Set current debt
        this.currentDebt.set(
          this.data.entityType === 'buyer'
            ? res.data.current_debt
            : res.data.current_balance
        );

        // Map history items واخد أول 30 صف فقط
        const history = res.data.history.map((item: DebtHistoryItem) => {
          if (item.type === 'transaction') {
            return {
              date: item.date,
              type: 'transaction',
              total_amount: item.total_amount,
              paid_amount: item.paid_amount,
              debt_after: item.debt_after
            };
          } else {
            // Payment
            return {
              date: item.date,
              type: 'payment',
              total_amount: '-',
              paid_amount: item.amount,
              debt_after: item.debt_after
            };
          }
        });

        this.dataSource.set(history);
        this.loading.set(false);
        console.log("dataSource", this.dataSource());
      },
      error: (err) => {
        console.error('Error loading debt history:', err);
        this.loading.set(false);
      }
    });
  }
}
