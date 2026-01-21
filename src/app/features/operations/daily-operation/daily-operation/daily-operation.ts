import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FarmLoading } from '../../farm-loading/farm-loading/farm-loading';
 
@Component({
  selector: 'app-daily-operation',
  imports: [CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterLink
],
  templateUrl: './daily-operation.html',
  styleUrl: './daily-operation.css',
})
export class DailyOperation implements OnInit {
  private route = inject(ActivatedRoute);
  operationId = signal<number>(0);

  ngOnInit(): void {
    this.operationId.set(+this.route.snapshot.params['id']);
  }
}

