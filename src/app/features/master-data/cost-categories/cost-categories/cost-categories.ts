// import { Component, OnInit, inject, signal } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { MatTableModule } from '@angular/material/table';
// import { MatButtonModule } from '@angular/material/button';
// import { MatIconModule } from '@angular/material/icon';
// import { MatCardModule } from '@angular/material/card';
// import { MatSnackBar } from '@angular/material/snack-bar';
// import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
// import { CostCategoryService } from '../../../../core/services/cost-category.service';
// import { MatDialog } from '@angular/material/dialog';
// import { ConfirmationDialog } from '../../../../shared/components/confirmation-dialog/confirmation-dialog/confirmation-dialog';
// import { FormDialog } from '../form-dialog/form-dialog';

// @Component({
//   selector: 'app-cost-categories',
//   imports: [CommonModule,
//     MatTableModule,
//     MatButtonModule,
//     MatIconModule,
//     MatCardModule,
//     MatProgressSpinnerModule
// ],
//   templateUrl: './cost-categories.html',
//   styleUrl: './cost-categories.css',
// })
// export class CostCategories implements OnInit {
//   private snackBar = inject(MatSnackBar);
// private costCategoryService = inject(CostCategoryService);
// private dialog = inject(MatDialog);

//   categories = signal<any[]>([]);
//   loading = signal(false);
//   displayedColumns = ['name', 'description', 'is_vehicle_cost', 'actions'];

// ngOnInit(): void {
//   this.loadCategories();
// }
// loadCategories(): void {
//   this.loading.set(true);

//   this.costCategoryService.getAll().subscribe({
//     next: (res: any) => {
//       // supports API returning { data: [] } or []
//       this.categories.set(res?.data ?? res);
//       this.loading.set(false);
//     },
//     error: () => {
//       this.loading.set(false);
//       this.snackBar.open('فشل تحميل فئات التكاليف', 'حسناً', {
//         duration: 3000,
//       });
//     },
//   });
// }
// delete(cat: any): void {
//   const dialogRef = this.dialog.open(ConfirmationDialog, {
//     data: {
//       title: 'حذف فئة تكلفة',
//       message: `هل أنت متأكد من حذف فئة التكلفة "${cat.name}"؟`,
//       confirmText: 'حذف',
//       type: 'danger',
//     },
//   });

//   dialogRef.afterClosed().subscribe((confirmed: boolean) => {
//     if (!confirmed) return;

//     this.costCategoryService.delete(cat.id).subscribe({
//       next: () => {
//         this.snackBar.open('تم حذف فئة التكلفة بنجاح', 'حسناً', {
//           duration: 3000,
//         });

//         // تحديث الجدول بدون إعادة تحميل
//         this.categories.update(list =>
//           list.filter(c => c.id !== cat.id)
//         );
//       },
//       error: () => {
//         this.snackBar.open('فشل حذف فئة التكلفة', 'حسناً', {
//           duration: 3000,
//         });
//       },
//     });
//   });
// }

// edit(cat: any): void {
//   const dialogRef = this.dialog.open(FormDialog, {
//     width: '500px',
//     data: cat, // تعديل
//   });

//   dialogRef.afterClosed().subscribe((result) => {
//     if (!result) return;

//     this.costCategoryService.update(cat.id, result).subscribe({
//       next: () => {
//         this.snackBar.open('تم تعديل فئة التكلفة بنجاح', 'حسناً', {
//           duration: 3000,
//         });
//         this.loadCategories();
//       },
//       error: () => {
//         this.snackBar.open('فشل تعديل فئة التكلفة', 'حسناً', {
//           duration: 3000,
//         });
//       },
//     });
//   });
// }

// add(): void {
//   const dialogRef = this.dialog.open(FormDialog, {
//     width: '500px',
//     data: null, // إضافة جديدة
//   });

//   dialogRef.afterClosed().subscribe((result) => {
//     if (!result) return;

//     this.costCategoryService.create(result).subscribe({
//       next: () => {
//         this.snackBar.open('تمت إضافة فئة التكلفة بنجاح', 'حسناً', {
//           duration: 3000,
//         });
//         this.loadCategories();
//       },
//       error: () => {
//         this.snackBar.open('فشل إضافة فئة التكلفة', 'حسناً', {
//           duration: 3000,
//         });
//       },
//     });
//   });
// }}
// cost-categories.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CostCategoryService } from '../../../../core/services/cost-category.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialog } from '../../../../shared/components/confirmation-dialog/confirmation-dialog/confirmation-dialog';
import { FormDialog } from '../form-dialog/form-dialog';
import { CostCategory, PaginatedResponse } from '../../../../core/models';
import { ReportUtilitiesService } from '../../../../core/services/ReportUtilitiesService';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { PERMISSIONS } from '../../../../core/constants/Permissions.constant';

