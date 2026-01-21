import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReportService } from '../../../../core/services/report.service';
import { MatTableModule } from '@angular/material/table';
@Component({
  selector: 'app-period-report',
  imports: [  CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatTableModule,
    MatProgressSpinnerModule],
  templateUrl: './period-report.html',
  styleUrl: './period-report.css',
})
export class PeriodReport {

  private fb = inject(FormBuilder);
  private reportService = inject(ReportService);
  private snackBar = inject(MatSnackBar);

  loading = signal(false);
  report = signal<any | null>(null);

  periodForm = this.fb.nonNullable.group({
    from: [new Date(), Validators.required],
    to: [new Date(), Validators.required]
  });

  farmColumns = ['farm', 'chicken_type', 'weight', 'amount'];
  saleColumns = ['buyer', 'chicken_type', 'weight', 'amount'];
  costColumns = ['category', 'amount', 'notes'];
  lossColumns = ['chicken_type', 'weight', 'amount'];

  loadReport(): void {
    if (this.periodForm.invalid) {
      this.snackBar.open('يرجى اختيار التواريخ', 'حسناً', { duration: 2000 });
      return;
    }

    const formValue = this.periodForm.getRawValue();
    const fromDate = this.formatDateOnly(formValue.from);
    const toDate = this.formatDateOnly(formValue.to);

    this.loading.set(true);

    this.reportService.getPeriodReport(fromDate, toDate).subscribe({
      next: (response: any) => {
        this.report.set(response.data);
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.snackBar.open('حدث خطأ في تحميل التقرير', 'حسناً', { duration: 3000 });
        console.error('Error loading report:', error);
      }
    });
  }

  private formatDateOnly(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
