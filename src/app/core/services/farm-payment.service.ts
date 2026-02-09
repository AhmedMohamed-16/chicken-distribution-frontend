import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  FarmDebtPayment,
  FarmPaymentRequest,
  FarmPaymentResponse,
  PaymentHistoryResponse,
  ApiResponse
} from '../models';
import { environment } from '../../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class FarmPaymentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/farm-debt-payments`;

  // ============================================
  // PAYMENT OPERATIONS
  // ============================================

  /**
   * Record a new farm payment (bidirectional)
   * Can be FROM_FARM (farm pays us) or TO_FARM (we pay farm)
   */
  recordPayment(request: FarmPaymentRequest): Observable<FarmPaymentResponse> {
    return this.http.post<FarmPaymentResponse>(this.apiUrl, request);
  }

  /**
   * Get payment history for a specific farm
   */
  getPaymentHistory(
    farmId: number,
    options?: {
      limit?: number;
      offset?: number;
      start_date?: string;
      end_date?: string;
    }
  ): Observable<PaymentHistoryResponse> {
    let params = new HttpParams();

    if (options) {
      if (options.limit) params = params.set('limit', options.limit.toString());
      if (options.offset) params = params.set('offset', options.offset.toString());
      if (options.start_date) params = params.set('start_date', options.start_date);
      if (options.end_date) params = params.set('end_date', options.end_date);
    }

    return this.http.get<PaymentHistoryResponse>(
      `${this.apiUrl}/farm/${farmId}`,
      { params }
    );
  }

  /**
   * Get a single payment by ID
   */
  getPaymentById(id: number): Observable<ApiResponse<FarmDebtPayment>> {
    return this.http.get<ApiResponse<FarmDebtPayment>>(`${this.apiUrl}/${id}`);
  }

  /**
   * Delete a payment and reverse its balance impact (Admin only)
   */
  deletePayment(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  // ============================================
  // HELPER METHODS FOR UI
  // ============================================

  /**
   * Get payment direction display text (Arabic)
   */
  getPaymentDirectionDisplay(direction: 'FROM_FARM' | 'TO_FARM'): string {
    return direction === 'FROM_FARM' ? 'استلام من المزرعة' : 'دفع للمزرعة';
  }

  /**
   * Get payment direction icon
   */
  getPaymentDirectionIcon(direction: 'FROM_FARM' | 'TO_FARM'): string {
    return direction === 'FROM_FARM' ? 'arrow_downward' : 'arrow_upward';
  }

  /**
   * Get payment direction color class
   */
  getPaymentDirectionColor(direction: 'FROM_FARM' | 'TO_FARM'): string {
    return direction === 'FROM_FARM' ? 'text-green-600' : 'text-red-600';
  }

  /**
   * Format payment description
   */
  formatPaymentDescription(payment: FarmDebtPayment): string {
    const amount = payment.amount.toFixed(2);
    const direction = payment.payment_direction;

    if (direction === 'FROM_FARM') {
      return `استلام ${amount} ج.م من المزرعة`;
    } else {
      return `دفع ${amount} ج.م للمزرعة`;
    }
  }

  /**
   * Validate payment amount against farm balance
   * Returns validation result with message
   */
  validatePaymentAmount(
    farmBalance: number,
    direction: 'FROM_FARM' | 'TO_FARM',
    amount: number
  ): { valid: boolean; warning?: string } {
    if (direction === 'FROM_FARM') {
      // Farm is paying us
      if (farmBalance < 0) {
        // We owe them, but they're paying us
        return {
          valid: true,
          warning: `تحذير: المزرعة تدفع لنا ${amount} ج.م، ولكننا مدينون لها بمبلغ ${Math.abs(farmBalance).toFixed(2)} ج.م`
        };
      }
      if (amount > farmBalance) {
        return {
          valid: true,
          warning: `تحذير: المبلغ المدفوع (${amount} ج.م) أكبر من الدين الحالي (${farmBalance.toFixed(2)} ج.م)`
        };
      }
    } else {
      // We are paying farm
      if (farmBalance > 0) {
        // They owe us, but we're paying them
        return {
          valid: true,
          warning: `تحذير: ندفع للمزرعة ${amount} ج.م، ولكنها مدينة لنا بمبلغ ${farmBalance.toFixed(2)} ج.م`
        };
      }
      if (amount > Math.abs(farmBalance)) {
        return {
          valid: true,
          warning: `تحذير: المبلغ المدفوع (${amount} ج.م) أكبر من دينا للمزرعة (${Math.abs(farmBalance).toFixed(2)} ج.م)`
        };
      }
    }

    return { valid: true };
  }
}
