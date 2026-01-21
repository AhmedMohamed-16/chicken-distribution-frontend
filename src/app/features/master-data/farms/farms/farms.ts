import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { FarmService } from '../../../../core/services/farm.service';
import { Farm } from '../../../../core/models';
import { FormDialog } from '../form-dialog/form-dialog';
import { ConfirmationDialog } from '../../../../shared/components/confirmation-dialog/confirmation-dialog/confirmation-dialog';
import { DebtHistoryDialog } from '../../shared/debt-history-dialog/debt-history-dialog';

@Component({
  selector: 'app-farms',
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatChipsModule
],
  templateUrl: './farms.html',
  styleUrl: './farms.css',
})
export class Farms implements OnInit {
  private farmService = inject(FarmService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  farms = signal<Farm[]>([]);
  loading = signal(false);

  displayedColumns = ['name', 'owner_name', 'phone', 'location', 'total_debt', 'actions'];

  ngOnInit(): void {
    this.loadFarms();
  }

  loadFarms(): void {
    this.loading.set(true);
    this.farmService.getAll().subscribe({
      next: (data:any) => {
        this.farms.set(data.data);
        this.loading.set(false);
      },
      error: () => {
        this.snackBar.open('فشل تحميل المزارع', 'حسناً', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(FormDialog, {
      width: '600px'
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.farmService.create(result).subscribe({
          next: () => {
            this.snackBar.open('تم إضافة المزرعة بنجاح', 'حسناً', { duration: 3000 });
            this.loadFarms();
          },
          error: () => {
            this.snackBar.open('فشل إضافة المزرعة', 'حسناً', { duration: 3000 });
          }
        });
      }
    });
  }

  openEditDialog(farm: Farm): void {
    const dialogRef = this.dialog.open(FormDialog , {
      width: '600px',
      data: farm
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.farmService.update(farm.id, result).subscribe({
          next: () => {
            this.snackBar.open('تم تحديث المزرعة بنجاح', 'حسناً', { duration: 3000 });
            this.loadFarms();
          },
          error: () => {
            this.snackBar.open('فشل تحديث المزرعة', 'حسناً', { duration: 3000 });
          }
        });
      }
    });
  }

  deleteFarm(farm: Farm): void {
    const dialogRef = this.dialog.open(ConfirmationDialog, {
      data: {
        title: 'حذف مزرعة',
        message: `هل أنت متأكد من حذف المزرعة "${farm.name}"؟`,
        confirmText: 'حذف',
        type: 'danger'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.farmService.delete(farm.id).subscribe({
          next: () => {
            this.snackBar.open('تم حذف المزرعة بنجاح', 'حسناً', { duration: 3000 });
            this.loadFarms();
          },
          error: () => {
            this.snackBar.open('فشل حذف المزرعة', 'حسناً', { duration: 3000 });
          }
        });
      }
    });
  }

 viewDebtHistory(farm: Farm): void {
  this.dialog.open(DebtHistoryDialog, {
    width: '900px',
    data: {
      id: farm.id,
      entityType: 'farm'
    }
  });
}

}
