import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReportService } from '../../../../core/services/report.service';
import { DailyReport as Report } from '../../../../core/models';
@Component({
  selector: 'app-daily-report',
  imports: [CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatTableModule,
    MatProgressSpinnerModule
],
  templateUrl: './daily-report.html',
  styleUrl: './daily-report.css',
})
export class DailyReport implements OnInit {
  private fb = inject(FormBuilder);
  private reportService = inject(ReportService);
  private snackBar = inject(MatSnackBar);

  loading = signal(false);
  report = signal<Report | null>(null);

  dateForm = this.fb.nonNullable.group({
    date: [new Date(), Validators.required]
  });

  farmColumns = ['farm', 'chicken_type', 'weight', 'amount'];
  saleColumns = ['buyer', 'chicken_type', 'weight', 'amount'];
  costColumns = ['category', 'amount', 'notes'];
  lossColumns = ['chicken_type', 'weight', 'amount'];

  ngOnInit(): void {
    this.loadReport();
  }

  loadReport(): void {
    const date = this.formatDate(this.dateForm.get('date')?.value!);
    this.loading.set(true);

    this.reportService.getDailyReport(date).subscribe({
      next: (data: any) => {
                console.log('Backend response:', data.data); // Debug log
        this.report.set(data.data);
        this.loading.set(false);
      },
      error: (error) => {
        this.snackBar.open('فشل تحميل التقرير', 'حسناً', { duration: 3000 });
        this.loading.set(false);
        console.error('Error loading report:', error);
      }
    });
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
