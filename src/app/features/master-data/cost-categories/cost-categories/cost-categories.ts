import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CostCategoryService } from '../../../../core/services/cost-category.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialog } from '../../../../shared/components/confirmation-dialog/confirmation-dialog/confirmation-dialog';
import { FormDialog } from '../form-dialog/form-dialog';

@Component({
  selector: 'app-cost-categories',
  imports: [CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule
],
  templateUrl: './cost-categories.html',
  styleUrl: './cost-categories.css',
})
export class CostCategories implements OnInit {
  private snackBar = inject(MatSnackBar);
private costCategoryService = inject(CostCategoryService);
private dialog = inject(MatDialog);

  categories = signal<any[]>([]);
  loading = signal(false);
  displayedColumns = ['name', 'description', 'is_vehicle_cost', 'actions'];

ngOnInit(): void {
  this.loadCategories();
}
loadCategories(): void {
  this.loading.set(true);

  this.costCategoryService.getAll().subscribe({
    next: (res: any) => {
      // supports API returning { data: [] } or []
      this.categories.set(res?.data ?? res);
      this.loading.set(false);
    },
    error: () => {
      this.loading.set(false);
      this.snackBar.open('فشل تحميل فئات التكاليف', 'حسناً', {
        duration: 3000,
      });
    },
  });
}
delete(cat: any): void {
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
      next: () => {
        this.snackBar.open('تم حذف فئة التكلفة بنجاح', 'حسناً', {
          duration: 3000,
        });

        // تحديث الجدول بدون إعادة تحميل
        this.categories.update(list =>
          list.filter(c => c.id !== cat.id)
        );
      },
      error: () => {
        this.snackBar.open('فشل حذف فئة التكلفة', 'حسناً', {
          duration: 3000,
        });
      },
    });
  });
}

edit(cat: any): void {
  const dialogRef = this.dialog.open(FormDialog, {
    width: '500px',
    data: cat, // تعديل
  });

  dialogRef.afterClosed().subscribe((result) => {
    if (!result) return;

    this.costCategoryService.update(cat.id, result).subscribe({
      next: () => {
        this.snackBar.open('تم تعديل فئة التكلفة بنجاح', 'حسناً', {
          duration: 3000,
        });
        this.loadCategories();
      },
      error: () => {
        this.snackBar.open('فشل تعديل فئة التكلفة', 'حسناً', {
          duration: 3000,
        });
      },
    });
  });
}

add(): void {
  const dialogRef = this.dialog.open(FormDialog, {
    width: '500px',
    data: null, // إضافة جديدة
  });

  dialogRef.afterClosed().subscribe((result) => {
    if (!result) return;

    this.costCategoryService.create(result).subscribe({
      next: () => {
        this.snackBar.open('تمت إضافة فئة التكلفة بنجاح', 'حسناً', {
          duration: 3000,
        });
        this.loadCategories();
      },
      error: () => {
        this.snackBar.open('فشل إضافة فئة التكلفة', 'حسناً', {
          duration: 3000,
        });
      },
    });
  });
}


}
