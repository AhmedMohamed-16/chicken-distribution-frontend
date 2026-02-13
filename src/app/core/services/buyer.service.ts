import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { Observable } from "rxjs";
import { Buyer, PaginatedResponse, PaginationParams } from "../models";

@Injectable({
  providedIn: 'root'
})
export class BuyerService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/buyers`;

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getPaginationAll(params?: PaginationParams): Observable<PaginatedResponse<Buyer>> {
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
      httpParams = httpParams.set('has_debt', params.has_debt.toString());
    }

    return this.http.get<PaginatedResponse<Buyer>>(`${environment.apiUrl}/paginate-buyers`, { params: httpParams });
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
