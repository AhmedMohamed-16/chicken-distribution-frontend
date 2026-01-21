import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { OperationService } from '../../../../core/services/operation.service';
import { ChickenTypeService } from '../../../../core/services/chicken-type.service';
import { ChickenType } from '../../../../core/models';

@Component({
  selector: 'app-transport-losses',
  imports: [    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule
],
  templateUrl: './transport-losses.html',
  styleUrl: './transport-losses.css',
})
export class TransportLosses implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private operationService = inject(OperationService);
  private chickenTypeService = inject(ChickenTypeService);
  private snackBar = inject(MatSnackBar);

  loading = signal(false);
  submitting = signal(false);
  chickenTypes = signal<ChickenType[]>([]);
  operationId = signal<number>(0);

  lossForm = this.fb.nonNullable.group({
    chicken_type_id: [null as number | null, Validators.required],
    dead_weight: [0, [Validators.required, Validators.min(0)]],
    price_per_kg: [0, [Validators.required, Validators.min(0)]],
    location: ['']
  });

  lossAmount = signal<number>(0);

  ngOnInit(): void {
    this.operationId.set(+this.route.snapshot.params['id']);
    this.loadChickenTypes();

    // Calculate loss amount when values change
    this.lossForm.valueChanges.subscribe(() => {
      const weight = this.lossForm.get('dead_weight')?.value || 0;
      const price = this.lossForm.get('price_per_kg')?.value || 0;
      this.lossAmount.set(weight * price);
    });
  }

  loadChickenTypes(): void {
    this.loading.set(true);
    this.chickenTypeService.getAll().subscribe({
      next: (data:any) => {
        this.chickenTypes.set(data.data);
        this.loading.set(false);
      },
      error: () => {
        this.snackBar.open('فشل تحميل البيانات', 'حسناً', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.lossForm.invalid) return;

    this.submitting.set(true);
    const payload = this.lossForm.getRawValue();

    this.operationService.recordLoss(this.operationId(), payload as any).subscribe({
      next: () => {
        this.snackBar.open('تم تسجيل الخسارة بنجاح', 'حسناً', { duration: 3000 });
        this.router.navigate(['/operations/daily', this.operationId()]);
      },
      error: () => {
        this.submitting.set(false);
        this.snackBar.open('فشل تسجيل الخسارة', 'حسناً', { duration: 3000 });
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/operations/daily', this.operationId()]);
  }
}

