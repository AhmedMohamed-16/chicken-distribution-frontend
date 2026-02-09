// import { Component, OnInit, inject, signal } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
// import { MatTableModule } from '@angular/material/table';
// import { MatButtonModule } from '@angular/material/button';
// import { MatIconModule } from '@angular/material/icon';
// import { MatCardModule } from '@angular/material/card';
// import { MatDialog, MatDialogModule } from '@angular/material/dialog';
// import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatCheckboxModule } from '@angular/material/checkbox';
// import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
// import { PartnerService } from '../../../../core/services/partner.service';
// import { Partner } from '../../../../core/models';
// import { FormDialog } from '../form-dialog/form-dialog';
// import { ConfirmationDialog } from '../../../../shared/components/confirmation-dialog/confirmation-dialog/confirmation-dialog';


// @Component({
//   selector: 'app-partners',
//   imports: [
//      CommonModule,
//     MatTableModule,
//     MatButtonModule,
//     MatIconModule,
//     MatCardModule,
//     MatSnackBarModule,
//     MatProgressSpinnerModule

// ],
//   templateUrl: './partners.html',
//   styleUrl: './partners.css',
// })
// export class Partners implements OnInit {
//   private partnerService = inject(PartnerService);
//   private dialog = inject(MatDialog);
//   private snackBar = inject(MatSnackBar);

//   partners = signal<Partner[]>([]);
//   loading = signal(false);

//   displayedColumns = [
//     'name',
//     'phone',
//     'investment_amount',
//     'investment_percentage',
//     'is_vehicle_partner',
//     'actions'
//   ];

//   ngOnInit(): void {
//     this.loadPartners();
//   }

//   loadPartners(): void {
//     this.loading.set(true);
//     this.partnerService.getAll().subscribe({
//       next: (data:any) => {
//         this.partners.set(data.data);
//         this.loading.set(false);
//       },
//       error: () => {
//         this.snackBar.open('فشل تحميل الشركاء', 'حسناً', { duration: 3000 });
//         this.loading.set(false);
//       }
//     });
//   }

//   openAddDialog(): void {
//     const dialogRef = this.dialog.open(FormDialog, {
//       width: '600px'
//     });

//     dialogRef.afterClosed().subscribe((result) => {
//       if (result) {
//         this.partnerService.create(result).subscribe({
//           next: () => {
//             this.snackBar.open('تم إضافة الشريك بنجاح', 'حسناً', { duration: 3000 });
//             this.loadPartners();
//           },
//           error: () => {
//             this.snackBar.open('فشل إضافة الشريك', 'حسناً', { duration: 3000 });
//           }
//         });
//       }
//     });
//   }

//   openEditDialog(partner: Partner): void {
//     const dialogRef = this.dialog.open(FormDialog, {
//       width: '600px',
//       data: partner
//     });

//     dialogRef.afterClosed().subscribe((result) => {
//       if (result) {
//         this.partnerService.update(partner.id, result).subscribe({
//           next: () => {
//             this.snackBar.open('تم تحديث الشريك بنجاح', 'حسناً', { duration: 3000 });
//             this.loadPartners();
//           },
//           error: () => {
//             this.snackBar.open('فشل تحديث الشريك', 'حسناً', { duration: 3000 });
//           }
//         });
//       }
//     });
//   }

//   deletePartner(partner: Partner): void {
//     const dialogRef = this.dialog.open(ConfirmationDialog, {
//       data: {
//         title: 'حذف شريك',
//         message: `هل أنت متأكد من حذف الشريك "${partner.name}"؟`,
//         confirmText: 'حذف',
//         type: 'danger'
//       }
//     });

//     dialogRef.afterClosed().subscribe((confirmed) => {
//       if (confirmed) {
//         this.partnerService.delete(partner.id).subscribe({
//           next: () => {
//             this.snackBar.open('تم حذف الشريك بنجاح', 'حسناً', { duration: 3000 });
//             this.loadPartners();
//           },
//           error: () => {
//             this.snackBar.open('فشل حذف الشريك', 'حسناً', { duration: 3000 });
//           }
//         });
//       }
//     });
//   }
// }
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
import { MatTooltipModule } from '@angular/material/tooltip';
import { PartnerService } from '../../../../core/services/partner.service';
import { Partner } from '../../../../core/models';
import { FormDialog } from '../form-dialog/form-dialog';
import { ConfirmationDialog } from '../../../../shared/components/confirmation-dialog/confirmation-dialog/confirmation-dialog';
import { ReportUtilitiesService } from '../../../../core/services/ReportUtilitiesService';
import { AuthService } from '../../../../core/services/auth.service';
import { PERMISSIONS } from '../../../../core/constants/Permissions.constant';

