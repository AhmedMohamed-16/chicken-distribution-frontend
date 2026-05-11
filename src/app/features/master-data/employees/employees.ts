import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../../core/services/employee.service';
import { Employee, ApiResponse } from '../../../core/models';
import { EmployeeDialog } from './employee-dialog/employee-dialog';
import { ConfirmationDialog } from '../../../shared/components/confirmation-dialog/confirmation-dialog/confirmation-dialog';
import { AuthService } from '../../../core/services/auth.service';
import { PERMISSIONS } from '../../../core/constants/Permissions.constant';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDialogModule,
    FormsModule
  ],
  templateUrl: './employees.html',
  styleUrl: './employees.css',
})
export class Employees implements OnInit {
  private employeeService = inject(EmployeeService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private authService = inject(AuthService);

  employees = signal<Employee[]>([]);
  isLoading = signal(false);
  searchTerm = signal('');

  // Client-side filtering
  filteredEmployees = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.employees().filter(e => 
      e.name.toLowerCase().includes(term) || 
      (e.role && e.role.toLowerCase().includes(term))
    );
  });

  displayedColumns = ['name', 'phone', 'role', 'status'];
  canManage = false;

  ngOnInit(): void {
    this.canManage = this.authService.hasPermission(PERMISSIONS.EMPLOYEES.MANAGE_EMPLOYEES);
    if (this.canManage) {
      this.displayedColumns.push('actions');
    }
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.isLoading.set(true);
    this.employeeService.getAll().subscribe({
      next: (res: ApiResponse<Employee[]>) => {
        this.employees.set(res.data);
        this.isLoading.set(false);
      },
      error: () => {
        this.snackBar.open('فشل تحميل بيانات الموظفين', 'حسناً', { duration: 3000 });
        this.isLoading.set(false);
      }
    });
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(EmployeeDialog, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.employeeService.create(result).subscribe({
          next: (res: ApiResponse<Employee>) => {
            this.snackBar.open('تم إضافة الموظف بنجاح', 'حسناً', { duration: 3000 });
            this.employees.update(list => [...list, res.data]);
          },
          error: (err: any) => {
            this.snackBar.open(err.error?.message || 'فشل إضافة الموظف', 'حسناً', { duration: 3000 });
          }
        });
      }
    });
  }

  openEditDialog(employee: Employee): void {
    const dialogRef = this.dialog.open(EmployeeDialog, {
      width: '500px',
      data: employee
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.employeeService.update(employee.id, result).subscribe({
          next: (res: ApiResponse<Employee>) => {
            this.snackBar.open('تم تحديث بيانات الموظف بنجاح', 'حسناً', { duration: 3000 });
            this.employees.update(list => list.map(e => e.id === employee.id ? res.data : e));
          },
          error: (err: any) => {
            this.snackBar.open(err.error?.message || 'فشل تحديث بيانات الموظف', 'حسناً', { duration: 3000 });
          }
        });
      }
    });
  }

  deactivateEmployee(employee: Employee): void {
    const dialogRef = this.dialog.open(ConfirmationDialog, {
      data: {
        title: 'تعطيل حساب موظف',
        message: `هل أنت متأكد من تعطيل حساب الموظف "${employee.name}"؟`,
        confirmText: 'تعطيل',
        type: 'danger'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.employeeService.deactivate(employee.id).subscribe({
          next: () => {
            this.snackBar.open('تم تعطيل حساب الموظف بنجاح', 'حسناً', { duration: 3000 });
            this.employees.update(list => list.map(e => e.id === employee.id ? { ...e, is_active: false } : e));
          },
          error: () => {
             this.snackBar.open('فشل تعطيل حساب الموظف', 'حسناً', { duration: 3000 });
          }
        });
      }
    });
  }
}
