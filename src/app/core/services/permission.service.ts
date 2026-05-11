import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Permission, CreatePermissionRequest, UpdatePermissionRequest, GroupedPermissions } from '../models/index';
import { ApiResponse } from '../models';
import { environment } from '../../../environments/environment';


export interface GetPermissionsParams {
  grouped?: boolean;
  category?: string;
  is_active?: boolean;
}

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/permissions`;

  /**
   * Get all permissions with optional grouping and filtering
   */
  getPermissions(params?: GetPermissionsParams): Observable<ApiResponse<Permission[] | GroupedPermissions>> {
    let httpParams = new HttpParams();

    if (params?.grouped) {
      httpParams = httpParams.set('grouped', 'true');
    }
    if (params?.category) {
      httpParams = httpParams.set('category', params.category);
    }
    if (params?.is_active !== undefined) {
      httpParams = httpParams.set('is_active', params.is_active.toString());
    }

    return this.http.get<ApiResponse<Permission[] | GroupedPermissions>>(this.baseUrl, { params: httpParams });
  }

  /**
   * Get permission by ID
   */
  getPermission(id: number): Observable<ApiResponse<Permission>> {
    return this.http.get<ApiResponse<Permission>>(`${this.baseUrl}/${id}`);
  }

  /**
   * Create new permission
   */
  createPermission(permission: CreatePermissionRequest): Observable<ApiResponse<Permission>> {
    return this.http.post<ApiResponse<Permission>>(this.baseUrl, permission);
  }

  /**
   * Update existing permission
   */
  updatePermission(id: number, permission: UpdatePermissionRequest): Observable<ApiResponse<Permission>> {
    return this.http.put<ApiResponse<Permission>>(`${this.baseUrl}/${id}`, permission);
  }

  /**
   * Delete permission
   */
  deletePermission(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
  }

  /**
   * Toggle permission active status
   */
  togglePermissionStatus(id: number): Observable<ApiResponse<Permission>> {
    return this.http.patch<ApiResponse<Permission>>(`${this.baseUrl}/${id}/toggle-status`, {});
  }

  /**
   * Get permissions by category
   */
  getPermissionsByCategory(category: string): Observable<ApiResponse<Permission[]>> {
    return this.http.get<ApiResponse<Permission[]>>(`${this.baseUrl}/category/${category}`);
  }

  /**
   * Get all permissions grouped by category
   */
  getGroupedPermissions(): Observable<ApiResponse<GroupedPermissions>> {
    return this.getPermissions({ grouped: true }) as Observable<ApiResponse<GroupedPermissions>>;
  }
}
