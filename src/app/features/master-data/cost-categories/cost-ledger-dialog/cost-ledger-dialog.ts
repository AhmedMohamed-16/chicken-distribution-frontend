import { Component, Inject, OnInit, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { CostCategoryService } from '../../../../core/services/cost-category.service';
import { ReportUtilitiesService } from '../../../../core/services/ReportUtilitiesService';
import { CostLedgerEntry } from '../../../../core/models';
import { MatIconModule } from '@angular/material/icon';
 
@Component({
  selector: 'app-cost-ledger-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatIconModule
  ],
  templateUrl: './cost-ledger-dialog.html',
  styleUrl: './cost-ledger-dialog.css',
})
export class CostLedgerDialog implements OnInit {
  private costCategoryService = inject(CostCategoryService);
  private utils = inject(ReportUtilitiesService);

  loading = signal(true);
  dataSource = signal<CostLedgerEntry[]>([]);
  currentDebt = signal(0);
  openingBalance = signal(0);
  Math = Math;

  dateRange = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null)
  });

  formatCurrency = (amount: any) => this.utils.formatCurrency(amount);
  formatNumber = (num: any, decimals?: any) => this.utils.formatNumber(num, decimals);
  formatDateTime = (date: any) => this.utils.formatDateTime(date);

  displayedColumns = [
    'date',
    'type',
    'amount_incurred',
    'amount_paid',
    'running_balance'
  ];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { id: number; category: any }
  ) {}

  ngOnInit(): void {
    this.loadLedger();
  }

  loadLedger(): void {
    this.loading.set(true);
    
    const start = this.dateRange.value.start ? this.dateRange.value.start.toISOString() : undefined;
    const end = this.dateRange.value.end ? this.dateRange.value.end.toISOString() : undefined;

    this.costCategoryService.getStatement(this.data.id, start, end).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.currentDebt.set(res.data.current_balance);
          this.openingBalance.set(res.data.opening_balance || 0);
          this.dataSource.set(res.data.ledger);
        }
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Error loading cost ledger:', err);
        this.loading.set(false);
      }
    });
  }

  clearDates(): void {
    this.dateRange.reset();
    this.loadLedger();
  }
}
