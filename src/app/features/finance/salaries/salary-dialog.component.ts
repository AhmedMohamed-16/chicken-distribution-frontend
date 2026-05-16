import { Component, Inject, inject, signal } from '@angular/core';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SalaryService } from '../../../core/services/salary.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { Employee } from '../../../core/models';
import { PaymentMethodSelectorComponent } from '../../../shared/components/payment-method-selector/payment-method-selector.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-salary-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    PaymentMethodSelectorComponent
],
  templateUrl: './salary-dialog.component.html',
  styles: [`
  /* =========================================================
   DIALOG CONTAINER
========================================================= */

.dialog-content {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  direction: rtl;

  width: min(100%, 100%);
  min-width: 0;

  padding: 1rem;

  max-height: 95vh;
  overflow-y: auto;
  overflow-x: hidden;

  box-sizing: border-box;
}

/* =========================================================
   HEADER
========================================================= */

.dialog-header {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.dialog-title {
  margin: 0;
  padding: 0;

  color: #0f172a;

  font-size: clamp(1.3rem, 2vw, 1.8rem);
  font-weight: 700;
  line-height: 1.4;
}

.dialog-subtitle {
  margin: 0;

  color: #64748b;

  font-size: 0.95rem;
  line-height: 1.6;
}

/* =========================================================
   FORM
========================================================= */

.salary-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.form-grid mat-form-field,
.full-width {
  width: 100%;
}

/* =========================================================
   PAYMENT SECTION
========================================================= */

.payment-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  padding: 1rem;

  border-radius: 1rem;

  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

/* =========================================================
   ACTIONS
========================================================= */

.dialog-actions {
  display: flex;
  flex-direction: column-reverse;
  gap: 0.75rem;

  padding-top: 0.5rem;
  margin-top: 0.5rem;
}

.dialog-actions button {
  width: 100%;
  min-height: 48px;

  border-radius: 0.875rem;
}

.submit-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.cancel-button {
  border-color: #cbd5e1;
}

/* =========================================================
   MATERIAL FIELD IMPROVEMENTS
========================================================= */

mat-form-field {
  width: 100%;
}

textarea {
  resize: vertical;
  min-height: 90px;
}

/* =========================================================
   TABLET
========================================================= */

@media (min-width: 768px) {

  .dialog-content {
    padding: 1.5rem;
    gap: 1.5rem;

    width: min(720px, 100%);
  }

  .form-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .dialog-actions {
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
  }

  .dialog-actions button {
    width: auto;
    min-width: 140px;
  }
}

/* =========================================================
   DESKTOP
========================================================= */

@media (min-width: 1024px) {

  .dialog-content {
    padding: 1.75rem;
  }

  .salary-form {
    gap: 1.25rem;
  }
}
  `]
})
export class SalaryDialogComponent {
  private fb = inject(FormBuilder);
  private salaryService = inject(SalaryService);
  private employeeService = inject(EmployeeService);
  private snackBar = inject(MatSnackBar);

  employees = signal<Employee[]>([]);
  submitting = signal(false);
  currentYear = new Date().getFullYear();
  currentMonth = new Date().getMonth() + 1;

  monthNames = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  salaryForm = this.fb.group({
    employee_id: [null as number | null, Validators.required],
    amount: [null as number | null, [Validators.required, Validators.min(1)]],
    period_month: [this.currentMonth, Validators.required],
    period_year: [this.currentYear, Validators.required],
    payment_date: [new Date(), Validators.required],
    payment_method: ['CASH', Validators.required],
    safe_id: [null as number | null, Validators.required],
    notes: ['']
  });

  constructor(
    public dialogRef: MatDialogRef<SalaryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.loadEmployees();
  }

  async loadEmployees() {
    try {
      const res = await firstValueFrom(this.employeeService.getAll(true));
      this.employees.set(res.data || []);
    } catch (e) {
      this.snackBar.open('فشل تحميل قائمة الموظفين', 'حسناً', { duration: 3000 });
    }
  }

  async submit() {
    if (this.salaryForm.invalid) return;

    this.submitting.set(true);
    try {
      await firstValueFrom(this.salaryService.record(this.salaryForm.value));
      this.dialogRef.close(true);
    } catch (e) {
      this.snackBar.open('فشل في صرف المرتب', 'حسناً', { duration: 3000 });
    } finally {
      this.submitting.set(false);
    }
  }
}
