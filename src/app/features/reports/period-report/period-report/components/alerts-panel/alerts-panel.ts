import { Component, input, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { HighlightsAndAlerts } from '../../../../../../core/models';
import { ReportUtilitiesService } from '../../../../../../core/services/ReportUtilitiesService';

@Component({
  selector: 'app-alerts-panel',
  imports: [CommonModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatButtonModule
],
  templateUrl: './alerts-panel.html',
  styleUrl: './alerts-panel.css',
    changeDetection: ChangeDetectionStrategy.OnPush

})
export class AlertsPanel {
highlightsAndAlerts = input.required<HighlightsAndAlerts>();
  private utils = inject(ReportUtilitiesService);

  getAlertIcon(type: string): string {
    const icons: Record<string, string> = {
      'LOSS_RATE_HIGH': 'warning',
      'FARM_PAYABLE_HIGH': 'agriculture',
      'BUYER_DEBT_HIGH': 'account_balance'
    };
    return icons[type] || 'notification_important';
  }

  getSeverityLabel(severity: string): string {
    const labels: Record<string, string> = {
      'HIGH': 'عاجل',
      'MEDIUM': 'متوسط',
      'LOW': 'منخفض'
    };
    return labels[severity] || severity;
  }

   formatCurrency = (amount: number | undefined | null) => this.utils.formatCurrency(amount);
formatNumber = (num: number | undefined | null, decimals?: number) => this.utils.formatNumber(num, decimals);
formatPercentage = (value: number | undefined | null, decimals?: number) => this.utils.formatPercentage(value, decimals);
formatDateTime = (date: string | Date | undefined | null) => this.utils.formatDateTime(date);
englishToArabicNumbers = (str: string) => this.utils.englishToArabicNumbers(str);

}





