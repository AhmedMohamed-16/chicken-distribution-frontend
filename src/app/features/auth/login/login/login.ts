 import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
 private fb = inject(FormBuilder);
  private authService:AuthService = inject(AuthService);
private router = inject(Router);
  hidePassword = signal(true);
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  loginForm = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.loading.set(true);
    this.errorMessage.set(null);

    this.authService.login(this.loginForm.getRawValue()).subscribe({
       next: (response) => {
        if (response.success) {
           this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage.set(response.message || 'فشل تسجيل الدخول');
          this.loading.set(false);
        }
      },
      error: (error:any) => {
        this.loading.set(false);
        this.errorMessage.set(
          error.error?.message || 'فشل تسجيل الدخول. تحقق من بيانات الدخول.'
        );
      }
    });
  }

  // private fb = inject(FormBuilder);
  // private authService = inject(AuthService);
  // private router = inject(Router);

  // isLoading = signal(false);
  // errorMessage = signal<string>('');

  // loginForm = this.fb.group({
  //   username: ['', [Validators.required]],
  //   password: ['', [Validators.required]]
  // });

  // onSubmit(): void {
  //   if (this.loginForm.invalid) {
  //     this.loginForm.markAllAsTouched();
  //     return;
  //   }

  //   this.isLoading.set(true);
  //   this.errorMessage.set('');

  //   const credentials = {
  //     username: this.loginForm.value.username!,
  //     password: this.loginForm.value.password!
  //   };

  //   this.authService.login(credentials).subscribe({
  //     next: (response) => {
  //       if (response.success) {
  //          this.router.navigate(['/dashboard']);
  //       } else {
  //         this.errorMessage.set(response.message || 'فشل تسجيل الدخول');
  //         this.isLoading.set(false);
  //       }
  //     },
  //     error: (error) => {
  //       console.error('Login error:', error);
  //       this.errorMessage.set(
  //         error.error?.message ||
  //         error.error?.error ||
  //         'اسم المستخدم أو كلمة المرور غير صحيحة'
  //       );
  //       this.isLoading.set(false);
  //     }
  //   });
  // }
}
