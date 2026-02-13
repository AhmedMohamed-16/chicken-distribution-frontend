import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { AuthService } from '../../../core/services/auth.service';
import { OperationService } from '../../../core/services/operation.service';
import { ReportService } from '../../../core/services/report.service';
import { ReportUtilitiesService } from '../../../core/services/ReportUtilitiesService';
import { PERMISSIONS } from '../../../core/constants/Permissions.constant';
import { HasPermissionDirective } from '../../../core/directives/hasPermission.directive';
@Component({
  selector: 'app-dashboard',
  imports: [
       CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatGridListModule,
    HasPermissionDirective

  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  authService = inject(AuthService);
  currentDate = signal(new Date());
private utils = inject(ReportUtilitiesService);
  PERMISSIONS = PERMISSIONS;
 operationsPermissions = [
  PERMISSIONS.OPERATIONS.RECORD_FARM_LOADING,
  PERMISSIONS.OPERATIONS.RECORD_SALE,
  PERMISSIONS.OPERATIONS.RECORD_TRANSPORT_LOSS,
  PERMISSIONS.OPERATIONS.RECORD_COST,
  PERMISSIONS.OPERATIONS.CLOSE_OPERATION,
];
formatDateTime = (date: string | Date | undefined | null) => this.utils.formatDateTime(date);

ngOnInit(): void {
  setInterval(() => {
    const now = new Date();
    this.currentDate.set(now);
  }, 60000)

}


}
