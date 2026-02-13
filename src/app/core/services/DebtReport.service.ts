// debt-report.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BuyerDebtsResponse, BuyerStatementResponse, DateRange, FarmBalancesResponse, FarmStatementResponse } from '../models';


@Injectable({
  providedIn: 'root'
})
export class DebtReportService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Farm Debt Methods
  getFarmBalances(): Observable<FarmBalancesResponse> {
    return this.http.get<FarmBalancesResponse>(`${this.apiUrl}/reports/farm-balances`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getFarmReceivables(): Observable<FarmBalancesResponse> {
    return this.http.get<FarmBalancesResponse>(`${this.apiUrl}/reports/farm-receivables`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getFarmPayables(): Observable<FarmBalancesResponse> {
    return this.http.get<FarmBalancesResponse>(`${this.apiUrl}/reports/farm-payables`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getFarmStatement(farmId: number, dateRange?: DateRange): Observable<FarmStatementResponse> {
    let params = new HttpParams();
    if (dateRange) {
      if (dateRange.from) {
        params = params.set('start_date', dateRange.from);
      }
      if (dateRange.to) {
        params = params.set('end_date', dateRange.to);
      }
    }

    return this.http.get<FarmStatementResponse>(
      `${this.apiUrl}/reports/farm-statement/${farmId}`,
      { params }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Buyer Debt Methods
  getBuyerDebts(): Observable<BuyerDebtsResponse> {
    return this.http.get<BuyerDebtsResponse>(`${this.apiUrl}/reports/buyer-debts`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getBuyerStatement(buyerId: number, dateRange?: DateRange): Observable<BuyerStatementResponse> {
    let params = new HttpParams();
    if (dateRange) {
      if (dateRange.from) {
        params = params.set('start_date', dateRange.from);
      }
      if (dateRange.to) {
        params = params.set('end_date', dateRange.to);
      }
    }

    return this.http.get<BuyerStatementResponse>(
      `${this.apiUrl}/reports/buyer-statement/${buyerId}`,
      { params }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Error Handling
  private handleError(error: any): Observable<never> {
    let errorMessage = 'حدث خطأ في تحميل البيانات';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `خطأ: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = error.error?.message || `خطأ في الخادم: ${error.status}`;
    }

    console.error('API Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}
