import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { ApiResponse, Buyer, PaginatedResponse } from '../../../../core/models';
import { ConfirmationDialog } from '../../../../shared/components/confirmation-dialog/confirmation-dialog/confirmation-dialog';
import { FormDialog } from '../form-dialog/form-dialog';
import { DebtHistoryDialog } from '../../shared/debt-history-dialog/debt-history-dialog';
import { ReportUtilitiesService } from '../../../../core/services/ReportUtilitiesService';
import { PERMISSIONS } from '../../../../core/constants/Permissions.constant';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-buyers',
  imports: [CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    FormsModule
],
  templateUrl: './buyers.html',
  styleUrl: './buyers.css',
})
export class Buyers implements OnInit {
  private buyerService = inject(BuyerService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  readonly Math = Math;

  buyers = signal<Buyer[]>([]);
  loading = signal(false);
 PERMISSIONS = PERMISSIONS;
 displayedColumns: string[] = ['name', 'phone', 'address', 'total_debt'];


  private utils = inject(ReportUtilitiesService);
 formatCurrency = (amount: number | undefined | null) => this.utils.formatCurrency(amount);
formatNumber = (num: number | undefined | null, decimals?: number) => this.utils.formatNumber(num, decimals);
formatPercentage = (value: number | undefined | null, decimals?: number) => this.utils.formatPercentage(value, decimals);
formatDateTime = (date: string | Date | undefined | null) => this.utils.formatDateTime(date);
currentPage = signal(1);
  pageSize = signal(10);
  totalBuyers = signal(0);
  totalPages = signal(0);
   searchTermModel = '';
 debtFilterModel = ''; // قيمة الفلتر الجديدة

  pageSizeModel = 10;
  private searchTimeout?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    this.loadBuyers();
      if (this.authService.hasPermission(PERMISSIONS.BUYERS.MANAGE_BUYERS)) {
    this.displayedColumns.push('actions');
  }
  }

  loadBuyers(): void {

    const params: any = {
      page: this.currentPage(),
      limit: this.pageSize(),
      search: this.searchTermModel || undefined,
        has_debt: this.debtFilterModel ? (this.debtFilterModel === 'with_debt' ? 'true' : 'false') : ''
     };


    this.loading.set(true);
    this.buyerService.getPaginationAll(params).subscribe({
      next: (res:PaginatedResponse<Buyer>) => {
        this.buyers.set(res.data.items);
        this.loading.set(false);
                  this.totalBuyers.set(res.data.pagination.total);
          this.totalPages.set(res.data.pagination.total_pages);
console.log("totalPages",this.totalPages());
console.log("totalBuyers",this.totalBuyers());

      },
      error: () => {
        this.snackBar.open('فشل تحميل محلات الفراخ', 'حسناً', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  onSearchChange(value: any): void {
    // Debounce search
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      this.currentPage.set(1);
      this.loadBuyers();
    }, 500);
  }

 onDebtFilterChange(): void {
  this.currentPage.set(1);
  this.loadBuyers();
}


  onPageSizeChange(): void {
    this.pageSize.set(this.pageSizeModel);
    this.currentPage.set(1);
    this.loadBuyers();
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
      this.loadBuyers();
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
      this.loadBuyers();
    }
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
