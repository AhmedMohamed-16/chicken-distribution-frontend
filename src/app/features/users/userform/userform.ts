import { Component, signal, inject, OnInit, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { PermissionService } from '../../../core/services/permission.service';
import { GroupedPermissions } from '../../../core/models';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-userform',
  imports: [CommonModule, ReactiveFormsModule],
    changeDetection: ChangeDetectionStrategy.OnPush,

  templateUrl: './userform.html',
  styleUrl: './userform.css',
})
export class Userform implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private permissionService = inject(PermissionService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loading = signal(false);
  loadingPermissions = signal(false);
  submitting = signal(false);
  groupedPermissions = signal<GroupedPermissions>({});
  selectedPermissions = signal<number[]>([]);
private snackBar = inject(MatSnackBar);
  Object = Object;
  userId: number | null = null;

  isEditMode = signal(false);

  userForm = this.fb.group({
    username: ['', [Validators.required]],
    password: [''],
    confirmPassword: [''],
    full_name: ['', [Validators.required]],
    email: ['', [Validators.email]],
    phone: [''],
    is_active: [true]
  }, { validators: this.passwordMatchValidator });

  ngOnInit(): void {
    // Check if we're in edit mode
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.userId = +id;
        this.isEditMode.set(true);
        this.loadUser(this.userId);
        console.log();

        // Remove password validators in edit mode
        this.userForm.get('password')?.clearValidators();
        this.userForm.get('confirmPassword')?.clearValidators();
      } else {
        // Add password validators in create mode
        this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
        this.userForm.get('confirmPassword')?.setValidators([Validators.required]);
      }

      this.userForm.get('password')?.updateValueAndValidity();
      this.userForm.get('confirmPassword')?.updateValueAndValidity();
    });

    this.loadPermissions();
  }

  loadUser(id: number): void {
    this.loading.set(true);

    this.userService.getUser(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const user = response.data;
          console.log("user",user);

          this.userForm.patchValue({
            username: user.username,
            full_name: user.full_name,
            email: user.email || '',
            phone: user.phone || '',
            is_active: user.is_active
          });

          // Set selected permissions
          this.selectedPermissions.set(user.permissions?.map(p => p.id) || []);
          console.log(this.selectedPermissions());

        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Failed to load user:', error);
        this.loading.set(false);
      }
    });
  }

  loadPermissions(): void {
    this.loadingPermissions.set(true);

    this.permissionService.getGroupedPermissions().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.groupedPermissions.set(response.data);
        }
        this.loadingPermissions.set(false);
      },
      error: (error) => {
        console.error('Failed to load permissions:', error);
        this.loadingPermissions.set(false);
      }
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
        // Add all permissions from this category
        return [...new Set([...selected, ...categoryIds])];
      } else {
        // Remove all permissions from this category
        return selected.filter(id => !categoryIds.includes(id));
      }
    });
  }

  isCategoryFullySelected(category: string): boolean {
    const categoryIds = this.groupedPermissions()[category]?.map(p => p.id) || [];
    const selected = this.selectedPermissions();
    return categoryIds.length > 0 && categoryIds.every(id => selected.includes(id));
  }

  isCategoryPartiallySelected(category: string): boolean {
    const categoryIds = this.groupedPermissions()[category]?.map(p => p.id) || [];
    const selected = this.selectedPermissions();
    const someSelected = categoryIds.some(id => selected.includes(id));
    const allSelected = categoryIds.every(id => selected.includes(id));
    return someSelected && !allSelected;
  }

  getCategoryName(category: string): string {
    const names: Record<string, string> = {
      'USERS': 'المستخدمين',
      'PARTNERS': 'الشركاء',
      'FARMS': 'المزارع',
      'BUYERS': 'المشترين',
      'VEHICLES': 'المركبات',
      'OPERATIONS': 'عمليات التوزيع',
      'REPORTS': 'التقارير'
    };
    return names[category] || category;
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);

    const formValue = this.userForm.value;
    const userData: any = {
      username: formValue.username,
      full_name: formValue.full_name,
      email: formValue.email || undefined,
      phone: formValue.phone || undefined,
      is_active: formValue.is_active,
      permission_ids: this.selectedPermissions()
    };

    if (!this.isEditMode()) {
      userData.password = formValue.password;
    }
    console.log("userData",userData);

    const request = this.isEditMode() && this.userId
      ? this.userService.updateUser(this.userId, userData)
      : this.userService.createUser(userData);

    request.subscribe({
      next: () => {
        this.router.navigate(['/master-data/users']);
      },
      error: (error) => {
        console.error('Failed to save user:', error);
        this.snackBar.open(error.error?.message || 'فشل حفظ المستخدم', 'OK', { duration: 3000 });

        this.submitting.set(false);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/master-data/users']);
  }

  private passwordMatchValidator(form: any): { passwordMismatch: boolean } | null {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    // Only validate if both fields have values
    if (!password || !confirmPassword) {
      return null;
    }

    return password === confirmPassword ? null : { passwordMismatch: true };
  }
}





