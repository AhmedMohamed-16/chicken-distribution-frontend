import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { OperationService } from '../../../../core/services/operation.service';
import { CostCategoryService } from '../../../../core/services/cost-category.service';
import { HttpErrorResponse } from '@angular/common/http';
import { CostCategory, DailyCost, DailyOperation } from '../../../../core/models';
import { ReportUtilitiesService } from '../../../../core/services/ReportUtilitiesService';

@Component({
  selector: 'app-daily-costs',
  imports: [ CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  MatTableModule],
  templateUrl: './daily-costs.html',
  styleUrl: './daily-costs.css',
})
export class DailyCosts implements OnInit {
  // private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  // private operationService = inject(OperationService);
  private snackBar = inject(MatSnackBar);
  private costCategoryService = inject(CostCategoryService);
  loading = signal(false);

  submitting = signal(false);
  operationId = signal<number>(0);
  // categories = signal<any[]>([]);
private fb = inject(FormBuilder);
  private costService = inject(OperationService);

  operation = signal<DailyOperation | null>(null);
  costCategories = signal<CostCategory[]>([]);
  costs = signal<DailyCost[]>([]);
  selectedCategory = signal<CostCategory | null>(null);



  costForm = this.fb.nonNullable.group({
    cost_category_id: [null as number | null, Validators.required],
    amount: [0, [Validators.required, Validators.min(0)]],
    description: [''],
    vehicle_id: [null],  // Conditionally required
  });
private utils = inject(ReportUtilitiesService);
 formatNumber = (num: number | undefined | null|string, decimals?: number) => this.utils.formatNumber(num, decimals);

  ngOnInit() {
    this.operationId.set(+this.route.snapshot.params['id']);
    this.loadOperation();
    this.loadCategories();
    // ✅ Watch category changes to enforce vehicle selection
    this.costForm.get('cost_category_id')?.valueChanges.subscribe(id => {
      const category = this.costCategories().find(c => c.id === id);
      this.selectedCategory.set(category || null);

      // ✅ Make vehicle_id required for vehicle costs
      if (category?.is_vehicle_cost) {
        this.costForm.get('vehicle_id')?.setValidators([Validators.required]);
      } else {
        this.costForm.get('vehicle_id')?.clearValidators();
        this.costForm.patchValue({ vehicle_id: null });
      }

      this.costForm.get('vehicle_id')?.updateValueAndValidity();
    });
  }
  // ngOnInit(): void {
  //   this.operationId.set(+this.route.snapshot.params['id']);
  //   this.loadCategories();

  // }
  loadOperation(): void {
this.loading.set(true);
    this.costService.getOperation(this.operationId()).subscribe({
      next: (res: any) => {
        // إذا API بيرجع { data: [] } أو مصفوفة مباشرة
        this.operation.set(res?.data ?? res);
        console.log(this.operation());

        this.loading.set(false);
      },
      error: () => {
        this.snackBar.open('فشل تحميل العمليه', 'حسناً', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }
  loadCategories(): void {
    this.loading.set(true);
    this.costCategoryService.getAll().subscribe({
      next: (res: any) => {
        // إذا API بيرجع { data: [] } أو مصفوفة مباشرة
        this.costCategories.set(res?.data ?? res);
        this.loading.set(false);
      },
      error: () => {
        this.snackBar.open('فشل تحميل فئات التكاليف', 'حسناً', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  // onSubmit(): void {
  //   if (this.costForm.invalid) return;

  //   this.submitting.set(true);
  //   const payload = this.costForm.getRawValue();

  //   this.operationService.recordCost(this.operationId(), payload as any).subscribe({
  //     next: () => {
  //       this.snackBar.open('تم تسجيل التكلفة بنجاح', 'حسناً', { duration: 3000 });
  //       this.router.navigate(['/operations/daily', this.operationId()]);
  //     },
  //     error: (error:HttpErrorResponse) => {
  //       this.submitting.set(false);
  //       this.snackBar.open(error.error?.message||'فشل تسجيل التكلفة', 'حسناً', { duration: 3000 });
  //     }
  //   });
  // }

  onSubmit() {
    if (!this.costForm.valid || !this.operation()) return;
    this.submitting.set(true);
    const data = {
      cost_category_id: this.costForm.value.cost_category_id!,
      vehicle_id: this.costForm.value.vehicle_id || undefined,
      amount: this.costForm.value.amount!,
      description: this.costForm.value.description || undefined
    };

    this.costService.recordCost(this.operation()!.id, data).subscribe({
      next: (cost:any) => {
        this.snackBar.open('تم تسجيل التكلفة بنجاح', 'حسناً', { duration: 3000 });
        this.costs.update(list => [...list, cost.data]);
        this.costForm.reset();
        console.log("costs",this.costs());

         this.submitting.set(false);
      },
      error: (error:HttpErrorResponse) =>{
        this.submitting.set(false);
        console.error(error.error?.message);
        this.snackBar.open(error.error?.message||'فشل تسجيل التكلفة', 'حسناً', { duration: 3000 });

      }
    });
  }

  getVehicleName(vehicleId: number): string {
    return this.operation()?.vehicles?.find(v => v.id === vehicleId)?.name || '';
  }
  cancel(): void {
    this.router.navigate(['/operations/daily', this.operationId()]);
  }
}
