import { Component, input, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { PeriodComparison as period} from '../../../../../../core/models';
import { ReportUtilitiesService } from '../../../../../../core/services/ReportUtilitiesService';

@Component({
  selector: 'app-period-comparison',
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './period-comparison.html',
  styleUrl: './period-comparison.css',
    changeDetection: ChangeDetectionStrategy.OnPush

})
export class PeriodComparison {
  comparison = input.required<period>();
    private utils = inject(ReportUtilitiesService);

 formatCurrency = (amount: number | undefined | null) => this.utils.formatCurrency(amount);
formatNumber = (num: number | undefined | null, decimals?: number) => this.utils.formatNumber(num, decimals);
formatPercentage = (value: number | undefined | null, decimals?: number) => this.utils.formatPercentage(value, decimals);
formatDateTime = (date: string | Date | undefined | null) => this.utils.formatDateTime(date);

}