@Component({
  selector: 'app-partners',
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
    MatTooltipModule,
    MatDialogModule
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
private utils = inject(ReportUtilitiesService);
 formatCurrency = (amount: number | undefined | null) => this.utils.formatCurrency(amount);
formatNumber = (num: number | undefined | null, decimals?: number) => this.utils.formatNumber(num, decimals);
formatPercentage = (value: number | undefined | null|string, decimals?: number) => this.utils.formatPercentage(value, decimals);
formatDateTime = (date: string | Date | undefined | null) => this.utils.formatDateTime(date);
  private authService = inject(AuthService);

  displayedColumns = [
    'name',
    'phone',
    'investment_amount',
    'investment_percentage',
    'vehicle_investments',

  ];

  // Computed signal to add vehicle investment info to partners
  partnersWithVehicleInfo = computed(() => {
    return this.partners().map(partner => ({
      ...partner,
      vehicle_count: partner.vehicles?.length || 0,
      total_vehicle_investment: this.calculateTotalVehicleInvestment(partner),
      is_vehicle_partner: (partner.vehicles?.length || 0) > 0
    }));
  });

  ngOnInit(): void {
    this.loadPartners();
      if (this.authService.hasPermission(PERMISSIONS.PARTNERS.MANAGE_PARTNERS)) {
    this.displayedColumns.push('actions');
  }
  }

  loadPartners(): void {
    this.loading.set(true);
    this.partnerService.getAll().subscribe({
      next: (response: any) => {
        const partnersData = response.data || response;
        this.partners.set(Array.isArray(partnersData) ? partnersData : []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading partners:', err);
        this.snackBar.open('فشل تحميل الشركاء', 'حسناً', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  calculateTotalVehicleInvestment(partner: Partner): number {
    if (!partner.vehicles || !Array.isArray(partner.vehicles)) {
      return 0;
    }

    return partner.vehicles.reduce((sum, vehicle) => {
      const sharePercentage = vehicle.vehicle_share?.share_percentage ||
                             (vehicle as any).VehiclePartner?.share_percentage || 0;
      const vehicleValue = parseFloat(vehicle.purchase_price?.toString() || '0');
      return sum + (vehicleValue * sharePercentage / 100);
    }, 0);
  }

  getVehicleNames(partner: Partner): string {
    if (!partner.vehicles || !Array.isArray(partner.vehicles)) {
      return 'لا يوجد';
    }

    return partner.vehicles
      .map(v => `${v.name} (${this.getVehicleShare(v)}%)`)
      .join(', ');
  }

  getVehicleShare(vehicle: any): number {
    return vehicle.vehicle_share?.share_percentage ||
           vehicle.VehiclePartner?.share_percentage || 0;
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(FormDialog, {
      width: '700px',
      maxHeight: '90vh'
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.partnerService.create(result).subscribe({
          next: () => {
            this.snackBar.open('تم إضافة الشريك بنجاح', 'حسناً', { duration: 3000 });
            this.loadPartners();
          },
          error: (err) => {
            const errorMessage = err.error?.message || 'فشل إضافة الشريك';
            this.snackBar.open(errorMessage, 'حسناً', { duration: 5000 });
          }
        });
      }
    });
  }

  openEditDialog(partner: Partner): void {
    const dialogRef = this.dialog.open(FormDialog, {
      width: '700px',
      maxHeight: '90vh',
      data: partner
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.partnerService.update(partner.id, result).subscribe({
          next: () => {
            this.snackBar.open('تم تحديث الشريك بنجاح', 'حسناً', { duration: 3000 });
            this.loadPartners();
          },
          error: (err) => {
            const errorMessage = err.error?.message || 'فشل تحديث الشريك';
            this.snackBar.open(errorMessage, 'حسناً', { duration: 5000 });
          }
        });
      }
    });
  }

  deletePartner(partner: Partner): void {
    const dialogRef = this.dialog.open(ConfirmationDialog, {
      data: {
        title: 'حذف شريك',
        message: `هل أنت متأكد من حذف الشريك "${partner.name}"?`,
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
          error: (err) => {
            const errorMessage = err.error?.message || 'فشل حذف الشريك';
            this.snackBar.open(errorMessage, 'حسناً', { duration: 5000 });
          }
        });
      }
    });
  }
}
