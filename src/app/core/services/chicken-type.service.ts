import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { Observable } from "rxjs";

 @Injectable({
  providedIn: 'root'
})
export class ChickenTypeService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/chicken-types`;

  getAll(): Observable<any[]> { return this.http.get<any[]>(this.apiUrl); }
  create(data: any) { return this.http.post(this.apiUrl, data); }
  update(id: any, data: any) { return this.http.put(`${this.apiUrl}/${id}`, data); }
  delete(id: any) { return this.http.delete(`${this.apiUrl}/${id}`); }

}
