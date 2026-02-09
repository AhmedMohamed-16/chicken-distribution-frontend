import { Component, signal, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { ApiResponse, User } from '../../../core/models/index';
import { PERMISSIONS } from '../../../core/constants/Permissions.constant';
import { HasPermissionDirective } from '../../../core/directives/hasPermission.directive';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { UserDetailsDialog } from '../user-details-dialog/user-details-dialog';
import { ManagePermissions } from '../manage-permissions/manage-permissions';
import { ConfirmationDialog } from '../../../shared/components/confirmation-dialog/confirmation-dialog/confirmation-dialog';
import { ReportUtilitiesService } from '../../../core/services/ReportUtilitiesService';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
@Component({
  selector: 'app-userlist',
  imports: [CommonModule, RouterModule,RouterLink, FormsModule, HasPermissionDirective,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './userlist.html',
  styleUrl: './userlist.css',
    changeDetection: ChangeDetectionStrategy.OnPush,

})
export class Userlist implements OnInit {
  private userService = inject(UserService);

  readonly permissions = PERMISSIONS.USERS;
  readonly Math = Math;
  private dialog = inject(MatDialog);
    private readonly utils = inject(ReportUtilitiesService);
  formatCurrency = (amount: number | undefined | null) => this.utils.formatCurrency(amount);
formatNumber = (num: number | undefined | null |string, decimals?: number) => this.utils.formatNumber(num, decimals);
formatPercentage = (value: number | undefined | null, decimals?: number) => this.utils.formatPercentage(value, decimals);
formatDateTime = (date: string | Date | undefined | null) => this.utils.formatDateTime(date);

displayedColumns: string[] = [
    'username',
    'fullName',
    'email',
    'phone',
    'status',
    'permissions',
    'actions'
  ];


  // Signals
  users = signal<User[]>([]);
  loading = signal(false);
  // currentPage = signal(1);
  // pageSize = signal(10);
  // totalUsers = signal(0);
  // totalPages = signal(0);
    router = inject(Router);

  // Model bindings for ngModel
  // searchTermModel = '';
  // activeFilterModel = '';
  // pageSizeModel = 10;
  private snackBar = inject(MatSnackBar);
  // private searchTimeout?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);

    // const params = {
    //   page: this.currentPage(),
    //   limit: this.pageSize(),
    //   search: this.searchTermModel || undefined,
    //   is_active: this.activeFilterModel ? this.activeFilterModel === 'true' : undefined
    // };

    this.userService.getUsers().subscribe({
      next: (response:ApiResponse<User[]>) => {
        if (response.success && response.data) {
          // this.users.set(response.data.items);

          this.users.set(response.data);
          console.log(response);
console.log('users before set:', this.users());

          // this.totalUsers.set(response.data.pagination.total);
          // this.totalPages.set(response.data.pagination.total_pages);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Failed to load users:', error);
        this.loading.set(false);
      }
    });
  }

  // onSearchChange(value: string): void {
  //   // Debounce search
  //   if (this.searchTimeout) {
  //     clearTimeout(this.searchTimeout);
  //   }

  //   this.searchTimeout = setTimeout(() => {
  //     this.currentPage.set(1);
  //     this.loadUsers();
  //   }, 500);
  // }

  // onFilterChange(): void {
  //   this.currentPage.set(1);
  //   this.loadUsers();
  // }

  // onPageSizeChange(): void {
  //   this.pageSize.set(this.pageSizeModel);
  //   this.currentPage.set(1);
  //   this.loadUsers();
  // }

  // previousPage(): void {
  //   if (this.currentPage() > 1) {
  //     this.currentPage.update(p => p - 1);
  //     this.loadUsers();
  //   }
  // }

  // nextPage(): void {
  //   if (this.currentPage() < this.totalPages()) {
  //     this.currentPage.update(p => p + 1);
  //     this.loadUsers();
  //   }
  // }

 viewUser(id: number): void {
    this.dialog.open(UserDetailsDialog, {
      width: '800px',
      maxHeight: '90vh',
      data: { userId: id }
    });
  }

  managePermissions(id: number): void {
    const dialogRef = this.dialog.open(ManagePermissions, {
      width: '900px',
      maxHeight: '90vh',
      data: { userId: id },
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Permissions were updated, reload the user list
        console.log("afterClosed",result);
    if (result === true) {
      this.loadUsers();
    }

      }
    });
  }

  deleteUser(user: User): void {
 const dialogRef = this.dialog.open(ConfirmationDialog, {
      data: {
        title: 'حذف مستخدم',
        message:`هل أنت متأكد من حذف المستخدم "${user.full_name}"؟`,
        confirmText: 'حذف',
        type: 'danger'
      }
    });
dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
            this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (error) => {
          console.error('Failed to delete user:', error);
         this.snackBar.open('فشل حذف المستخدم', 'OK', { duration: 3000 });

        }
      });
      }
    });


  }
}
