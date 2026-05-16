import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SalaryPayment, ApiResponse } from '../models';
import { environment } from '../../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class SalaryService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/salaries`;

  record(dto: any): Observable<ApiResponse<SalaryPayment>> {
    return this.http.post<ApiResponse<SalaryPayment>>(this.apiUrl, dto);
  }

  getAll(params?: any): Observable<ApiResponse<SalaryPayment[]>> {
    return this.http.get<ApiResponse<SalaryPayment[]>>(this.apiUrl, { params });
  }

  getSummary(employeeId?: number, year?: number): Observable<ApiResponse<any>> {
    let params = new HttpParams();
    if (employeeId) params = params.set('employee_id', employeeId.toString());
    if (year) params = params.set('year', year.toString());
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/summary`, { params });
  }
}
