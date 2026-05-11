import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Safe, SafeDashboard, SafeLedgerResponse, SafeTransfer, ApiResponse } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SafeService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/safes`;
  private transfersUrl = `${environment.apiUrl}/safe-transfers`;

  getAll(): Observable<ApiResponse<Safe[]>> {
    return this.http.get<ApiResponse<Safe[]>>(this.apiUrl);
  }

  getById(id: number): Observable<ApiResponse<Safe>> {
    return this.http.get<ApiResponse<Safe>>(`${this.apiUrl}/${id}`);
  }

getDashboard(includeInactive = false): Observable<ApiResponse<SafeDashboard[]>> {
  const params = includeInactive ? { params: { include_inactive: 'true' } } : {};
  console.log("getDashboard",params);

  return this.http.get<ApiResponse<SafeDashboard[]>>(`${this.apiUrl}/dashboard`, params);
}

  getLedger(id: number, from: string, to: string): Observable<ApiResponse<SafeLedgerResponse>> {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.http.get<ApiResponse<SafeLedgerResponse>>(`${this.apiUrl}/${id}/ledger`, { params });
  }

  create(dto: Partial<Safe>): Observable<ApiResponse<Safe>> {
    return this.http.post<ApiResponse<Safe>>(this.apiUrl, dto);
  }

  update(id: number, dto: Partial<Safe>): Observable<ApiResponse<Safe>> {
    return this.http.put<ApiResponse<Safe>>(`${this.apiUrl}/${id}`, dto);
  }

  createTransfer(dto: any): Observable<ApiResponse<SafeTransfer>> {
    return this.http.post<ApiResponse<SafeTransfer>>(this.transfersUrl, dto);
  }


  getTransfers(params?: any): Observable<ApiResponse<SafeTransfer[]>> {
    return this.http.get<ApiResponse<SafeTransfer[]>>(this.transfersUrl, { params });
  }
}
