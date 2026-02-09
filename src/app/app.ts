import { Component, effect, inject, LOCALE_ID, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { HasPermissionDirective } from './core/directives/hasPermission.directive';
import { PERMISSIONS } from './core/constants/Permissions.constant';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,MatTableModule,
    MatSidenavModule,MatMenuModule
    ,MatToolbarModule,MatListModule,
   MatDividerModule,MatIconModule,RouterLink,RouterLinkActive,HasPermissionDirective,CommonModule],
     providers: [provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'ar-EG' },
    { provide: LOCALE_ID, useValue: 'ar-EG' }
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Checkins-Distribution');
  PERMISSIONS = PERMISSIONS;
  constructor() {
    // React to permission changes using effect
    effect(() => {
      // Track permissions signal changes
      console.log("log",this.authService.permissions());

     });
  }

  authService = inject(AuthService);
  private router = inject(Router);
  operationsPermissions = [
  PERMISSIONS.OPERATIONS.RECORD_FARM_LOADING,
  PERMISSIONS.OPERATIONS.RECORD_SALE,
  PERMISSIONS.OPERATIONS.RECORD_TRANSPORT_LOSS,
  PERMISSIONS.OPERATIONS.RECORD_COST,
  PERMISSIONS.OPERATIONS.CLOSE_OPERATION,
];

  logout(): void {
    this.authService.logout();
  }

}
