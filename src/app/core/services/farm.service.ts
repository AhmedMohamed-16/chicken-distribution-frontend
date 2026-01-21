// src/app/core/services/farm.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Farm } from '../models';
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

  getDebtHistory(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}/debt-history`);
  }
}





