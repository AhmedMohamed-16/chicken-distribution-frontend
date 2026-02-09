import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  DailyOperation,
  FarmLoadingRequest,
  SaleRequest,
  TransportLossRequest,
  DailyCostRequest,
  ProfitDistribution,
  DailyCost,
  Vehicle,
  StartDayRequest,
  ApiResponse,
  FarmLoadingResponse,
  VehicleOperation
} from '../models';
import { environment } from '../../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class OperationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/daily-operations`;


// startDay(data: {
//     operation_date: string;
//     vehicle_ids: number[];
//   }): Observable<DailyOperation> {
//     return this.http.post<DailyOperation>(`${this.apiUrl}/start`, data);
//   }

//   getOperation(id: number): Observable<DailyOperation> {
//     return this.http.get<DailyOperation>(`${this.apiUrl}/${id}`);
//   }

//   getByDate(date: string): Observable<DailyOperation> {
//     return this.http.get<DailyOperation>(`${this.apiUrl}/by-date/${date}`);
//   }

//   farmLoading(operationId: number, data: FarmLoadingRequest): Observable<any> {
//     return this.http.post(`${this.apiUrl}/${operationId}/farm-loading`, data);
//   }

//   recordLoss(operationId: number, data: TransportLossRequest): Observable<any> {
//     return this.http.post(`${this.apiUrl}/${operationId}/transport-loss`, data);
//   }

//   getOperationVehicles(operationId: number): Observable<Vehicle[]> {
//     return this.http.get<Vehicle[]>(`${this.apiUrl}/${operationId}/vehicles`);
//   }
//   recordCost(operationId: number, data: DailyCostRequest): Observable<DailyCost> {
//     return this.http.post<DailyCost>(`${this.apiUrl}/${operationId}/cost`, data);
//   }

//   recordSale(operationId: number, data: SaleRequest): Observable<any> {
//     return this.http.post(`${this.apiUrl}/${operationId}/sale`, data);
//   }

//   closeDay(operationId: number): Observable<ProfitDistribution > {
//     return this.http.post<ProfitDistribution>(
//       `${this.apiUrl}/${operationId}/close`,
//       {}
//     );
//   }

//     /**
//    * Get current active daily operation with vehicle operations
//    * Returns: DailyOperation with vehicle_operations[] array
//    */
//   // getCurrentOperation(): Observable<DailyOperation> {
//   //   return this.http.get<DailyOperation>(`${this.apiUrl}/current`);
//   // }

//   /**
//    * Mark a specific vehicle operation as complete
//    * Backend validates vehicle can be marked complete
//    */
//   markVehicleOperationComplete(vehicleOperationId: number): Observable<any> {
//     return this.http.patch(
//       `${this.apiUrl}/vehicle-operations/${vehicleOperationId}/complete`,
//       {}
//     );
//   }
   startDay(data: StartDayRequest): Observable<ApiResponse<DailyOperation>> {
    return this.http.post<ApiResponse<DailyOperation>>(`${this.apiUrl}/start`, data);
  }

  getOperation(id: number): Observable<ApiResponse<DailyOperation>> {
    return this.http.get<ApiResponse<DailyOperation>>(`${this.apiUrl}/${id}`);
  }

  getByDate(date: string): Observable<ApiResponse<DailyOperation>> {
    return this.http.get<ApiResponse<DailyOperation>>(`${this.apiUrl}/by-date/${date}`);
  }


  closeDay(operationId: number): Observable<ApiResponse<ProfitDistribution>> {
    return this.http.post<ApiResponse<ProfitDistribution>>(
      `${this.apiUrl}/${operationId}/close`,
      {}
    );
  }

  farmLoading(
    operationId: number,
    data: FarmLoadingRequest
  ): Observable<FarmLoadingResponse> {
    return this.http.post<FarmLoadingResponse>(
      `${this.apiUrl}/${operationId}/farm-loading`,
      data
    );
  }

  recordLoss(
    operationId: number,
    data: TransportLossRequest
  ): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/${operationId}/transport-loss`,
      data
    );
  }

  recordCost(
    operationId: number,
    data: DailyCostRequest
  ): Observable<ApiResponse<DailyCost>> {
    return this.http.post<ApiResponse<DailyCost>>(
      `${this.apiUrl}/${operationId}/cost`,
      data
    );
  }

  recordSale(
    operationId: number,
    data: SaleRequest
  ): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/${operationId}/sale`,
      data
    );
  }

  getOperationVehicles(operationId: number): Observable<ApiResponse<Vehicle[]>> {
    return this.http.get<ApiResponse<Vehicle[]>>(
      `${this.apiUrl}/${operationId}/vehicles`
    );
  }


  markVehicleOperationComplete(vehicleOperationId: number): Observable<ApiResponse<VehicleOperation>> {
    return this.http.patch<ApiResponse<VehicleOperation>>(
      `${this.apiUrl}/vehicle-operations/${vehicleOperationId}/complete`,
      {}
    );
  }

  getVehicleOperation(vehicleOperationId: number): Observable<ApiResponse<VehicleOperation>> {
    return this.http.get<ApiResponse<VehicleOperation>>(
      `${this.apiUrl}/vehicle-operations/${vehicleOperationId}`
    );
  }

  canCloseOperation(operation: DailyOperation): boolean {
    if (!operation.vehicle_operations || operation.vehicle_operations.length === 0) {
      return false;
    }

    return operation.vehicle_operations.every(vo => vo.status === 'COMPLETED');
  }


  getOperationStatusDisplay(status: 'OPEN' | 'CLOSED'): string {
    return status === 'OPEN' ? 'مفتوحة' : 'مغلقة';
  }

  getVehicleOperationStatusDisplay(status: 'ACTIVE' | 'COMPLETED'): string {
    return status === 'ACTIVE' ? 'نشطة' : 'مكتملة';
  }

  getVehicleOperationStatusColor(status: 'ACTIVE' | 'COMPLETED'): string {
    return status === 'ACTIVE' ? 'text-blue-600' : 'text-green-600';
  }

}

