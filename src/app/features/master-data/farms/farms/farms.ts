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
import { Farm, PaginatedResponse } from '../../../../core/models';
import { FormDialog } from '../form-dialog/form-dialog';
import { ConfirmationDialog } from '../../../../shared/components/confirmation-dialog/confirmation-dialog/confirmation-dialog';
import { DebtHistoryDialog } from '../../shared/debt-history-dialog/debt-history-dialog';
import { ReportUtilitiesService } from '../../../../core/services/ReportUtilitiesService';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { PERMISSIONS } from '../../../../core/constants/Permissions.constant';

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
    MatChipsModule,FormsModule
],
  templateUrl: './farms.html',
  styleUrl: './farms.css',
})
export class Farms implements OnInit {
  private farmService = inject(FarmService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  readonly Math = Math;

  farms = signal<Farm[]>([]);
  loading = signal(false);
searchTermModel = '';
debtFilterModel = '';
pageSizeModel = 10;

currentPage = signal(1);
pageSize = signal(10);
totalFarms = signal(0);
totalPages = signal(0);


  activeFilterModel = '';

private searchTimeout?: ReturnType<typeof setTimeout>;

  displayedColumns = ['name', 'owner_name', 'phone', 'location', 'total_debt'];
private utils = inject(ReportUtilitiesService);
 formatCurrency = (amount: number | undefined | null) => this.utils.formatCurrency(amount);
formatNumber = (num: number | undefined | null, decimals?: number) => this.utils.formatNumber(num, decimals);
formatPercentage = (value: number | undefined | null, decimals?: number) => this.utils.formatPercentage(value, decimals);
formatDateTime = (date: string | Date | undefined | null) => this.utils.formatDateTime(date);
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.loadFarms();
      if (this.authService.hasPermission(PERMISSIONS.FARMS.MANAGE_FARMS)) {
    this.displayedColumns.push('actions');
  }
  }

  loadFarms(): void {
    const params: any = {
    page: this.currentPage(),
    limit: this.pageSize(),
    search: this.searchTermModel || undefined,
    has_debt: this.debtFilterModel
      ? this.debtFilterModel === 'with_debt' ? 'true' : 'false'
      : undefined
  };

    this.loading.set(true);
    this.farmService.getPaginationAll(params).subscribe({
      next: (res:PaginatedResponse<Farm>) => {
              this.farms.set(res.data.items);
              console.log("res.data.items",res.data.items);

      this.totalFarms.set(res.data.pagination.total);
      this.totalPages.set(res.data.pagination.total_pages);
      this.loading.set(false);

        this.farms.set(res.data.items);

      },
      error: () => {
        this.snackBar.open('فشل تحميل المزارع', 'حسناً', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }
  onSearchChange(value: string): void {
    // Debounce search
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      this.currentPage.set(1);
      this.loadFarms();
    }, 500);
  }

  onDebtFilterChange(): void {
    this.currentPage.set(1);
   this.loadFarms();
  }

  onPageSizeChange(): void {
    this.pageSize.set(this.pageSizeModel);
    this.currentPage.set(1);
    this.loadFarms();
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
      this.loadFarms();
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
      this.loadFarms();
    }
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
          error: (error:HttpErrorResponse) => {
            this.snackBar.open(error.error.message||'فشل إضافة المزرعة', 'حسناً', { duration: 3000 });
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
