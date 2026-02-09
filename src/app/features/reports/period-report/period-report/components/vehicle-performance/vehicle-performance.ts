import { Component, input, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { VehiclePerformance as performance } from   '../../../../../../core/models';
import { ReportUtilitiesService } from '../../../../../../core/services/ReportUtilitiesService';


@Component({
  selector: 'app-vehicle-performance',
  imports: [CommonModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule],
  templateUrl: './vehicle-performance.html',
  styleUrl: './vehicle-performance.css',
    changeDetection: ChangeDetectionStrategy.OnPush

})
export class VehiclePerformance {
performance = input.required<performance>();

  displayedColumns = ['rank', 'vehicle', 'days', 'revenue', 'profit', 'margin', 'avgDaily', 'rating'];

  getBestVehicleName(): string {
    const bestId = this.performance().summary.most_profitable_vehicle_id;
    const vehicle = this.performance().vehicles.find(v => v.vehicle_id === bestId);
    return vehicle?.vehicle_name || '-';
  }

  getRankClass(rank: number): string {
    if (rank === 1) return 'gold';
    if (rank === 2) return 'silver';
    if (rank === 3) return 'bronze';
    return '';
  }

  getRankIcon(rank: number): string {
    if (rank === 1) return 'looks_one';
    if (rank === 2) return 'looks_two';
    if (rank === 3) return 'looks_3';
    return '';
  }

  getRatingClass(rating: string): string {
    return rating.toLowerCase().replace('_', '-');
  }

  getRatingLabel(rating: string): string {
    const labels: Record<string, string> = {
      'EXCELLENT': 'ممتاز',
      'GOOD': 'جيد',
      'AVERAGE': 'متوسط',
      'NEEDS_IMPROVEMENT': 'يحتاج تحسين'
    };
    return labels[rating] || rating;
  }
     private utils = inject(ReportUtilitiesService);

 formatCurrency = (amount: number | undefined | null) => this.utils.formatCurrency(amount);
formatNumber = (num: number | undefined | null, decimals?: number) => this.utils.formatNumber(num, decimals);
formatPercentage = (value: number | undefined | null, decimals?: number) => this.utils.formatPercentage(value, decimals);
formatDateTime = (date: string | Date | undefined | null) => this.utils.formatDateTime(date);

}




