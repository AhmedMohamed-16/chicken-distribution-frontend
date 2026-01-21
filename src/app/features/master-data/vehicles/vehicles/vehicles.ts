import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { VehicleService } from '../../../../core/services/vehicle.service';
import { Vehicle } from '../../../../core/models';
 import { FormDialog } from '../form-dialog/form-dialog';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialog } from '../../../../shared/components/confirmation-dialog/confirmation-dialog/confirmation-dialog';

@Component({
  selector: 'app-vehicles',
  imports: [CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule
],
  templateUrl: './vehicles.html',
  styleUrl: './vehicles.css',
})
export class Vehicles implements OnInit {
  private vehicleService = inject(VehicleService);
  private snackBar = inject(MatSnackBar);
private dialog = inject(MatDialog);

  vehicles = signal<Vehicle[]>([]);
  loading = signal(false);
  displayedColumns = ['name', 'plate_number', 'purchase_price', 'empty_weight', 'actions'];

  ngOnInit(): void {
    this.loadVehicles();
  }

  loadVehicles(): void {
    this.loading.set(true);
    this.vehicleService.getAll().subscribe({
      next: (data:any) => {
        this.vehicles.set(data.data);
        this.loading.set(false);
      },
      error: () => {
        this.snackBar.open('فشل تحميل المركبات', 'حسناً', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  addVehicle(): void {
  const dialogRef = this.dialog.open(FormDialog, {
    width: '600px',
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.vehicleService.create(result).subscribe({
        next: () => {
          this.snackBar.open('تم إضافة المركبة بنجاح', 'حسناً', { duration: 3000 });
          this.loadVehicles();
        },
        error: () => {
          this.snackBar.open('فشل إضافة المركبة', 'حسناً', { duration: 3000 });
        }
      });
    }
  });
}

  edit(vehicle: Vehicle): void {
  const dialogRef = this.dialog.open( FormDialog, {
    width: '600px',
    data: vehicle
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.vehicleService.update(vehicle.id, result).subscribe({
        next: () => {
          this.snackBar.open('تم تحديث المركبة بنجاح', 'حسناً', { duration: 3000 });
          this.loadVehicles();
        },
        error: () => {
          this.snackBar.open('فشل تحديث المركبة', 'حسناً', { duration: 3000 });
        }
      });
    }
  });
}

 delete(vehicle: Vehicle): void {
  const dialogRef = this.dialog.open(ConfirmationDialog, {
    data: {
      title: 'حذف مركبة',
      message: `هل أنت متأكد من حذف المركبة "${vehicle.name}"؟`,
      confirmText: 'حذف',
      type: 'danger'
    }
  });

  dialogRef.afterClosed().subscribe((confirmed) => {
    if (confirmed) {
      this.vehicleService.delete(vehicle.id).subscribe({
        next: () => {
          this.snackBar.open('تم حذف المركبة بنجاح', 'حسناً', {
            duration: 3000
          });
          this.loadVehicles();
        },
        error: () => {
          this.snackBar.open('فشل حذف المركبة', 'حسناً', {
            duration: 3000
          });
        }
      });
    }
  });
}

}


