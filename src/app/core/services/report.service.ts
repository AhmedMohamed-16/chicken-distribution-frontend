// src/app/core/services/report.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { ApiResponse, ApiResponseReprt, BuyerDebtsResponse, DateRange, FarmBalancesResponse, PeriodReportResponse } from '../models';
import { environment } from '../../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/reports`;

  getDailyReport(date: string): Observable<ApiResponseReprt> {
    console.log("date",date);

    return this.http.get<ApiResponseReprt>(`${this.apiUrl}/daily-enhanced/${date}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // getPeriodReport(from: string, to: string): Observable<PeriodReport> {
  //   return this.http.get<PeriodReport>(`${this.apiUrl}/period`, {
  //     params: { from, to }
  //   });
  // }

  getPartnerProfits(from: string, to: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/partner-profits`, {
      params: { from, to }
    });
  }

  getFarmDebts(): Observable<FarmBalancesResponse> {
    return this.http.get<FarmBalancesResponse>(`${this.apiUrl}/farm-debts`);
  }

  getBuyerDebts(): Observable<BuyerDebtsResponse> {
    return this.http.get<BuyerDebtsResponse>(`${this.apiUrl}/buyer-debts`);
  }

/**
   * Fetch period report from backend
   * @param dateRange Object containing from and to dates (YYYY-MM-DD format)
   * @returns Observable of PeriodReportResponse
   */
  getPeriodReport(dateRange: DateRange): Observable<PeriodReportResponse> {
    const params = new HttpParams()
      .set('from', dateRange.from)
      .set('to', dateRange.to);

    return this.http.get<PeriodReportResponse>(`${this.apiUrl}/period`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Validate date range before submission
   * @param from Start date
   * @param to End date
   * @returns Validation result with error message if invalid
   */
  validateDateRange(from: Date, to: Date): { valid: boolean; error?: string } {
    if (from > to) {
      return {
        valid: false,
        error: 'تاريخ البداية يجب أن يكون قبل تاريخ النهاية'
      };
    }

    const daysDiff = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 365) {
      return {
        valid: false,
        error: 'الفترة لا يمكن أن تتجاوز 365 يوماً'
      };
    }

    return { valid: true };
  }

  /**
   * Format Date object to YYYY-MM-DD string
   * @param date Date object
   * @returns Formatted date string
   */
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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

    console.error('ReportService error:', errorMessage);
    return throwError(() => errorMessage);
  }
}
