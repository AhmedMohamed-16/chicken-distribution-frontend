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

@Component({
  selector: 'app-daily-costs',
  imports: [ CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule],
  templateUrl: './daily-costs.html',
  styleUrl: './daily-costs.css',
})
export class DailyCosts implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private operationService = inject(OperationService);
  private snackBar = inject(MatSnackBar);
  private costCategoryService = inject(CostCategoryService);
  loading = signal(false);

  submitting = signal(false);
  operationId = signal<number>(0);
  categories = signal<any[]>([]);

  costForm = this.fb.nonNullable.group({
    cost_category_id: [null as number | null, Validators.required],
    amount: [0, [Validators.required, Validators.min(0)]],
    description: ['']
  });

  ngOnInit(): void {
    this.operationId.set(+this.route.snapshot.params['id']);
    this.loadCategories();

  }

  loadCategories(): void {
    this.loading.set(true);
    this.costCategoryService.getAll().subscribe({
      next: (res: any) => {
        // إذا API بيرجع { data: [] } أو مصفوفة مباشرة
        this.categories.set(res?.data ?? res);
        this.loading.set(false);
      },
      error: () => {
        this.snackBar.open('فشل تحميل فئات التكاليف', 'حسناً', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.costForm.invalid) return;

    this.submitting.set(true);
    const payload = this.costForm.getRawValue();

    this.operationService.recordCost(this.operationId(), payload as any).subscribe({
      next: () => {
        this.snackBar.open('تم تسجيل التكلفة بنجاح', 'حسناً', { duration: 3000 });
        this.router.navigate(['/operations/daily', this.operationId()]);
      },
      error: (error:HttpErrorResponse) => {
        this.submitting.set(false);
        this.snackBar.open(error.error?.message||'فشل تسجيل التكلفة', 'حسناً', { duration: 3000 });
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/operations/daily', this.operationId()]);
  }
}
