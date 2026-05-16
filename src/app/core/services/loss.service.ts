import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Loss, CreateLossDto, ApiResponse } from '../models';
import { environment } from '../../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class LossService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/losses`;

  create(dto: CreateLossDto): Observable<ApiResponse<Loss>> {
    return this.http.post<ApiResponse<Loss>>(this.apiUrl, dto);
  }

  getAll(params?: any): Observable<ApiResponse<Loss[]>> {
    return this.http.get<ApiResponse<Loss[]>>(this.apiUrl, { params });
  }

  getSummary(from: string, to: string): Observable<ApiResponse<any>> {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/summary`, { params });
  }
}
