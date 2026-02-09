
// src/app/features/users/user-details/user-details.component.ts
import { Component, inject, signal, input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Permission, User } from '../../../core/models'; 
import { UserService } from '../../../core/services/user.service';
import { PERMISSIONS } from '../../../core/constants/Permissions.constant';
import { ReportUtilitiesService } from '../../../core/services/ReportUtilitiesService';

@Component({
    selector: 'app-user-details',
   templateUrl: './user-details.html',
  styleUrl: './user-details.css',

  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,

})
export class UserDetails implements OnInit {
  private userService = inject(UserService);

  userId = input.required<number>();
  readonly permissions = PERMISSIONS.USERS;
    private readonly utils = inject(ReportUtilitiesService);

formatCurrency = (amount: number | undefined | null) => this.utils.formatCurrency(amount);
formatNumber = (num: number | undefined | null |string, decimals?: number) => this.utils.formatNumber(num, decimals);
formatPercentage = (value: number | undefined | null, decimals?: number) => this.utils.formatPercentage(value, decimals);
formatDateTime = (date: string | Date | undefined | null) => this.utils.formatDateTime(date);
  user = signal<User | null>(null);
  loading = signal(true);

  ngOnInit(): void {
    this.loadUser();
  }

  loadUser(): void {
    this.loading.set(true);

    this.userService.getUser(this.userId()).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.user.set(response.data);
          console.log("data",response.data);

        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  getPermissionsByCategory(): Array<{ name: string; permissions: Permission[] }> {
    const permissions = this.user()?.permissions || [];
    const grouped = permissions.reduce((acc, perm) => {
      if (!acc[perm.category]) {
        acc[perm.category] = [];
      }
      acc[perm.category].push(perm);
      return acc;
    }, {} as Record<string, Permission[]>);

    return Object.keys(grouped).map(category => ({
      name: category,
      permissions: grouped[category]
    }));
  }
}
