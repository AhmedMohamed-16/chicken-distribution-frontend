import { Component, inject, signal, input, OnInit, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'; // Optional: for dialog usage
import { Permission, User } from '../../../core/models';
import { UserService } from '../../../core/services/user.service';
import { PermissionService } from '../../../core/services/permission.service';

@Component({
   selector: 'app-manage-permissions',

  templateUrl: './manage-permissions.html',
  styleUrl: './manage-permissions.css',

  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,

})
export class ManagePermissions implements OnInit {
  private userService = inject(UserService);
  private permissionService = inject(PermissionService);

  // For standalone usage (route-based)
  userId = input<number>(0);

  // For dialog usage (Angular Material)
  // private dialogRef = inject(MatDialogRef<ManageUserPermissionsComponent>, { optional: true });
  // private dialogData = inject(MAT_DIALOG_DATA, { optional: true });

  // Output for when used as child component
  permissionsUpdated = output<void>();
  cancelled = output<void>();
  private dialogRef = inject(MatDialogRef<ManagePermissions>, { optional: true });
  private dialogData = inject(MAT_DIALOG_DATA, { optional: true });

  user = signal<User | null>(null);
  groupedPermissions = signal<Record<string, Permission[]>>({});
  selectedPermissions = signal<number[]>([]);
  loading = signal(true);
  saving = signal(false);

  Object = Object;

  ngOnInit(): void {
    // Get userId from input or dialog data
    const id = this.userId() || this.dialogData?.userId;

    if (!id) {
      console.error('No user ID provided');
      this.close();
      return;
    }

    this.loadData(id);
  }

  loadData(userId: number): void {
    this.loading.set(true);

    // Load user and permissions in parallel
    Promise.all([
      this.userService.getUser(userId).toPromise(),
      this.permissionService.getPermissions({ grouped: true }).toPromise()
    ]).then(([userResponse, permissionsResponse]) => {
      if (userResponse?.success && userResponse.data) {
        this.user.set(userResponse.data);
        this.selectedPermissions.set(
          userResponse.data.permissions?.map(p => p.id) || []
        );
      }

      if (permissionsResponse?.success && permissionsResponse.data) {
        this.groupedPermissions.set(permissionsResponse.data as Record<string, Permission[]>);
      }

      this.loading.set(false);
    }).catch(error => {
      console.error('Error loading data:', error);
      this.loading.set(false);
    });
  }

  togglePermission(permissionId: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;

    this.selectedPermissions.update(selected => {
      if (checked) {
        return [...selected, permissionId];
      } else {
        return selected.filter(id => id !== permissionId);
      }
    });
  }

  toggleCategory(category: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const categoryPermissions = this.groupedPermissions()[category];
    const categoryIds = categoryPermissions.map(p => p.id);

    this.selectedPermissions.update(selected => {
      if (checked) {
        // Add all category permissions
        return [...new Set([...selected, ...categoryIds])];
      } else {
        // Remove all category permissions
        return selected.filter(id => !categoryIds.includes(id));
      }
    });
  }

  isCategoryFullySelected(category: string): boolean {
    const categoryIds = this.groupedPermissions()[category].map(p => p.id);
    return categoryIds.every(id => this.selectedPermissions().includes(id));
  }

  isCategoryPartiallySelected(category: string): boolean {
    const categoryIds = this.groupedPermissions()[category].map(p => p.id);
    const selected = this.selectedPermissions();
    const someSelected = categoryIds.some(id => selected.includes(id));
    const allSelected = categoryIds.every(id => selected.includes(id));
    return someSelected && !allSelected;
  }

  getCategorySelectedCount(category: string): number {
    const categoryIds = this.groupedPermissions()[category].map(p => p.id);
    return categoryIds.filter(id => this.selectedPermissions().includes(id)).length;
  }

  save(): void {
    if (!this.user()) return;

    this.saving.set(true);

    this.userService.assignPermissions(this.user()!.id, this.selectedPermissions())
      .subscribe({
        next: (response) => {
          if (response.success) {

            this.permissionsUpdated.emit();
            this.dialogRef?.close(true);

            // Close dialog or navigate back
            this.close();
          }
        },
        error: (error) => {
          console.error('Error saving permissions:', error);
          this.saving.set(false);
          // Show error toast
        }
      });
  }

  close(): void {

this.cancelled.emit();
    this.dialogRef?.close(true);

    // If used as route, navigate back
    // this.router.navigate(['/users']);
  }
}
