import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatNativeDateModule } from '@angular/material/core';
import { ReportService } from '../../../../core/services/report.service';
interface IPartnerTotal {
  partner_id: number;
  partner_name: string;
  total_base_share: number;
  total_vehicle_cost_share: number;
  total_final_profit: number;
}


interface IProfitReport {
  period: {
    from: string;
    to: string;
  };

  totals: {
    net_profit: number;
    total_revenue: number;
    total_purchases: number;
    total_losses: number;
    total_costs: number;
    vehicle_costs: number;
  };

  partner_totals: IPartnerTotal[];

  daily_distributions: Array<{
    net_profit: number;
    daily_operation: {
      operation_date: string;
    };
  }>;
}

@Component({
  selector: 'app-profit-report',
  imports: [CommonModule, MatCardModule, MatButtonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './profit-report.html',
  styleUrl: './profit-report.css',
})
export class ProfitReport {
private fb = inject(FormBuilder);
  private reportService = inject(ReportService);

  dateForm: FormGroup;
  loading = signal(false);
  report = signal<IProfitReport | null>(null);

 partnerColumns = [
  'partner_name',
  'base_share',
  'vehicle_cost',
  'final_profit'
];

  dailyColumns = ['date', 'net_profit'];

  constructor() {
    this.dateForm = this.fb.group({
      from: ['', Validators.required],
      to: ['', Validators.required]
    });
  }

  loadReport() {
    if (this.dateForm.invalid) return;

    const { from, to } = this.dateForm.value;
    const fromDate = this.formatDate(from);
    const toDate = this.formatDate(to);

    this.loading.set(true);

    this.reportService.getPartnerProfits(fromDate, toDate).subscribe({
      next: (response: any) => {
        console.log("response.data",response.data)
        this.report.set(response.data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading profit report:', error);
        this.loading.set(false);
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
