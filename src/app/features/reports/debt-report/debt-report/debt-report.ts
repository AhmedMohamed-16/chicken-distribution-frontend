import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { ReportService } from '../../../../core/services/report.service';
import { MatSnackBar } from '@angular/material/snack-bar';
interface FarmDebtResponse {
  farms: any[];
  farms_count: number;
  total_debt: number;
}

interface BuyerDebtResponse {
  buyers: any[];
  buyers_count: number;
  total_debt: number;
}

@Component({
  selector: 'app-debt-report',
  imports: [CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatProgressSpinnerModule],
  templateUrl: './debt-report.html',
  styleUrl: './debt-report.css',
})
export class DebtReport implements OnInit {
  private reportService = inject(ReportService);
  private snackBar = inject(MatSnackBar);
farmDebts = signal<FarmDebtResponse>({
  farms: [],
  farms_count: 0,
  total_debt: 0
});

buyerDebts = signal<BuyerDebtResponse>({
  buyers: [],
  buyers_count: 0,
  total_debt: 0
});

  loading = signal(false);
  columns = ['name', 'debt'];

  ngOnInit(): void {
    this.loadDebts();
  }

  loadDebts(): void {
    this.loading.set(true);
    Promise.all([
      this.reportService.getFarmDebts().toPromise(),
      this.reportService.getBuyerDebts().toPromise()
    ]).then(([farms, buyers]: any[]) => {
      this.farmDebts.set(farms.data);
      this.buyerDebts.set(buyers.data);
      this.loading.set(false);
    })
    .catch(() => {
          this.snackBar.open('فشل تحميل التقرير', 'حسناً', { duration: 3000 });
          this.loading.set(false);
        });
  }
}
