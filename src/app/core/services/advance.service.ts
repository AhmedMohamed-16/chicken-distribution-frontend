import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EmployeeAdvance, ApiResponse } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdvanceService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/advances`;

  create(dto: any): Observable<ApiResponse<EmployeeAdvance>> {
    return this.http.post<ApiResponse<EmployeeAdvance>>(this.apiUrl, dto);
  }

  recordReturn(id: number, dto: any): Observable<ApiResponse<EmployeeAdvance>> {
    return this.http.post<ApiResponse<EmployeeAdvance>>(`${this.apiUrl}/${id}/return`, dto);
  }

  getAll(params?: any): Observable<ApiResponse<EmployeeAdvance[]>> {
    return this.http.get<ApiResponse<EmployeeAdvance[]>>(this.apiUrl, { params });
  }

  getPending(params?: any): Observable<ApiResponse<EmployeeAdvance[]>> {
    return this.http.get<ApiResponse<EmployeeAdvance[]>>(`${this.apiUrl}/pending`, { params });
  }

  getById(id: number): Observable<ApiResponse<EmployeeAdvance>> {
    return this.http.get<ApiResponse<EmployeeAdvance>>(`${this.apiUrl}/${id}`);
  }
}
