
import { Component, input, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ExecutiveSummary as summary , PeriodInfo } from '../../../../../../core/models';
import { ReportUtilitiesService } from '../../../../../../core/services/ReportUtilitiesService';

@Component({
  selector: 'app-executive-summary',
  imports: [CommonModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule],
  templateUrl: './executive-summary.html',
  styleUrl: './executive-summary.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExecutiveSummary {

  summary = input.required<summary>();
  periodInfo = input.required<PeriodInfo>();
  private utils = inject(ReportUtilitiesService);

  hasTrend(): boolean {
    return this.summary().financial.trend_vs_previous?.has_comparison || false;
  }

  getTrendClass(): string {
    const direction = this.summary().financial.trend_vs_previous?.direction;
    return direction === 'IMPROVING' ? 'up' : direction === 'DECLINING' ? 'down' : '';
  }

  getTrendIcon(): string {
    const direction = this.summary().financial.trend_vs_previous?.direction;
    return direction === 'IMPROVING' ? 'trending_up' : 'trending_down';
  }

  getPerformanceClass(): string {
    const direction = this.summary().financial.trend_vs_previous?.direction;
    return direction?.toLowerCase() || 'stable';
  }

  getPerformanceIcon(): string {
    const direction = this.summary().financial.trend_vs_previous?.direction;
    if (direction === 'IMPROVING') return 'celebration';
    if (direction === 'DECLINING') return 'warning';
    return 'info';
  }

  getPerformanceTitle(): string {
    const direction = this.summary().financial.trend_vs_previous?.direction;
    if (direction === 'IMPROVING') return 'أداء ممتاز! 🎉';
    if (direction === 'DECLINING') return 'تنبيه: انخفاض في الأداء';
    return 'أداء مستقر';
  }

  getPerformanceMessage(): string {
    const trend = this.summary().financial.trend_vs_previous;
    if (trend.direction === 'IMPROVING') {
      return `تحسن الربح بنسبة ${Math.abs(trend.profit_change_pct || 0).toFixed(1)}% مقارنة بالفترة السابقة`;
    }
    if (trend.direction === 'DECLINING') {
      return `انخفض الربح بنسبة ${Math.abs(trend.profit_change_pct || 0).toFixed(1)}% مقارنة بالفترة السابقة`;
    }
    return 'الأداء مستقر مقارنة بالفترة السابقة';
  }

   formatCurrency = (amount: number | undefined | null) => this.utils.formatCurrency(amount);
formatNumber = (num: number | undefined | null, decimals?: number) => this.utils.formatNumber(num, decimals);
formatPercentage = (value: number | undefined | null, decimals?: number) => this.utils.formatPercentage(value, decimals);
formatDateTime = (date: string | Date | undefined | null) => this.utils.formatDateTime(date);

}
