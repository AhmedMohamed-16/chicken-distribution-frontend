import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ChickenTypeService } from '../../../../core/services/chicken-type.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialog } from '../../../../shared/components/confirmation-dialog/confirmation-dialog/confirmation-dialog';
import { FormDialog } from '../form-dialog/form-dialog';
import { AuthService } from '../../../../core/services/auth.service';
import { PERMISSIONS } from '../../../../core/constants/Permissions.constant';

@Component({
  selector: 'app-chicken-types',
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatCardModule, MatProgressSpinnerModule],
  templateUrl: './chicken-types.html',
  styleUrl: './chicken-types.css',
})
export class ChickenTypes implements OnInit {
  private snackBar = inject(MatSnackBar);
  private service = inject(ChickenTypeService);
  private dialog = inject(MatDialog);
  private authService = inject(AuthService);

  types = signal<any[]>([]);
  loading = signal(false);
  displayedColumns = ['name', 'description'];

  ngOnInit(): void {
    this.loadTypes();
    console.log("this.authService.hasPermission(PERMISSIONS.CHICKEN_TYPES.MANAGE_CHICKEN_TYPES)",this.authService.hasPermission(PERMISSIONS.CHICKEN_TYPES.MANAGE_CHICKEN_TYPES));

      if (this.authService.hasPermission(PERMISSIONS.CHICKEN_TYPES.MANAGE_CHICKEN_TYPES)) {
        this.displayedColumns.push('actions');
      }
  }

  loadTypes(): void {
    this.loading.set(true);
    this.service.getAll().subscribe({
      next: (res: any) => {
        this.types.set(res?.data ?? res);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('فشل تحميل أنواع الدواجن', 'حسناً', { duration: 3000 });
      }
    });
  }

  add(): void {
    const dialogRef = this.dialog.open(FormDialog, { width: '500px', data: null });
    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;
      this.service.create(result).subscribe({
        next: () => { this.snackBar.open('تمت إضافة النوع بنجاح', 'حسناً', { duration: 3000 }); this.loadTypes(); },
        error: () => this.snackBar.open('فشل إضافة النوع', 'حسناً', { duration: 3000 })
      });
    });
  }

  edit(type: any): void {
    const dialogRef = this.dialog.open(FormDialog, { width: '500px', data: type });
    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;
      this.service.update(type.id, result).subscribe({
        next: () => { this.snackBar.open('تم تعديل النوع بنجاح', 'حسناً', { duration: 3000 }); this.loadTypes(); },
        error: () => this.snackBar.open('فشل تعديل النوع', 'حسناً', { duration: 3000 })
      });
    });
  }

  delete(type: any): void {
    const dialogRef = this.dialog.open(ConfirmationDialog, {
      data: { title: 'حذف نوع', message: `هل أنت متأكد من حذف النوع "${type.name}"؟`, confirmText: 'حذف', type: 'danger' }
    });
    dialogRef.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.service.delete(type.id).subscribe({
        next: () => { this.snackBar.open('تم حذف النوع بنجاح', 'حسناً', { duration: 3000 }); this.types.update(list => list.filter(t => t.id !== type.id)); },
        error: () => this.snackBar.open('فشل حذف النوع', 'حسناً', { duration: 3000 })
      });
    });
  }
}
