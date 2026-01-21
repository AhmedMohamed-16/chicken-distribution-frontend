// src/app/core/services/report.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DailyReport, PeriodReport } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/reports`;

  getDailyReport(date: string): Observable<DailyReport> {
    return this.http.get<DailyReport>(`${this.apiUrl}/daily/${date}`);
  }

  getPeriodReport(from: string, to: string): Observable<PeriodReport> {
    return this.http.get<PeriodReport>(`${this.apiUrl}/period`, {
      params: { from, to }
    });
  }

  getPartnerProfits(from: string, to: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/partner-profits`, {
      params: { from, to }
    });
  }

  getFarmDebts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/farm-debts`);
  }

  getBuyerDebts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/buyer-debts`);
  }
}
