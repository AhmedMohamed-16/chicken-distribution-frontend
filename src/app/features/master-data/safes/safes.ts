import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SafeService } from '../../../core/services/safe.service';
import { Safe, SafeDashboard, SafeType, ApiResponse } from '../../../core/models';
import { effect } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ReportUtilitiesService } from '../../../core/services/ReportUtilitiesService';
import { Observable } from 'rxjs';
import { SafeFormDialog } from './safe-form-dialog/safe-form-dialog';
import { SafeLedgerDialog } from './safe-ledger-dialog/safe-ledger-dialog';
import { SafeTransferDialog } from './safe-transfer-dialog/safe-transfer-dialog';
import { AuthService } from '../../../core/services/auth.service';
import { PERMISSIONS } from '../../../core/constants/Permissions.constant';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatBadgeModule } from '@angular/material/badge';

@Component({
  selector: 'app-safes',
  standalone: true,
imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatBadgeModule
  ],
  templateUrl: './safes.html',
  styleUrl: './safes.css',
})
export class Safes implements OnInit {
  private safeService = inject(SafeService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);
  private utils = inject(ReportUtilitiesService);
  private authService = inject(AuthService);

safes = signal<SafeDashboard[]>([]);
  showInactiveControl = this.fb.control(false);

  isLoading = signal(false);
  isAdmin = false;

 ngOnInit(): void {
  console.log("Safes");

  this.isAdmin = this.authService.hasPermission(PERMISSIONS.SYSTEM.APPLICATION_ADMIN);

  // React to toggle changes, including toggling OFF
  this.showInactiveControl.valueChanges.subscribe(() => {
    this.loadSafes();
  });

  this.loadSafes();
}



  loadAllSafes(): Observable<ApiResponse<SafeDashboard[]>> {
    return this.safeService.getDashboard();
  }

loadSafes(): void {
  this.isLoading.set(true);
  const includeInactive = this.showInactiveControl.value ?? false;

  this.safeService.getDashboard(includeInactive).subscribe({
    next: (res: ApiResponse<SafeDashboard[]>) => {
      console.log("res.data",res );

      this.safes.set(res.data);
      this.isLoading.set(false);
    },
    error: () => {
      this.snackBar.open('فشل تحميل بيانات الخزن', 'حسناً', { duration: 3000 });
      this.isLoading.set(false);
    }
  });
}
  toggleInactive(): void {
    this.loadSafes();
  }

  loadDashboard(): void {
    // Keep for dashboard data if needed
    this.safeService.getDashboard().subscribe({
      next: (res: ApiResponse<SafeDashboard[]>) => {
        // Dashboard data available if needed
      }
    });
  }


  getSafeIcon(type: SafeType): string {
    switch (type) {
      case 'CASH': return 'payments';
      case 'BANK': return 'account_balance';
      case 'VODAFONE_CASH': return 'phone_android';
      case 'INSTAPAY': return 'bolt';
      default: return 'help_outline';
    }
  }

  getSafeTypeName(type: SafeType): string {
    switch (type) {
      case 'CASH': return 'نقدي';
      case 'BANK': return 'بنك';
      case 'VODAFONE_CASH': return 'فودافون كاش';
      case 'INSTAPAY': return 'انستاباي';
      default: return type;
    }
  }

  getBalanceColorClass(balance: number): string {
    if (balance > 0) return 'balance-positive';
    if (balance < 0) return 'balance-negative';
    return 'balance-zero';
  }

  formatCurrency(amount: number): string {
    return this.utils.formatCurrency(amount);
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(SafeFormDialog, { width: '500px' });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.safeService.create(result).subscribe({
          next: () => {
            this.snackBar.open('تم إضافة الخزنة بنجاح', 'حسناً', { duration: 3000 });
            this.loadSafes();
          },
          error: (err) => this.snackBar.open(err.error?.message || 'فشل إضافة الخزنة', 'حسناً', { duration: 3000 })
        });
      }
    });
  }

  openEditDialog(safe: Safe): void {

    const dialogRef = this.dialog.open(SafeFormDialog, { width: '500px', data: safe });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
         this.safeService.update(safe.id, result).subscribe({
          next: () => {
            this.snackBar.open('تم تحديث الخزنة بنجاح', 'حسناً', { duration: 3000 });
            this.loadSafes();
          },
          error: (err) => this.snackBar.open(err.error?.message || 'فشل تحديث الخزنة', 'حسناً', { duration: 3000 })
        });
      }
    });
  }


  openLedger(safe: SafeDashboard): void {
    this.dialog.open(SafeLedgerDialog, {
      width: '1000px',
      data: safe
    });
  }

  openTransfer(): void {
    const activeSafes = this.safes().filter(s => s.is_active);
    const dialogRef = this.dialog.open(SafeTransferDialog, {
      width: '500px',
      data: { safes: activeSafes }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.safeService.createTransfer(result).subscribe({
          next: () => {
            this.snackBar.open('تم تحويل المبلغ بنجاح', 'حسناً', { duration: 3000 });
            this.loadSafes();
          },
          error: (err) => this.snackBar.open(err.error?.message || 'فشل عملية التحويل', 'حسناً', { duration: 3000 })
        });
      }
    });
  }
}