@Component({
  selector: 'app-cost-categories',
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTooltipModule,FormsModule
  ],
  templateUrl: './cost-categories.html',
  styleUrl: './cost-categories.css',
})
export class CostCategories implements OnInit {
  private snackBar = inject(MatSnackBar);
  private costCategoryService = inject(CostCategoryService);
  private dialog = inject(MatDialog);

  categories = signal<CostCategory[]>([]);
  loading = signal(false);
  displayedColumns = ['name', 'description', 'is_vehicle_cost', 'usage_count'];
  private utils = inject(ReportUtilitiesService);

  formatNumber = (num: number | undefined | null, decimals?: number) => this.utils.formatNumber(num, decimals);


    readonly Math = Math;
   currentPage = signal(1);
  pageSize = signal(10);
  totalItems = signal(0);
  totalPages = signal(0);

  searchTermModel = '';
  activeFilterModel = '';
  pageSizeModel = 10;
  private searchTimeout?: ReturnType<typeof setTimeout>;
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.loadCategories();
      if (this.authService.hasPermission(PERMISSIONS.COST_CATEGORIES.MANAGE_COST_CATEGORIES)) {
    this.displayedColumns.push('actions');
  }
  }

  loadCategories(): void {
    this.loading.set(true);

    const params = {
      page: this.currentPage(),
      limit: this.pageSize(),
      search: this.searchTermModel || undefined,
      type_cost: this.activeFilterModel === 'true' ? 'vehicle' : this.activeFilterModel === 'false' ? 'public' : ''
    };
    this.costCategoryService.getPaginationAll(params).subscribe({
      next: (response:PaginatedResponse<CostCategory>) => {
        if (response.success) {
          const data = Array.isArray(response.data) ? response.data : [response.data];


          this.categories.set(response.data.items);
          this.totalItems.set(response.data.pagination.total || 0);
          this.totalPages.set(response.data.pagination.total_pages || 0);


        }
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        const message = error.error?.message || 'فشل تحميل فئات التكاليف';
        this.snackBar.open(message, 'حسناً', { duration: 3000 });
      },
    });
  }
onSearchChange(value: string): void {
    // Debounce search
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      this.currentPage.set(1);
      this.loadCategories();
    }, 500);
  }

  onFilterChange(): void {
    this.currentPage.set(1);
    this.loadCategories();
  }

  onPageSizeChange(): void {
    this.pageSize.set(this.pageSizeModel);
    this.currentPage.set(1);
    this.loadCategories();
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
      this.loadCategories();
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
      this.loadCategories();
    }
  }
  delete(cat: CostCategory): void {
    const dialogRef = this.dialog.open(ConfirmationDialog, {
      data: {
        title: 'حذف فئة تكلفة',
        message: `هل أنت متأكد من حذف فئة التكلفة "${cat.name}"؟`,
        confirmText: 'حذف',
        type: 'danger',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;

      this.costCategoryService.delete(cat.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.snackBar.open(
              response.message || 'تم حذف فئة التكلفة بنجاح',
              'حسناً',
              { duration: 3000 }
            );
            this.categories.update(list => list.filter(c => c.id !== cat.id));
          }
        },
        error: (error) => {
          const message = error.error?.message || 'فشل حذف فئة التكلفة';
          this.snackBar.open(message, 'حسناً', { duration: 3000 });
        },
      });
    });
  }

  edit(cat: CostCategory): void {
    const dialogRef = this.dialog.open(FormDialog, {
      width: '500px',
      data: cat,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      this.costCategoryService.update(cat.id, result).subscribe({
        next: (response) => {
          if (response.success) {
            this.snackBar.open(
              response.message || 'تم تعديل فئة التكلفة بنجاح',
              'حسناً',
              { duration: 3000 }
            );
            this.loadCategories();
          }
        },
        error: (error) => {
          const message = error.error?.message || 'فشل تعديل فئة التكلفة';
          this.snackBar.open(message, 'حسناً', { duration: 3000 });
        },
      });
    });
  }

  add(): void {
    const dialogRef = this.dialog.open(FormDialog, {
      width: '500px',
      data: null,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      this.costCategoryService.create(result).subscribe({
        next: (response) => {
          if (response.success) {
            this.snackBar.open(
              response.message || 'تمت إضافة فئة التكلفة بنجاح',
              'حسناً',
              { duration: 3000 }
            );
            this.loadCategories();
          }
        },
        error: (error) => {
          const message = error.error?.message || 'فشل إضافة فئة التكلفة';
          this.snackBar.open(message, 'حسناً', { duration: 3000 });
        },
      });
    });
  }
}
