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
@Component({
  selector: 'app-dashboard',
  imports: [
       CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatGridListModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  authService = inject(AuthService);
  currentDate = signal(new Date());

  ngOnInit(): void {
    setInterval(() => {
      this.currentDate.set(new Date());
    }, 60000);
  }

}
