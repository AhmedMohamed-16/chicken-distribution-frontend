import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { OperationService } from '../../../../core/services/operation.service';
import { ProfitDistribution } from '../../../../core/models';
import { ConfirmationDialog } from '../../../../shared/components/confirmation-dialog/confirmation-dialog/confirmation-dialog';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-close-day',
  imports: [CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatDividerModule
],
  templateUrl: './close-day.html',
  styleUrl: './close-day.css',
})
export class CloseDay implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private operationService = inject(OperationService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  loading = signal(false);
  profitData = signal<ProfitDistribution | null>(null);
  operationId = signal<number>(0);
  status = signal<'CLOSED' | 'OPEN'>('OPEN');

  displayedColumns = ['partner', 'base_share', 'vehicle_cost', 'final_profit'];

  ngOnInit(): void {
    this.operationId.set(+this.route.snapshot.params['id']);
      this.operationService.getOperation(this.operationId()).subscribe({
    next: (response: any) => {
      const operation = response.data;

      this.status.set(operation.status);
      this.profitData.set(operation.profit_distribution ?? null);
    },
    error: () => {
      this.snackBar.open('فشل تحميل العملية', 'حسناً', { duration: 3000 });
    }
  });

   }

  closeDay(): void {
    const dialogRef = this.dialog.open(ConfirmationDialog , {
      data: {
        title: 'إغلاق اليوم',
        message: 'هل أنت متأكد من إغلاق اليوم؟ لن تتمكن من إضافة معاملات جديدة بعد الإغلاق.',
        confirmText: 'إغلاق',
        type: 'warning'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.performCloseDay();
      }
    });
  }

  performCloseDay(): void {
    this.loading.set(true);
    this.operationService.closeDay(this.operationId()).subscribe({
      next: (response:any) => {

        this.profitData.set(response.data);
        this.loading.set(false);
        this.status.set('CLOSED');
        this.snackBar.open('تم إغلاق اليوم بنجاح', 'حسناً', { duration: 3000 });
      },
      error: (err:HttpErrorResponse) => {
        this.loading.set(false);
        this.snackBar.open('فشل إغلاق اليوم', 'حسناً', { duration: 3000 });
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/operations/daily', this.operationId()]);
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}

