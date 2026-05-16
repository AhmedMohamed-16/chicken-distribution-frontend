// ============================================================
// FRONTEND: src/app/core/services/partner-profit.service.ts
// Updated getWithdrawals() to accept page + limit params
// ============================================================

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PartnerBalance, PartnerWithdrawal, ApiResponse, PartnerReinvestment, PartnerTransaction } from '../models';
import { environment } from '../../../environments/environment.prod';

export interface WithdrawalsMeta {
  page:       number;
  limit:      number;
  total:      number;
  hasMore:    boolean;
  totalPages: number;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  count:   number;
  data:    T[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
    totalPages?: number;
  };
}

@Injectable({ providedIn: 'root' })
export class PartnerProfitService {
  private http    = inject(HttpClient);
  private apiUrl  = `${environment.apiUrl}/partners`;

  getAllBalances(
    page  = 1,
    limit = 20
  ): Observable<ApiResponse<PartnerBalance[] & { meta?: { page: number; limit: number; total: number; hasMore: boolean } }>> {
    const params = new HttpParams()
      .set('page',  page.toString())
      .set('limit', limit.toString());

    return this.http.get<ApiResponse<PartnerBalance[] & { meta?: { page: number; limit: number; total: number; hasMore: boolean } }>>(
      `${this.apiUrl}/balances`,
      { params }
    );
  }

  getBalance(id: number): Observable<ApiResponse<PartnerBalance>> {
    return this.http.get<ApiResponse<PartnerBalance>>(`${this.apiUrl}/${id}/balance`);
  }

  /**
   * Fetch paginated withdrawals for a partner.
   * @param id        Partner ID
   * @param page      Page number (1-based)
   * @param limit     Items per page (default 10)
   * @param from      Optional ISO date filter
   * @param to        Optional ISO date filter
   */
  /**
   * Generic paginated response
   */
  getWithdrawals(
    id:    number,
    page   = 1,
    limit  = 10,
    from?: string,
    to?:   string
  ): Observable<PaginatedResponse<PartnerWithdrawal>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);

    return this.http.get<PaginatedResponse<PartnerWithdrawal>>(
      `${this.apiUrl}/${id}/withdrawals`,
      { params }
    );
  }

  recordReinvestment(id: number, data: { amount: number; reinvest_date: string; notes?: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/reinvest`, data);
  }

  getReinvestments(
    id: number,
    page = 1,
    limit = 10,
    from?: string,
    to?: string
  ): Observable<PaginatedResponse<PartnerReinvestment>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);

    return this.http.get<PaginatedResponse<PartnerReinvestment>>(
      `${this.apiUrl}/${id}/reinvestments`,
      { params }
    );
  }

  getTransactionsHistory(
    id: number,
    page = 1,
    limit = 10,
    from?: string,
    to?: string
  ): Observable<PaginatedResponse<PartnerTransaction>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);

    return this.http.get<PaginatedResponse<PartnerTransaction>>(
      `${this.apiUrl}/${id}/transactions`,
      { params }
    );
  }

  recordWithdrawal(id: number, dto: any): Observable<ApiResponse<PartnerWithdrawal>> {
    return this.http.post<ApiResponse<PartnerWithdrawal>>(
      `${this.apiUrl}/${id}/withdrawal`,
      dto
    );
  }
}
