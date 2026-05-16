import { Component, Inject, OnInit, inject, signal } from '@angular/core';

import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SalaryService } from '../../../core/services/salary.service';
import { ReportUtilitiesService } from '../../../core/services/ReportUtilitiesService';
import { firstValueFrom } from 'rxjs';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-salary-summary-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatTableModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIcon
],
  templateUrl: './salary-summary-dialog.component.html',
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

  overflow-x: hidden;
  overflow-y: auto;

  box-sizing: border-box;
}

/* =========================================================
   HEADER
========================================================= */

.dialog-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.title-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.dialog-title {
  margin: 0;
  padding: 0;

  color: #0f172a;

  font-size: clamp(1.25rem, 2vw, 1.75rem);
  font-weight: 700;

  line-height: 1.4;
}

.dialog-subtitle {
  margin: 0;

  color: #64748b;

  font-size: 0.92rem;
  line-height: 1.6;
}

/* =========================================================
   LOADING
========================================================= */

.loading-container {
  position: relative;
  min-height: 180px;
}

.loading-shade {
  position: absolute;
  inset: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 1rem;

  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(2px);
}

/* =========================================================
   TABLE
========================================================= */

.table-wrapper {
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;

  border-radius: 1rem;
  border: 1px solid #e2e8f0;
}

.summary-table {
  width: 100%;
  min-width: 420px;

  border-collapse: separate;
  border-spacing: 0;
}

.summary-table th {
  background: #f8fafc;

  color: #334155;

  font-size: 0.9rem;
  font-weight: 700;

  white-space: nowrap;
}

.summary-table td,
.summary-table th {
  padding: 1rem;
}

.summary-row {
  transition: background-color 0.2s ease;
}

.summary-row:hover {
  background-color: rgba(148, 163, 184, 0.08);
}

.month-cell {
  font-weight: 600;
  color: #1e293b;
}

.amount-text {
  color: #0f766e;

  font-weight: 700;

  white-space: nowrap;
}

/* =========================================================
   TOTAL ROW
========================================================= */

.total-row {
  font-weight: 700;
  background-color: #f8fafc;
}

/* =========================================================
   EMPTY STATE
========================================================= */

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  gap: 0.75rem;

  padding: 3rem 1.5rem;

  text-align: center;

  color: #94a3b8;
}

.empty-state mat-icon {
  width: 4rem;
  height: 4rem;

  font-size: 4rem;
}

.empty-state h3 {
  margin: 0;

  color: #475569;

  font-size: 1.1rem;
  font-weight: 700;
}

.empty-state p {
  margin: 0;

  max-width: 24rem;

  line-height: 1.7;
  font-size: 0.95rem;
}

/* =========================================================
   ACTIONS
========================================================= */

.dialog-actions {
  display: flex;
  flex-direction: column;

  gap: 0.75rem;

  padding-top: 0.5rem;
}

.dialog-actions button {
  width: 100%;
  min-height: 48px;

  border-radius: 0.875rem;
}

.close-button {
  border-color: #cbd5e1;
}

/* =========================================================
   TABLET
========================================================= */

@media (min-width: 768px) {

  .dialog-content {
    width: min(700px, 100%);
    padding: 1.5rem;
    gap: 1.5rem;
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

  .summary-table td,
  .summary-table th {
    padding: 1rem 1.25rem;
  }
}
  `]
})
export class SalarySummaryDialogComponent implements OnInit {
  private salaryService = inject(SalaryService);
  private utils = inject(ReportUtilitiesService);

  summaryData = signal<any[]>([]);
  isLoading = signal(false);
  employeeName = '';
  summaryColumns: string[] = ['month', 'total_paid'];

  monthNames = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    this.loadSummary();
  }

  async loadSummary() {
    this.isLoading.set(true);
    try {
      const res = await firstValueFrom(
        this.salaryService.getSummary(this.data.employeeId, this.data.year)
      );
      this.summaryData.set(res.data?.monthly_breakdown || []);
    } catch (e) {
      // Handle error
    } finally {
      this.isLoading.set(false);
    }
  }

  getMonthName = (month: number) => this.monthNames[month - 1] || '';
  formatCurrency = (amt: number) => this.utils.formatCurrency(amt);
}
