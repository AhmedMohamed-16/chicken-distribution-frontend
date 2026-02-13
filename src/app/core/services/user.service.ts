import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, CreateUserRequest, UpdateUserRequest,ApiResponse, PaginatedResponse, PaginationParams } from '../models/index';
import { environment } from '../../../environments/environment.prod';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/users`;

  /**
   * Get paginated list of users
   */
  getUsers(): Observable<ApiResponse<User[]>> {
    return this.http.get<ApiResponse<User[]>>(this.baseUrl);
  }

  // getUsers(params?: PaginationParams): Observable<PaginatedResponse<User>> {
  //   let httpParams = new HttpParams();

  //   if (params?.page !== undefined) {
  //     httpParams = httpParams.set('page', params.page.toString());
  //   }
  //   if (params?.limit !== undefined) {
  //     httpParams = httpParams.set('limit', params.limit.toString());
  //   }
  //   if (params?.search) {
  //     httpParams = httpParams.set('search', params.search);
  //   }
  //   if (params?.is_active !== undefined) {
  //     httpParams = httpParams.set('is_active', params.is_active.toString());
  //   }

  //   return this.http.get<PaginatedResponse<User>>(this.baseUrl, { params: httpParams });
  // }

  /**
   * Get user by ID
   */
  getUser(id: number): Observable<ApiResponse<User>> {
    console.log("getUser");

    return this.http.get<ApiResponse<User>>(`${this.baseUrl}/${id}`);
  }

  /**
   * Create new user
   */
  createUser(user: CreateUserRequest): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(this.baseUrl, user);
  }

  /**
   * Update existing user
   */
  updateUser(id: number, user: UpdateUserRequest): Observable<ApiResponse<User>> {
    console.log("updateUser",user);

    return this.http.put<ApiResponse<User>>(`${this.baseUrl}/${id}`, user);
  }

  /**
   * Delete user
   */
  deleteUser(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
  }

  /**
   * Assign permissions to user
   */
  assignPermissions(userId: number, permissionIds: number[]): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(
      `${this.baseUrl}/${userId}/permissions`,
      { permission_ids: permissionIds }
    );
  }

  /**
   * Revoke single permission from user
   */
  revokePermission(userId: number, permissionId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.baseUrl}/${userId}/permissions/${permissionId}`
    );
  }

  /**
   * Toggle user active status
   */
  toggleUserStatus(id: number): Observable<ApiResponse<User>> {
    return this.http.patch<ApiResponse<User>>(`${this.baseUrl}/${id}/toggle-status`, {});
  }

  /**
   * Reset user password (admin only)
   */
  resetPassword(id: number, newPassword: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.baseUrl}/${id}/reset-password`, {
      new_password: newPassword
    });
  }

  /**
   * Get user statistics
   */
  getUserStats(): Observable<ApiResponse<{
    total: number;
    active: number;
    inactive: number;
  }>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/stats`);
  }
}
