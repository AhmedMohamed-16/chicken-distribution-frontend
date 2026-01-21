import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { BuyerService } from '../../../../core/services/buyer.service';
import { Buyer } from '../../../../core/models';
import { ConfirmationDialog } from '../../../../shared/components/confirmation-dialog/confirmation-dialog/confirmation-dialog';
import { FormDialog } from '../form-dialog/form-dialog';
import { DebtHistoryDialog } from '../../shared/debt-history-dialog/debt-history-dialog';

@Component({
  selector: 'app-buyers',
  imports: [CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatChipsModule
],
  templateUrl: './buyers.html',
  styleUrl: './buyers.css',
})
export class Buyers implements OnInit {
  private buyerService = inject(BuyerService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  buyers = signal<Buyer[]>([]);
  loading = signal(false);

  displayedColumns = ['name', 'phone', 'address', 'total_debt', 'actions'];

  ngOnInit(): void {
    this.loadBuyers();
  }

  loadBuyers(): void {
    this.loading.set(true);
    this.buyerService.getAll().subscribe({
      next: (data:any) => {
        this.buyers.set(data.data);
        this.loading.set(false);
      },
      error: () => {
        this.snackBar.open('فشل تحميل المشترين', 'حسناً', { duration: 3000 });
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
        this.buyerService.create(result).subscribe({
          next: () => {
            this.snackBar.open('تم إضافة المشتري بنجاح', 'حسناً', { duration: 3000 });
            this.loadBuyers();
          },
          error: () => {
            this.snackBar.open('فشل إضافة المشتري', 'حسناً', { duration: 3000 });
          }
        });
      }
    });
  }

  openEditDialog(buyer: Buyer): void {
    console.log("buyer",buyer)
    const dialogRef = this.dialog.open(FormDialog, {
      width: '600px',
      data: buyer,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.buyerService.update(buyer.id, result).subscribe({
          next: () => {
            this.snackBar.open('تم تحديث المشتري بنجاح', 'حسناً', { duration: 3000 });
            this.loadBuyers();
          },
          error: () => {
            this.snackBar.open('فشل تحديث المشتري', 'حسناً', { duration: 3000 });
          }
        });
      }
    });
  }

  deleteBuyer(buyer: Buyer): void {
    const dialogRef = this.dialog.open(ConfirmationDialog, {
      data: {
        title: 'حذف مشتري',
        message: `هل أنت متأكد من حذف المشتري "${buyer.name}"؟`,
        confirmText: 'حذف',
        type: 'danger'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.buyerService.delete(buyer.id).subscribe({
          next: () => {
            this.snackBar.open('تم حذف المشتري بنجاح', 'حسناً', { duration: 3000 });
            this.loadBuyers();
          },
          error: () => {
            this.snackBar.open('فشل حذف المشتري', 'حسناً', { duration: 3000 });
          }
        });
      }
    });
  }

viewDebtHistory(buyer: Buyer): void {
  this.dialog.open(DebtHistoryDialog, {
    width: '900px',
    data: {
      id: buyer.id,
      entityType: 'buyer'
    }
  });
}


}
