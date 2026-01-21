import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class BuyerService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/buyers`;

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  create(buyer: any): Observable<any> {
    return this.http.post(this.apiUrl, buyer);
  }

  update(id: number, buyer: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, buyer);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getDebtHistory(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}/debt-history`);
  }
}
