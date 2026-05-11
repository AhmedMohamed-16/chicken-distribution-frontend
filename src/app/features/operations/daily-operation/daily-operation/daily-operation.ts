import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { OperationService } from '../../../../core/services/operation.service';
import { computed } from '@angular/core';
import { ReportUtilitiesService } from '../../../../core/services/ReportUtilitiesService';
import { FarmLoading } from '../../farm-loading/farm-loading/farm-loading';

@Component({
  selector: 'app-daily-operation',
  imports: [CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    RouterLink
],
  templateUrl: './daily-operation.html',
  styleUrl: './daily-operation.css',
})
export class DailyOperation implements OnInit {
  private route = inject(ActivatedRoute);
  private operationService = inject(OperationService);
  private snackBar = inject(MatSnackBar);
  private utils = inject(ReportUtilitiesService);

  operationId = signal<number>(0);
  operation = signal<any>(null);
  loading = signal(false);

  // Formatting helpers
  formatCurrency = (amt: number | undefined | null) => this.utils.formatCurrency(amt);

  // Computed loss breakdown
  saleLosses = computed(() => {
    const op = this.operation();
    if (!op || !op.transport_losses) return 0;
    return op.transport_losses
      .filter((loss: any) => loss.source === 'SALE')
      .reduce((sum: number, loss: any) => sum + Number(loss.loss_amount || 0), 0);
  });

  transportOnlyLosses = computed(() => {
    const op = this.operation();
    if (!op || !op.summary?.losses?.total_amount) return 0;
    const totalWithoutFarm = op.summary.losses.total_amount;
    return Math.max(0, totalWithoutFarm - this.saleLosses());
  });

  lossesWithFarm = computed(() => {
    const op = this.operation();
    return op?.summary?.losses?.lossesWithFarm || 0;
  });

  hasLosses = computed(() => {
    return this.saleLosses() > 0 || this.transportOnlyLosses() > 0 || this.lossesWithFarm() > 0;
  });

  ngOnInit(): void {
    this.operationId.set(+this.route.snapshot.params['id']);
    this.loadOperation();
  }

  loadOperation() {
    this.loading.set(true);
    this.operationService.getOperation(this.operationId()).subscribe({
      next: (res: any) => {
        this.operation.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.snackBar.open('فشل تحميل ملخص اليوم', 'حسناً', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }
}
