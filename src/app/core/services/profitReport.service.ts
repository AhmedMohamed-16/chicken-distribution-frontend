/**
 * =========================
 * خدمة تقارير الأرباح
 * =========================
 * المسؤولة عن التواصل مع واجهات برمجة تطبيقات تقارير الأرباح
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import {
  ProfitAnalysisReport,
  ProfitAnalysisResponse,
  ProfitDistributionResponse,
  ProfitLeakageReport,
  ProfitLeakageResponse,
  ProfitSummaryReport,
  ProfitSummaryResponse
} from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProfitReportService {
  private readonly http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/reports`;

  /**
   * جلب تقرير تحليل الأرباح الكامل
   */
  getProfitAnalysis(from: string, to: string): Observable<ProfitAnalysisReport> {
    const params = new HttpParams().set('from', from).set('to', to);

    return this.http
      .get<ProfitAnalysisResponse>(`${this.baseUrl}/profit-analysis`, { params })
      .pipe(
        retry(1),
        map(response => {
          if (!response.success || !response.data) {
            throw new Error('تعذر تحميل تقرير تحليل الأرباح');
          }
          return response.data;
        }),
        catchError(this.handleError)
      );
  }

  /**
   * جلب ملخص الأرباح (سريع)
   */
  getProfitSummary(from: string, to: string): Observable<ProfitSummaryReport> {
    const params = new HttpParams().set('from', from).set('to', to);

    return this.http
      .get<ProfitSummaryResponse>(`${this.baseUrl}/profit-summary`, { params })
      .pipe(
        retry(1),
        map(response => {
          if (!response.success || !response.data) {
            throw new Error('تعذر تحميل ملخص الأرباح');
          }
          return response.data;
        }),
        catchError(this.handleError)
      );
  }

  /**
   * جلب تحليل تسرب الأرباح
   */
  getProfitLeakage(from: string, to: string): Observable<ProfitLeakageReport> {
    const params = new HttpParams().set('from', from).set('to', to);

    return this.http
      .get<ProfitLeakageResponse>(`${this.baseUrl}/profit-leakage`, { params })
      .pipe(
        retry(1),
        map(response => {
          if (!response.success || !response.data) {
            throw new Error('تعذر تحميل تحليل تسرب الأرباح');
          }
          return response.data;
        }),
        catchError(this.handleError)
      );
  }

  /**
   * التحقق من صحة تنسيق التاريخ (YYYY-MM-DD)
   */
  isValidDateFormat(date: string): boolean {
    return /^\d{4}-\d{2}-\d{2}$/.test(date);
  }

  /**
   * التحقق من صحة نطاق التاريخ
   */
  validateDateRange(from: string, to: string): string | null {
    if (!this.isValidDateFormat(from) || !this.isValidDateFormat(to)) {
      return 'تنسيق التاريخ غير صحيح (YYYY-MM-DD)';
    }

    const startDate = new Date(from);
    const endDate = new Date(to);

    if (startDate > endDate) {
      return 'تاريخ البداية يجب أن يسبق تاريخ النهاية';
    }

    const daysDiff =
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);

    if (daysDiff > 365) {
      return 'الفترة الزمنية كبيرة جداً (الحد الأقصى سنة واحدة)';
    }

    return null;
  }

  /**
   * تنسيق التاريخ إلى YYYY-MM-DD
   */
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * آخر عدد محدد من الأيام
   */
  getLastNDays(days: number): { from: string; to: string } {
    const to =new Date();
    const from =new Date();
    from.setDate(from.getDate() - days);

    return {
      from: this.formatDate(from),
      to: this.formatDate(to)
    };
  }

  /**
   * الشهر الحالي
   */
  getCurrentMonth(): { from: string; to: string } {
    const now = new Date();
    return {
      from: this.formatDate(new Date(now.getFullYear(), now.getMonth(), 1)),
      to: this.formatDate(new Date(now.getFullYear(), now.getMonth() + 1, 0))
    };
  }

  /**
   * الشهر السابق
   */
  getPreviousMonth(): { from: string; to: string } {
    const now = new Date();
    return {
      from: this.formatDate(new Date(now.getFullYear(), now.getMonth() - 1, 1)),
      to: this.formatDate(new Date(now.getFullYear(), now.getMonth(), 0))
    };
  }

  /**
   * معالجة الأخطاء القادمة من السيرفر أو الشبكة
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = 'حدث خطأ غير متوقع، حاول مرة أخرى';

    if (error.error instanceof ErrorEvent) {
      message = 'تعذر الاتصال بالخادم، تحقق من الإنترنت';
    } else {
      switch (error.status) {
        case 400:
          message = 'البيانات المُدخلة غير صحيحة';
          break;
        case 401:
          message = 'غير مصرح لك بالوصول، يرجى تسجيل الدخول';
          break;
        case 403:
          message = 'ليس لديك صلاحية لعرض هذا التقرير';
          break;
        case 404:
          message = 'لا توجد بيانات للفترة المحددة';
          break;
        case 500:
          message = 'حدث خطأ في الخادم، حاول لاحقاً';
          break;
      }
    }

    console.error('Profit Report Error:', error);
    return throwError(() => new Error(message));
  }

/**
   * الحصول على تقرير توزيع الأرباح الشامل
   * @param startDate تاريخ البداية (YYYY-MM-DD)
   * @param endDate تاريخ النهاية (YYYY-MM-DD)
   */
  getProfitDistributionReport(startDate: string, endDate: string): Observable<ProfitDistributionResponse> {
    const params = new HttpParams()
      .set('start_date', startDate)
      .set('end_date', endDate);

    return this.http.get<ProfitDistributionResponse>(`${this.baseUrl}/profit-distribution`, { params });
  }

  /**
   * الحصول على تفاصيل توزيع الأرباح لجميع الشركاء
   * @param startDate تاريخ البداية (YYYY-MM-DD)
   * @param endDate تاريخ النهاية (YYYY-MM-DD)
   */
  getPartnersProfitDetails(startDate: string, endDate: string): Observable<ProfitDistributionResponse> {
    const params = new HttpParams()
      .set('start_date', startDate)
      .set('end_date', endDate);

    return this.http.get<ProfitDistributionResponse>(`${this.baseUrl}/profit-distribution/partners`, { params });
  }

  /**
   * الحصول على تفاصيل ربح شريك معين
   * @param partnerId معرف الشريك
   * @param startDate تاريخ البداية (YYYY-MM-DD)
   * @param endDate تاريخ النهاية (YYYY-MM-DD)
   */
  getIndividualPartnerProfit(
    partnerId: number,
    startDate: string,
    endDate: string
  ): Observable<ProfitDistributionResponse> {
    const params = new HttpParams()
      .set('start_date', startDate)
      .set('end_date', endDate);

    return this.http.get<ProfitDistributionResponse>(
      `${this.baseUrl}/profit-distribution/partner/${partnerId}`,
      { params }
    );
  }

  /**
   * الحصول على ملخص سريع لتوزيع الأرباح
   * @param startDate تاريخ البداية (YYYY-MM-DD)
   * @param endDate تاريخ النهاية (YYYY-MM-DD)
   */
  getDistributionSummary(startDate: string, endDate: string): Observable<ProfitDistributionResponse> {
    const params = new HttpParams()
      .set('start_date', startDate)
      .set('end_date', endDate);

    return this.http.get<ProfitDistributionResponse>(`${this.baseUrl}/profit-distribution/summary`, { params });
  }

}
