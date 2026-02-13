import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { CostCategory, PaginatedResponse, PaginationParams } from "../models";

interface CostCategoryResponse {
  success: boolean;
  data: CostCategory | CostCategory[];
  message?: string;
}

interface CostCategoryStatistics {
  success: boolean;
  data: {
    category: CostCategory;
    statistics: {
      total_records: number;
      total_amount: number;
      average_amount: number;
      max_amount: number;
      min_amount: number;
    };
    by_vehicle: Array<{
      vehicle_id: number;
      vehicle_name: string;
      count: number;
      total: number;
    }> | null;
    recent_costs: any[];
  };
}
@Injectable({
  providedIn: 'root'
})
export class CostCategoryService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/cost-categories`;

  getAll(): Observable<CostCategoryResponse> {
    return this.http.get<CostCategoryResponse>(this.apiUrl);
  }
 getPaginationAll(params?: PaginationParams): Observable<PaginatedResponse<CostCategory>> {
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
    if (params?.type_cost !== undefined) {
      httpParams = httpParams.set('type_cost', params.type_cost);
    }

    return this.http.get<PaginatedResponse<CostCategory>>( `${environment.apiUrl}/paginate-cost-categories`, { params: httpParams });
  }
  getById(id: number): Observable<CostCategoryResponse> {
    return this.http.get<CostCategoryResponse>(`${this.apiUrl}/${id}`);
  }

  getByType(type: 'vehicle' | 'general'): Observable<CostCategoryResponse> {
    return this.http.get<CostCategoryResponse>(`${this.apiUrl}/type/${type}`);
  }

  getStatistics(
    id: number,
    startDate?: string,
    endDate?: string
  ): Observable<CostCategoryStatistics> {
    let params = new HttpParams();
    if (startDate) params = params.set('start_date', startDate);
    if (endDate) params = params.set('end_date', endDate);

    return this.http.get<CostCategoryStatistics>(
      `${this.apiUrl}/${id}/statistics`,
      { params }
    );
  }

  create(category: Partial<CostCategory>): Observable<CostCategoryResponse> {
    return this.http.post<CostCategoryResponse>(this.apiUrl, category);
  }

  update(id: number, category: Partial<CostCategory>): Observable<CostCategoryResponse> {
    return this.http.put<CostCategoryResponse>(`${this.apiUrl}/${id}`, category);
  }

  delete(id: number): Observable<CostCategoryResponse> {
    return this.http.delete<CostCategoryResponse>(`${this.apiUrl}/${id}`);
  }
}
