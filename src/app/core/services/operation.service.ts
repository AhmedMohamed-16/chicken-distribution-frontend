import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  DailyOperation,
  FarmLoadingRequest,
  SaleRequest,
  TransportLossRequest,
  DailyCostRequest,
  ProfitDistribution
} from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OperationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/daily-operations`;

  startDay(data: { operation_date: string; vehicle_id: number }): Observable<DailyOperation> {
    return this.http.post<DailyOperation>(`${this.apiUrl}/start`, data);
  }

  getOperation(id: number): Observable<DailyOperation> {
    return this.http.get<DailyOperation>(`${this.apiUrl}/${id}`);
  }

  getByDate(date: string): Observable<DailyOperation> {
    return this.http.get<DailyOperation>(`${this.apiUrl}/by-date/${date}`);
  }

  farmLoading(operationId: number, data: FarmLoadingRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/${operationId}/farm-loading`, data);
  }

  recordLoss(operationId: number, data: TransportLossRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/${operationId}/transport-loss`, data);
  }

  recordCost(operationId: number, data: DailyCostRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/${operationId}/cost`, data);
  }

  recordSale(operationId: number, data: SaleRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/${operationId}/sale`, data);
  }

  closeDay(operationId: number): Observable<{ profit_distribution: ProfitDistribution }> {
    return this.http.post<{ profit_distribution: ProfitDistribution }>(
      `${this.apiUrl}/${operationId}/close`,
      {}
    );
  }
}

