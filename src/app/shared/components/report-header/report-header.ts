import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface DateRange {
  from: Date;
  to: Date;
}

@Component({
  selector: 'app-report-header',

  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './report-header.html',
  styleUrl: './report-header.css',
})
export class SharedReportHeaderComponent {
  // Inputs
  title = input<string>('التقرير');
  subtitle = input<string>('تحليل شامل للبيانات');
  icon = input<string>('assessment');
  showQuickDates = input<boolean>(false);
  loading = input<boolean>(false);
  hasReport = input<boolean>(false);

  // Outputs
  loadReport = output<DateRange>();
  exportExcel = output<void>();
  exportPDF = output<void>();
  print = output<void>();
  clear = output<void>();

  // Form
  dateForm = new FormGroup({
    from: new FormControl<Date>(this.getDefaultStartDate(), { nonNullable: true }),
    to: new FormControl<Date>(new Date(), { nonNullable: true })
  });

  private getDefaultStartDate(): Date {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date;
  }

  onLoad(): void {
    if (this.dateForm.valid) {
      const value = this.dateForm.getRawValue();
      this.loadReport.emit(value);
    }
  }

  setQuickDate(type: 'week' | 'month' | 'currentMonth' | 'previousMonth'): void {
    const today = new Date();
    let from: Date;
    let to: Date = new Date(today);

    switch (type) {
      case 'week':
        from = new Date(today);
        from.setDate(today.getDate() - 7);
        break;

      case 'month':
        from = new Date(today);
        from.setDate(today.getDate() - 30);
        break;

      case 'currentMonth':
        from = new Date(today.getFullYear(), today.getMonth(), 1);
        to = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;

      case 'previousMonth':
        from = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        to = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
    }

    this.dateForm.patchValue({ from, to });
  }

  onExportExcel(): void {
    this.exportExcel.emit();
  }

  onExportPDF(): void {
    this.exportPDF.emit();
  }

  onPrint(): void {
    this.print.emit();
  }

  onClear(): void {
    this.clear.emit();
  }
}
