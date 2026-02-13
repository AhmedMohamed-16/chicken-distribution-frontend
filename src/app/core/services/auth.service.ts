// src/app/core/services/auth.service.ts
import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { ApiResponse, GroupedPermissions, LoginRequest, LoginResponse, UpdateProfileRequest, User } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  // private readonly TOKEN_KEY = 'auth_token';
  // private readonly USER_KEY = 'current_user';

  // // Signals for reactive state
  // private currentUserSignal = signal<User | null>(this.getUserFromStorage());
  // private tokenSignal = signal<string | null>(this.getTokenFromStorage());

  // // Public computed signals
  // currentUser = this.currentUserSignal.asReadonly();
  // isAdmin = computed(() => this.currentUserSignal()?.role === 'ADMIN');
  // isUser = computed(() => this.currentUserSignal()?.role === 'USER');


  // login(credentials: LoginRequest): Observable<LoginResponse> {
  //   return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, credentials)
  //     .pipe(
  //       tap(response => {
  //         this.setSession(response);
  //         console.log("response",response)
  //         this.router.navigate(['/dashboard']);
  //       }),
  //       catchError(error => {
  //         console.error('Login failed:', error);
  //         return throwError(() => error);
  //       })
  //     );
  // }

  // logout(): void {
  //   const token = this.tokenSignal();

  //   if (token) {
  //     this.http.post(`${environment.apiUrl}/auth/logout`, {})
  //       .subscribe({
  //         error: (err) => console.error('Logout API failed:', err)
  //       });
  //   }

  //   this.clearSession();
  //   this.router.navigate(['/login']);
  // }

  // getToken(): string | null {
  //   return this.tokenSignal();
  // }

  // private setSession(response: LoginResponse): void {
  //   localStorage.setItem(this.TOKEN_KEY, response.token);
  //   localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));

  //   this.tokenSignal.set(response.token);
  //   this.currentUserSignal.set(response.user);
  // }

  // private clearSession(): void {
  //   localStorage.removeItem(this.TOKEN_KEY);
  //   localStorage.removeItem(this.USER_KEY);

  //   this.tokenSignal.set(null);
  //   this.currentUserSignal.set(null);
  // }

  // private getTokenFromStorage(): string | null {
  //   return localStorage.getItem(this.TOKEN_KEY);
  // }

  // private getUserFromStorage(): User | null {
  //   const userJson = localStorage.getItem(this.USER_KEY);
  //   return userJson ? JSON.parse(userJson) : null;
  // }


  // Signals for state
  private userSignal = signal<User | null>(null);
  private tokenSignal = signal<string | null>(null);
  private permissionsSignal = signal<string[]>([]);
  private isLoadingSignal = signal(false);

  // Public readonly signals
  readonly user = this.userSignal.asReadonly();
  readonly token = this.tokenSignal.asReadonly();
  readonly permissions = this.permissionsSignal.asReadonly();
  readonly isLoading = this.isLoadingSignal.asReadonly();

  // Computed values
  readonly isAuthenticated = computed(() => !!this.tokenSignal() && !!this.userSignal());
  readonly currentUserId = computed(() => this.userSignal()?.id ?? null);
  readonly currentUsername = computed(() => this.userSignal()?.username ?? '');
  readonly currentUserFullName = computed(() => this.userSignal()?.full_name ?? '');

  constructor() {
    this.loadFromStorage();
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    this.isLoadingSignal.set(true);

    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.setAuthData(response.data.token, response.data.user);
        }
        this.isLoadingSignal.set(false);
      }),
      catchError(error => {
        this.isLoadingSignal.set(false);
        return throwError(() => error);
      })
    );
  }
  logout(): void {
    const token = this.tokenSignal();

    if (token) {
      // this.http.post(`${environment.apiUrl}/auth/logout`, {})
      //   .subscribe({
      //     error: (err) => console.error('Logout API failed:', err)
      //   });
    }

    this.clearAuthData();
    this.router.navigate(['/login']);
  }

  /**
   * Get current user profile
   */
  getProfile(): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${environment.apiUrl}/auth/profile`).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.userSignal.set(response.data);
          this.permissionsSignal.set(response.data.permissions?.map(p => p.key) || []);

          // Update localStorage
          localStorage.setItem('user', JSON.stringify(response.data));
        }
      })
    );
  }

  /**
   * Update current user profile
   */
  updateProfile(data: UpdateProfileRequest): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${environment.apiUrl}/auth/profile`, data).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.userSignal.set(response.data);
          localStorage.setItem('user', JSON.stringify(response.data));
        }
      })
    );
  }

  /**
   * Get current user permissions grouped by category
   */
  getUserPermissions(): Observable<ApiResponse<{ permissions: string[]; grouped: GroupedPermissions }>> {
    return this.http.get<ApiResponse<{ permissions: string[]; grouped: GroupedPermissions }>>(`${environment.apiUrl}/auth/permissions`);
  }

  /**
   * Check if user has a specific permission
   */
  hasPermission(permission: string): boolean {
    return this.permissionsSignal().includes(permission)||this.permissionsSignal().includes('APPLICATION_ADMIN');
  }

  /**
   * Check if user has any of the given permissions
   */
  hasAnyPermission(permissions: string[]): boolean {
    if (!permissions || permissions.length === 0) {
      return true;
    }

    const userPermissions = this.permissionsSignal();
    return permissions.some(p => userPermissions.includes(p));
  }

  /**
   * Check if user has all of the given permissions
   */
  hasAllPermissions(permissions: string[]): boolean {
    if (!permissions || permissions.length === 0) {
      return true;
    }

    const userPermissions = this.permissionsSignal();
    return permissions.every(p => userPermissions.includes(p));
  }

  /**
   * Check if current user is active
   */
  isUserActive(): boolean {
    return this.userSignal()?.is_active ?? false;
  }

  /**
   * Refresh user data from backend
   */
  refreshUser(): Observable<ApiResponse<User>> {
    return this.getProfile();
  }

  /**
   * Set authentication data
   */
  private setAuthData(token: string, user: User): void {
    this.tokenSignal.set(token);
    this.userSignal.set(user);
    this.permissionsSignal.set(user.permissions?.map(p => p.key) || []);

    // Store in localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  /**
   * Clear authentication data
   */
  private clearAuthData(): void {
    this.tokenSignal.set(null);
    this.userSignal.set(null);
    this.permissionsSignal.set([]);

    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  /**
   * Load authentication data from localStorage
   */
  private loadFromStorage(): void {
    const token = localStorage.getItem('token');
    const userJson = localStorage.getItem('user');

    if (token && userJson) {
      try {
        const user = JSON.parse(userJson) as User;
        this.setAuthData(token, user);
      } catch (error) {
        console.error('Failed to parse user data from localStorage', error);
        this.clearAuthData();
      }
    }
    console.log("userJson",userJson);

  }

}
