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
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { ReportUtilitiesService } from '../../../../core/services/ReportUtilitiesService';

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
    MatProgressSpinnerModule,
    MatChipsModule,
    MatIconModule

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

  // startDayForm = this.fb.nonNullable.group({
  //   operation_date: [new Date(), Validators.required],
  //   vehicle_id: [null as number | null, Validators.required]
  // });


private utils = inject(ReportUtilitiesService);
 formatNumber = (num: number | undefined | null |string, decimals?: number) => this.utils.formatNumber(num, decimals);



  // ✅ Track selected vehicle IDs
  selectedVehicleIds = signal<number[]>([]);

  startForm = this.fb.group({
    operation_date: [new Date(), Validators.required],
    vehicle_ids: [[] as number[], [Validators.required, Validators.minLength(1)]]
  });

  ngOnInit(): void {
    this.loadVehicles();
    // ✅ Track vehicle selection changes
    this.startForm.get('vehicle_ids')?.valueChanges.subscribe(ids => {
      this.selectedVehicleIds.set(ids || []);
    });

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

  // onSubmit(): void {
  //   if (this.startDayForm.invalid) return;

  //   this.submitting.set(true);
  //   const formValue = this.startDayForm.getRawValue();
  //   const payload = {
  //     operation_date: this.formatDate(formValue.operation_date!),
  //     vehicle_id: formValue.vehicle_id!
  //   };

  //   this.operationService.startDay(payload).subscribe({

  //     next: (response:any) => {
  //       const operation: DailyOperation = response.data;
  //       if(response.alreadyExists)
  //       this.snackBar.open('تم استكمال اليوم ', 'حسناً', { duration: 3000 });
  //       else
  //       this.snackBar.open('تم بدء واستكمال اليوم بنجاح', 'حسناً', { duration: 3000 });
  //     console.log(operation)
  //       this.router.navigate(['/operations/daily', operation.id]);
  //     },
  //     error: (error:HttpErrorResponse) => {
  //       this.submitting.set(false);
  //       this.snackBar.open(
  //         error.error?.message || 'فشل بدء واستكمال اليوم',
  //         'حسناً',
  //         { duration: 3000 }
  //       );
  //     }
  //   });
  // }
  onSubmit() {
    if (!this.startForm.valid) return;
    this.submitting.set(true);
    this.loading.set(true);

    const data = {
      operation_date: this.formatDate(this.startForm.value.operation_date!),
      vehicle_ids: this.startForm.value.vehicle_ids!
    };

    this.operationService.startDay(data).subscribe({
      next: (response:any) => {

        const operation: any = response.data;
        console.log("data",response)
        if(response?.vehicleResults){
       if(response.vehicleResults[0].OperationAlreadyExists)
        {this.snackBar.open('تم بدء الرحله واستكمال اليوم', 'حسناً', { duration: 3000 });
        }
        else if(response.vehicleResults[0].vehicleAlreadyExists)
        {this.snackBar.open('تم استكمال الرحله واستكمال اليوم', 'حسناً', { duration: 3000 });
        }

        }

        else
        this.snackBar.open('تم بدء رحله التوزيع و بدء اليوم بنجاح', 'حسناً', { duration: 3000 });
        this.router.navigate(['/operations/daily', operation.id]);
      },
      error: (error:HttpErrorResponse) => {
        this.loading.set(false);
        this.snackBar.open( error.error?.message ||'فشل بدء رحله', 'حسناً', { duration: 3000 });
        console.error(error.error?.message);
      }
    });
  }
  cancel(): void {
    console.log("DWq,ld");

    this.router.navigate(['/dashboard']);
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getVehicleName(id: number): string {
    return this.vehicles().find(v => v.id === id)?.name || '';
  }

  removeVehicle(vehicleId: number) {
    const current = this.startForm.value.vehicle_ids || [];
    const updated = current.filter(id => id !== vehicleId);
    this.startForm.patchValue({ vehicle_ids: updated });
  }



}
