// src/app/core/services/farm.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Buyer, CostCategory, Farm, PaginatedResponse, PaginationParams } from '../models';
import { environment } from '../../../environments/environment.prod';

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
  getDebtHistory(id: number, params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.startDate) httpParams = httpParams.set('startDate', params.startDate);
    if (params?.endDate) httpParams = httpParams.set('endDate', params.endDate);
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());

    return this.http.get(`${this.apiUrl}/${id}/debt-history`, { params: httpParams });
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
 getBalanceColorClass(entity: Farm | Buyer | CostCategory) {
  const balance = entity.current_balance ?? 0;

  return {
    'text-green-600': balance > 0,
    'text-red-600': balance < 0,
    'text-gray-600': balance === 0,
  };
}

  /**
   * Format balance for display
   */
 formatBalance(farm: Farm | Buyer | CostCategory): string {
  const currentBalance = farm.current_balance ?? 0;

  const balance = Math.abs(currentBalance);
  const formatted = balance.toFixed(2);

  if (currentBalance > 0) {
    return `لنا ${formatted} ج.م`;
  } else if (currentBalance < 0) {
    return `علينا ${formatted} ج.م`;
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





