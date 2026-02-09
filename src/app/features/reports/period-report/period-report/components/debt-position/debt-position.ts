import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
 import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { DebtPosition as dept } from '../../../../../../core/models';
import { ReportUtilitiesService } from '../../../../../../core/services/ReportUtilitiesService';

@Component({
  selector: 'app-debt-position',
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './debt-position.html',
  styleUrl: './debt-position.css',
    changeDetection: ChangeDetectionStrategy.OnPush

})
export class DebtPosition {
  debtPosition = input.required<dept>();
    private utils = inject(ReportUtilitiesService);

 formatCurrency = (amount: number | undefined | null) => this.utils.formatCurrency(amount);
formatNumber = (num: number | undefined | null, decimals?: number) => this.utils.formatNumber(num, decimals);
formatPercentage = (value: number | undefined | null, decimals?: number) => this.utils.formatPercentage(value, decimals);
formatDateTime = (date: string | Date | undefined | null) => this.utils.formatDateTime(date);

}
