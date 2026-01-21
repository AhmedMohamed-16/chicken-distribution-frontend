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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PartnerService } from '../../../../core/services/partner.service';
import { Partner } from '../../../../core/models';
import { FormDialog } from '../form-dialog/form-dialog';
import { ConfirmationDialog } from '../../../../shared/components/confirmation-dialog/confirmation-dialog/confirmation-dialog';


@Component({
  selector: 'app-partners',
  imports: [
     CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule,
    MatProgressSpinnerModule

],
  templateUrl: './partners.html',
  styleUrl: './partners.css',
})
export class Partners implements OnInit {
  private partnerService = inject(PartnerService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  partners = signal<Partner[]>([]);
  loading = signal(false);

  displayedColumns = [
    'name',
    'phone',
    'investment_amount',
    'investment_percentage',
    'is_vehicle_partner',
    'actions'
  ];

  ngOnInit(): void {
    this.loadPartners();
  }

  loadPartners(): void {
    this.loading.set(true);
    this.partnerService.getAll().subscribe({
      next: (data:any) => {
        this.partners.set(data.data);
        this.loading.set(false);
      },
      error: () => {
        this.snackBar.open('فشل تحميل الشركاء', 'حسناً', { duration: 3000 });
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
        this.partnerService.create(result).subscribe({
          next: () => {
            this.snackBar.open('تم إضافة الشريك بنجاح', 'حسناً', { duration: 3000 });
            this.loadPartners();
          },
          error: () => {
            this.snackBar.open('فشل إضافة الشريك', 'حسناً', { duration: 3000 });
          }
        });
      }
    });
  }

  openEditDialog(partner: Partner): void {
    const dialogRef = this.dialog.open(FormDialog, {
      width: '600px',
      data: partner
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.partnerService.update(partner.id, result).subscribe({
          next: () => {
            this.snackBar.open('تم تحديث الشريك بنجاح', 'حسناً', { duration: 3000 });
            this.loadPartners();
          },
          error: () => {
            this.snackBar.open('فشل تحديث الشريك', 'حسناً', { duration: 3000 });
          }
        });
      }
    });
  }

  deletePartner(partner: Partner): void {
    const dialogRef = this.dialog.open(ConfirmationDialog, {
      data: {
        title: 'حذف شريك',
        message: `هل أنت متأكد من حذف الشريك "${partner.name}"؟`,
        confirmText: 'حذف',
        type: 'danger'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.partnerService.delete(partner.id).subscribe({
          next: () => {
            this.snackBar.open('تم حذف الشريك بنجاح', 'حسناً', { duration: 3000 });
            this.loadPartners();
          },
          error: () => {
            this.snackBar.open('فشل حذف الشريك', 'حسناً', { duration: 3000 });
          }
        });
      }
    });
  }
}
