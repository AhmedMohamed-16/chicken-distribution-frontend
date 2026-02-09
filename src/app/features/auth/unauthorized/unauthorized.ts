import { CommonModule, Location } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import {  RouterModule } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  imports: [CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule],
  templateUrl: './unauthorized.html',
  styleUrl: './unauthorized.css',
})
export class Unauthorized {
  constructor(private location: Location) {}

  goBack(): void {
    this.location.back();
  }

}
