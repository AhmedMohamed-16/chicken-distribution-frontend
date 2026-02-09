import { Component, signal, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { GroupedPermissions } from '../../../core/models/index';
import { CATEGORY_NAMES } from '../../../core/constants/Permissions.constant';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  user = this.authService.user;
  groupedPermissions = signal<GroupedPermissions>({});
  loadingPermissions = signal(true);
  updatingProfile = signal(false);
  changingPassword = signal(false);
private snackBar = inject(MatSnackBar);
  Object = Object;

  profileForm = this.fb.group({
    full_name: [this.user()?.full_name || '', Validators.required],
    email: [this.user()?.email || '', Validators.email],
    phone: [this.user()?.phone || '']
  });

  passwordForm = this.fb.group({
    current_password: ['', Validators.required],
    new_password: ['', [Validators.required, Validators.minLength(6)]],
    confirm_password: ['', Validators.required]
  }, {
    validators: this.passwordMatchValidator
  });

  ngOnInit(): void {
    this.loadPermissions();
  }

  loadPermissions(): void {
    this.loadingPermissions.set(true);

    this.authService.getUserPermissions().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.groupedPermissions.set(response.data.grouped);
        }
        this.loadingPermissions.set(false);
      },
      error: (error) => {
        console.error('Failed to load permissions:', error);
        this.loadingPermissions.set(false);
      }
    });
  }

  updateProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.updatingProfile.set(true);

    this.authService.updateProfile(this.profileForm.value as any).subscribe({
      next: () => {

        this.snackBar.open('تم تحديث المعلومات بنجاح', 'OK', { duration: 3000 });
        this.updatingProfile.set(false);
      },
      error: (error) => {
        console.error('Failed to update profile:', error);
                 this.snackBar.open('فشل تحديث المعلومات', 'OK', { duration: 3000 });

        this.updatingProfile.set(false);
      }
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.changingPassword.set(true);

    const { current_password, new_password } = this.passwordForm.value;

    this.authService.updateProfile({
      current_password: current_password!,
      new_password: new_password!
    }).subscribe({
      next: () => {
        this.passwordForm.reset();
      this.snackBar.open('تم تغيير كلمة المرور بنجاح', 'OK', { duration: 3000 });

        this.changingPassword.set(false);
      },
      error: (error) => {
        console.error('Failed to change password:', error);
        this.snackBar.open(error.error?.message || 'فشل تغيير كلمة المرور', 'OK', { duration: 3000 });

        this.changingPassword.set(false);
      }
    });
  }

  getCategoryName(category: string): string {
    return CATEGORY_NAMES[category] || category;
  }

  private passwordMatchValidator(form: any): { passwordMismatch: boolean } | null {
    const newPassword = form.get('new_password')?.value;
    const confirmPassword = form.get('confirm_password')?.value;

    if (!newPassword || !confirmPassword) {
      return null;
    }

    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }
}
