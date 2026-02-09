import { Component, input, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RevenueBreakdown as revenue } from '../../../../../../core/models';
import { ReportUtilitiesService } from '../../../../../../core/services/ReportUtilitiesService';


@Component({
  selector: 'app-revenue-breakdown',
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './revenue-breakdown.html',
  styleUrl: './revenue-breakdown.css',
    changeDetection: ChangeDetectionStrategy.OnPush

})
export class RevenueBreakdown {
  breakdown = input.required<revenue>();
     private utils = inject(ReportUtilitiesService);

 formatCurrency = (amount: number | undefined | null) => this.utils.formatCurrency(amount);
formatNumber = (num: number | undefined | null, decimals?: number) => this.utils.formatNumber(num, decimals);
formatPercentage = (value: number | undefined | null, decimals?: number) => this.utils.formatPercentage(value, decimals);
formatDateTime = (date: string | Date | undefined | null) => this.utils.formatDateTime(date);

}
