// src/app/core/services/farm.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Farm, PaginatedResponse, PaginationParams } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FarmService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/farms`;

  getAll(): Observable<Farm[]> {
    return this.http.get<Farm[]>(this.apiUrl);
  }
 getPaginationAll(params?: PaginationParams): Observable<PaginatedResponse<Farm>> {
    let httpParams = new HttpParams();

    if (params?.page !== undefined) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params?.limit !== undefined) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }
    if (params?.search) {
      httpParams = httpParams.set('search', params.search);
    }
    if (params?.has_debt !== undefined) {
      httpParams = httpParams.set('has_debt', params.has_debt);
    }

    return this.http.get<PaginatedResponse<Farm>>(`${environment.apiUrl}/paginate-farms`, { params: httpParams });
  }

  getById(id: number): Observable<Farm> {
    return this.http.get<Farm>(`${this.apiUrl}/${id}`);
  }

  create(farm: Partial<Farm>): Observable<Farm> {
    return this.http.post<Farm>(this.apiUrl, farm);
  }

  update(id: number, farm: Partial<Farm>): Observable<Farm> {
    return this.http.put<Farm>(`${this.apiUrl}/${id}`, farm);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

 // ============================================
  // BALANCE & DEBT OPERATIONS (Updated)
  // ============================================

  /**
   * Get debt history for a farm
   * Returns both transactions and payments
   */
  getDebtHistory(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}/debt-history`);
  }

  /**
   * Get farms with active balances (non-zero)
   * Returns farms that have either receivables or payables
   */
  getActiveBalances(): Observable<ApiResponse<Farm[]>> {
    return this.http.get<ApiResponse<Farm[]>>(`${this.apiUrl}/active-balances`);
  }

  /**
   * Get farms that owe us money (receivables)
   * current_balance > 0
   */
  getReceivables(): Observable<ApiResponse<Farm[]>> {
    return this.http.get<ApiResponse<Farm[]>>(`${this.apiUrl}/receivables`);
  }

  /**
   * Get farms we owe money to (payables)
   * current_balance < 0
   */
  getPayables(): Observable<ApiResponse<Farm[]>> {
    return this.http.get<ApiResponse<Farm[]>>(`${this.apiUrl}/payables`);
  }

  /**
   * Get net farm position summary
   * Returns totals for receivables, payables, and net position
   */
  getNetPosition(): Observable<ApiResponse<{
    total_receivables: number;
    total_payables: number;
    net_position: number;
    receivables_count: number;
    payables_count: number;
    position_type: 'NET_RECEIVABLE' | 'NET_PAYABLE' | 'BALANCED';
  }>> {
    return this.http.get<any>(`${this.apiUrl}/net-position`);
  }

  // ============================================
  // HELPER METHODS FOR UI
  // ============================================

  /**
   * Get balance type display for UI
   */
  getBalanceTypeDisplay(farm: Farm): string {
    const balance = farm.current_balance;
    if (balance > 0) return 'دائن لنا'; // Farm owes us
    if (balance < 0) return 'مدين لنا'; // We owe farm
    return 'مسوى'; // Settled
  }

  /**
   * Get balance color class for UI
   */
  getBalanceColorClass(farm: Farm): string {
    const balance = farm.current_balance;
    if (balance > 0) return 'text-green-600'; // Receivable (good)
    if (balance < 0) return 'text-red-600'; // Payable (we owe)
    return 'text-gray-600'; // Settled
  }

  /**
   * Format balance for display
   */
  formatBalance(farm: Farm): string {
    const balance = Math.abs(farm.current_balance);
    const formatted = balance.toFixed(2);

    if (farm.current_balance > 0) {
      return `لنا${formatted} ج.م`; // Farm owes us
    } else if (farm.current_balance < 0) {
      return `علينا${formatted} ج.م`; // We owe farm
    } else {
      return '0.00 ج.م';
    }
  }

  /**
   * Get detailed balance description
   */
  getBalanceDescription(farm: Farm): string {
    const balance = Math.abs(farm.current_balance);
    const formatted = balance.toFixed(2);

    if (farm.current_balance > 0) {
      return `المزرعة مدينة لنا بمبلغ ${formatted} جنيه`;
    } else if (farm.current_balance < 0) {
      return `نحن مدينون للمزرعة بمبلغ ${formatted} جنيه`;
    } else {
      return 'الحساب مسوى';
    }
  }
}





