import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { OperationService } from '../../../../core/services/operation.service';
import { FarmService } from '../../../../core/services/farm.service';
import { ChickenTypeService } from '../../../../core/services/chicken-type.service';
import { ChickenType, Farm } from '../../../../core/models';
import { toSignal } from '@angular/core/rxjs-interop';

 @Component({
  selector: 'app-farm-loading',
  imports: [   CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDividerModule],
  templateUrl: './farm-loading.html',
  styleUrl: './farm-loading.css',
})
export class FarmLoading implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private operationService = inject(OperationService);
  private farmService = inject(FarmService);
  private chickenTypeService = inject(ChickenTypeService);
  private snackBar = inject(MatSnackBar);

  loading = signal(false);
  submitting = signal(false);
  farms = signal<Farm[]>([]);
  chickenTypes = signal<ChickenType[]>([]);
  operationId = signal<number>(0);


  loadingForm = this.fb.nonNullable.group({
    farm_id: [null as number | null, Validators.required],
    chicken_type_id: [null as number | null, Validators.required],
    empty_vehicle_weight: [0, [Validators.required, Validators.min(0)]],
    cage_count: [0, [Validators.required, Validators.min(0)]],
    cage_weight_per_unit: [15, [Validators.required, Validators.min(0)]],
    loaded_vehicle_weight: [0, [Validators.required, Validators.min(0)]],
    price_per_kg: [0, [Validators.required, Validators.min(0)]],
    paid_amount: [0, [Validators.required, Validators.min(0)]]
  });

formValue = toSignal(
    this.loadingForm.valueChanges,
    { initialValue: this.loadingForm.getRawValue() }
  );

  // Computed signals for real-time calculations
  netWeight = computed(() => {
    const form = this.formValue();

    const empty = form.empty_vehicle_weight || 0;
    const loaded = form.loaded_vehicle_weight || 0;
    const cageCount = form.cage_count || 0;
    const cageWeight = form.cage_weight_per_unit || 0;

    return Math.max(0, loaded - empty - (cageCount * cageWeight));
  });

   totalAmount = computed(() => {
  const price = this.formValue().price_per_kg ?? 0;
  return this.netWeight() * price;
});

remainingAmount = computed(() => {
  const paid = this.formValue().paid_amount ?? 0;
  return Math.max(0, this.totalAmount() - paid);
});


  ngOnInit(): void {
    this.operationId.set(+this.route.snapshot.params['id']);
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    Promise.all([
      this.farmService.getAll().toPromise(),
      this.chickenTypeService.getAll().toPromise()
    ]).then(([farmsRes, typesRes]: any[]) => {
      this.farms.set(farmsRes?.data || []);
      this.chickenTypes.set(typesRes?.data || []);
      this.loading.set(false);
    }).catch(() => {
      this.snackBar.open('فشل تحميل البيانات', 'حسناً', { duration: 3000 });
      this.loading.set(false);
    });
  }

  onSubmit(): void {
    if (this.loadingForm.invalid) return;

    this.submitting.set(true);
    const payload = this.loadingForm.getRawValue();

    this.operationService.farmLoading(this.operationId(), payload as any).subscribe({
      next: (result) => {
        this.snackBar.open('تم تسجيل التحميل بنجاح', 'حسناً', { duration: 3000 });
        this.router.navigate(['/operations/daily', this.operationId()]);
      },
      error: (error) => {
        this.submitting.set(false);
        this.snackBar.open(
          error.error?.message || 'فشل تسجيل التحميل',
          'حسناً',
          { duration: 3000 }
        );
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/operations/daily', this.operationId()]);
  }
}

