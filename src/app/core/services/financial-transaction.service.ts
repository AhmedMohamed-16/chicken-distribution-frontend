import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FinancialTransaction, FinancialSummaryResponse, ApiResponse } from '../models';
import { environment } from '../../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class FinancialTransactionService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/financial-transactions`;

  getAll(params?: any): Observable<ApiResponse<FinancialTransaction[]>> {
    return this.http.get<ApiResponse<FinancialTransaction[]>>(this.apiUrl, { params });
  }

  getSummary(date?: string): Observable<FinancialSummaryResponse> {
    const params = date ? new HttpParams().set('date', date) : undefined;
    return this.http.get<FinancialSummaryResponse>(`${this.apiUrl}/summary`, { params });
  }
}
