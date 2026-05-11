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
  readonly isAuthenticated = computed(() => {
    const token = this.tokenSignal();
    const user = this.userSignal();
    if (!token || !user) return false;
    // Check if token is expired
    if (this.isTokenExpired(token)) return false;
    return true;
  });
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

    // Notify backend to blacklist the token
    if (token) {
      this.http.post(`${environment.apiUrl}/auth/logout`, {})
        .subscribe({
          error: () => {} // Silently ignore logout errors
        });
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

          // Store minimal data - NEVER store tokens/permissions in localStorage
          // localStorage only stores a session flag
          sessionStorage.setItem('user_name', response.data.full_name || response.data.username);
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
    return this.permissionsSignal().includes(permission) || this.permissionsSignal().includes('APPLICATION_ADMIN');
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
   * Check if a JWT token is expired by parsing its payload
   */
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!payload.exp) return false;
      const now = Math.floor(Date.now() / 1000);
      return payload.exp < now;
    } catch {
      return true; // If we can't parse, consider it expired
    }
  }

  /**
   * Set authentication data
   * SECURITY: Only store token in memory (signal), not localStorage
   * to prevent XSS-based token theft.
   */
  private setAuthData(token: string, user: User): void {
    this.tokenSignal.set(token);
    this.userSignal.set(user);
    this.permissionsSignal.set(user.permissions?.map(p => p.key) || []);

    // SECURITY NOTE: Tokens are stored in memory only (Angular signals).
    // On page refresh, the user must re-authenticate.
    // This prevents XSS-based token theft from localStorage.
    //
    // For persistent sessions, use HTTP-only cookies instead.
    // localStorage.setItem('token', token); // ❌ REMOVED - Security risk
    // localStorage.setItem('user', JSON.stringify(user)); // ❌ REMOVED - Security risk
  }

  /**
   * Clear authentication data
   */
  private clearAuthData(): void {
    this.tokenSignal.set(null);
    this.userSignal.set(null);
    this.permissionsSignal.set([]);

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('user_name');
  }

  /**
   * Load authentication data from localStorage (backward compatibility)
   * In-memory only is preferred, but we support page reload by checking
   * if a valid session exists.
   */
  private loadFromStorage(): void {
    const token = localStorage.getItem('token');
    const userJson = localStorage.getItem('user');

    if (token && userJson) {
      try {
        // Check if token is expired before loading
        if (this.isTokenExpired(token)) {
          this.clearAuthData();
          return;
        }
        const user = JSON.parse(userJson) as User;
        this.setAuthData(token, user);
      } catch (error) {
        console.error('Failed to parse user data from localStorage', error);
        this.clearAuthData();
      }
    }
  }
}
