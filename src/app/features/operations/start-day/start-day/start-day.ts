import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { OperationService } from '../../../../core/services/operation.service';
import { VehicleService } from '../../../../core/services/vehicle.service';
import { Vehicle,DailyOperation } from '../../../../core/models';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-start-day',
  imports: [
        CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatProgressSpinnerModule

  ],
  templateUrl: './start-day.html',
  styleUrl: './start-day.css',
})
export class StartDay implements OnInit{
 private fb = inject(FormBuilder);
  private operationService:OperationService = inject(OperationService);
  private vehicleService:VehicleService = inject(VehicleService);
  private router = inject(Router);
  private snackBar:MatSnackBar = inject(MatSnackBar);

  loading = signal(false);
  submitting = signal(false);
  vehicles = signal<Vehicle[]>([]);
  maxDate = new Date();

  startDayForm = this.fb.nonNullable.group({
    operation_date: [new Date(), Validators.required],
    vehicle_id: [null as number | null, Validators.required]
  });

  ngOnInit(): void {
    this.loadVehicles();
  }

  loadVehicles(): void {
    this.loading.set(true);
    this.vehicleService.getAll().subscribe({
      next: (data:any) => {
        console.log("data",data.data)
        this.vehicles.set(data.data);
        console.log("this.vehicles",this.vehicles)
        this.loading.set(false);
      },
      error: (error:any) => {
        this.snackBar.open('فشل تحميل المركبات', 'حسناً', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.startDayForm.invalid) return;

    this.submitting.set(true);
    const formValue = this.startDayForm.getRawValue();
    const payload = {
      operation_date: this.formatDate(formValue.operation_date!),
      vehicle_id: formValue.vehicle_id!
    };

    this.operationService.startDay(payload).subscribe({

      next: (response:any) => {
        const operation: DailyOperation = response.data;
        if(response.alreadyExists)
        this.snackBar.open('تم استكمال اليوم ', 'حسناً', { duration: 3000 });
        else
        this.snackBar.open('تم بدء واستكمال اليوم بنجاح', 'حسناً', { duration: 3000 });
      console.log(operation)
        this.router.navigate(['/operations/daily', operation.id]);
      },
      error: (error:HttpErrorResponse) => {
        this.submitting.set(false);
        this.snackBar.open(
          error.error?.message || 'فشل بدء واستكمال اليوم',
          'حسناً',
          { duration: 3000 }
        );
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/dashboard']);
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
