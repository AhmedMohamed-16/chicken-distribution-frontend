import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { DebtReportService } from '../../../../core/services/DebtReport.service';

import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { BuyerStatementSummary, DateRange, FarmStatementSummary, StatementDialogData, StatementTransaction } from '../../../../core/models';
import { Observable } from 'rxjs';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-statement-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatDividerModule,
    MatChipsModule
  ],
  templateUrl: './statement-dialog.html',
  styleUrl: './statement-dialog.scss',
})
export class StatementDialog implements OnInit {
  private dialogRef = inject(MatDialogRef<StatementDialog>);
  private debtService = inject(DebtReportService);
  public data = inject<StatementDialogData>(MAT_DIALOG_DATA);

  // Signals for reactive state
  loading = signal(false);
  error = signal<string | null>(null);
  transactions = signal<StatementTransaction[]>([]);
  summary = signal<FarmStatementSummary | BuyerStatementSummary | null>(null);

  // Date range form
  dateRangeForm = new FormGroup({
    from: new FormControl<Date | null>(null),
    to: new FormControl<Date | null>(null)
  });

  // Table columns
  displayedColumns = ['date', 'type', 'description', 'amount', 'paid_now', 'balance_change', 'running_balance'];

  // Computed values
  hasData = computed(() => this.transactions().length > 0);

  ngOnInit(): void {
    this.loadStatement();
  }

  loadStatement(): void {
    this.loading.set(true);
    this.error.set(null);

    const dateRange = this.getDateRange();

    const request$ = this.data.entityType === 'farm'
      ? this.debtService.getFarmStatement(this.data.entityId, dateRange)
      : this.debtService.getBuyerStatement(this.data.entityId, dateRange) as Observable<any>;

    request$.subscribe({
      next: (response) => {
        if (response.success) {
          this.transactions.set(response.data.statement);
          this.summary.set(response.data.summary);
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  applyDateFilter(): void {
    this.loadStatement();
  }

  clearDateFilter(): void {
    this.dateRangeForm.reset();
    this.loadStatement();
  }

  private getDateRange(): { from: string; to: string } | undefined {
    const startDate = this.dateRangeForm.value.from;
    const endDate = this.dateRangeForm.value.to;

    if (!startDate && !endDate) {
      return undefined;
    }

    return {
      from: startDate ? this.formatDate(startDate) : '',
      to: endDate ? this.formatDate(endDate) : ''
    };
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('ar-EG', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  getTransactionTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'PURCHASE': 'شراء',
      'SALE': 'بيع',
      'PAYMENT': 'دفع',
      'RECEIPT': 'استلام'
    };
    return labels[type] || type;
  }

  getBalanceClass(balance: number): string {
    if (balance > 0) return 'positive-balance';
    if (balance < 0) return 'negative-balance';
    return 'zero-balance';
  }


  /**
   * تصدير كشف الحساب إلى ملف Excel بالعربية مع تنسيق احترافي
   */
  exportToExcel(): void {
    const transactions = this.transactions();
    const summary = this.summary();

    // إنشاء Workbook
    const wb = XLSX.utils.book_new();

    // ===== إعداد بيانات الملخص =====
    const summaryData: any[][] = [
      ['كشف حساب: ' + this.data.entityName],
      ['التاريخ: ' + this.formatDateTime(new Date(new Date().toLocaleString('en-GB', { timeZone: 'Africa/Cairo' }))+'')],
      []
    ];

    if (summary) {
      summaryData.push(['ملخص الحساب']);
      summaryData.push([]);

      if ('opening_balance' in summary) {
        summaryData.push(['الرصيد الافتتاحي', this.formatCurrency(summary.opening_balance) + ' جنيه']);
      }

      if ('total_purchases' in summary && summary.total_purchases) {
        summaryData.push(['إجمالي المشتريات', this.formatCurrency(summary.total_purchases) + ' جنيه']);
      }

      if ('total_sales' in summary && (summary as BuyerStatementSummary).total_sales) {
        summaryData.push(['إجمالي المبيعات', this.formatCurrency((summary as BuyerStatementSummary).total_sales) + ' جنيه']);
      }

      if ('total_payments' in summary && summary.total_payments) {
        summaryData.push(['إجمالي المدفوعات', this.formatCurrency(summary.total_payments) + ' جنيه']);
      }

      if ('closing_balance' in summary) {
        summaryData.push(['الرصيد الختامي', this.formatCurrency(summary.closing_balance) + ' جنيه']);
      }

      summaryData.push([]);
      summaryData.push([]);
    }

    // ===== إعداد بيانات المعاملات =====
    summaryData.push(['تفاصيل الحركات']);
    summaryData.push([]);

    // رؤوس الأعمدة
    const headers = [
      'التاريخ',
      'النوع',
      'الوصف',
      'المبلغ',
      'المدفوع',
      'التغيير في الرصيد',
      'الرصيد الجاري'
    ];
    summaryData.push(headers);

    // بيانات المعاملات
    transactions.forEach(transaction => {
      summaryData.push([
        this.formatDateTime(transaction.date),
        this.getTransactionTypeLabel(transaction.type),
        transaction.description || '-',
        this.formatCurrency(transaction.amount) + ' جنيه',
        this.formatCurrency(transaction.paid_now) + ' جنيه',
        this.formatCurrency(transaction.balance_change) + ' جنيه',
        this.formatCurrency(transaction.running_balance) + ' جنيه'
      ]);
    });

    // إنشاء Worksheet
    const ws = XLSX.utils.aoa_to_sheet(summaryData);

    // ===== تنسيق العرض =====
    const columnWidths = [
      { wch: 20 },  // التاريخ
      { wch: 12 },  // النوع
      { wch: 30 },  // الوصف
      { wch: 15 },  // المبلغ
      { wch: 15 },  // المدفوع
      { wch: 18 },  // التغيير
      { wch: 18 }   // الرصيد الجاري
    ];
    ws['!cols'] = columnWidths;

    // إضافة Worksheet إلى Workbook
    XLSX.utils.book_append_sheet(wb, ws, 'كشف الحساب');

    // حفظ الملف
    const fileName = `كشف_حساب_${this.data.entityName}_${this.formatDateForFileName(new Date(new Date().toLocaleString('en-GB', { timeZone: 'Africa/Cairo' })))}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }

  /**
   * تنسيق التاريخ لاسم الملف
   */
  private formatDateForFileName(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  close(): void {
    this.dialogRef.close();
  }

  get totalSales(): number {
    return Number((this.summary() as any)?.total_sales ?? 0);
  }
}
