import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, of, throwError } from 'rxjs';
import { catchError, finalize, map, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

import {
  CreateCustodyRequest,
  Custody,
  CustodyStatement,
  CustodyStatus,
  CustodySummaryResponse,
  PersonType,
  RecordReturnRequest,
  RecordSpendingRequest,
  SettleCustodyRequest
} from '../../models/custody.models';
import { Safe } from '../models/safe.model';
import { CostCategory, DailyOperation, Employee, Partner } from '../models';
import { OperationService } from './operation.service';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

interface ListResponse<T> {
  success: boolean;
  count: number;
  data: T[];
}

@Injectable({ providedIn: 'root' })
export class CustodyService {
  private http = inject(HttpClient);
  private operationService = inject(OperationService);
  private base = environment.apiUrl+'/custodies';

  custodies = signal<Custody[]>([]);
  summary = signal<CustodySummaryResponse | null>(null);
  selectedStatement = signal<CustodyStatement | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  activeCustodies = computed(() =>
    this.custodies().filter((c) => c.status === 'OPEN' || c.status === 'PARTIAL')
  );

  totalUnaccounted = computed(() => this.summary()?.totals.total_unaccounted ?? 0);

  loadAll(filters?: {
    status?: CustodyStatus;
    given_to_person_type?: PersonType;
  }): Observable<void> {
    this.loading.set(true);

    let params = new HttpParams();
    if (filters?.status) {
      params = params.set('status', filters.status);
    }
    if (filters?.given_to_person_type) {
      params = params.set('given_to_person_type', filters.given_to_person_type);
    }

    return this.http.get<ListResponse<Custody>>(this.base, { params }).pipe(
      tap((response) => {
        this.custodies.set(response.data);
        this.error.set(null);
      }),
      map(() => void 0),
      catchError((error) => this.handleError(error)),
      finalize(() => this.loading.set(false))
    );
  }

  loadSummary(): Observable<void> {
    this.loading.set(true);

    return this.http.get<ApiResponse<CustodySummaryResponse>>(`${this.base}/summary`).pipe(
      tap((response) => {
        this.summary.set(response.data);
        this.error.set(null);
      }),
      map(() => void 0),
      catchError((error) => this.handleError(error)),
      finalize(() => this.loading.set(false))
    );
  }

  loadStatement(id: number): Observable<void> {
    this.loading.set(true);

    return this.http.get<ApiResponse<CustodyStatement>>(`${this.base}/${id}/statement`).pipe(
      tap((response) => {
        this.selectedStatement.set(response.data);
        this.error.set(null);
      }),
      map(() => void 0),
      catchError((error) => this.handleError(error)),
      finalize(() => this.loading.set(false))
    );
  }

  create(dto: CreateCustodyRequest): Observable<Custody> {
    this.loading.set(true);

    return this.http.post<ApiResponse<Custody>>(this.base, dto).pipe(
      switchMap((response) =>
        forkJoin([this.loadAll(), this.loadSummary()]).pipe(map(() => response.data))
      ),
      tap(() => this.error.set(null)),
      catchError((error) => this.handleError(error)),
      finalize(() => this.loading.set(false))
    );
  }

  recordReturn(id: number, dto: RecordReturnRequest): Observable<void> {
    this.loading.set(true);

    return this.http.post<ApiResponse<unknown>>(`${this.base}/${id}/return`, dto).pipe(
      switchMap(() => {
        const statementId = this.selectedStatement()?.custody.id;
        const requests: Observable<void>[] = [this.loadAll(), this.loadSummary()];
        if (statementId) {
          requests.push(this.loadStatement(statementId));
        }
        return forkJoin(requests).pipe(map(() => void 0));
      }),
      tap(() => this.error.set(null)),
      catchError((error) => this.handleError(error)),
      finalize(() => this.loading.set(false))
    );
  }

  recordSpending(id: number, dto: RecordSpendingRequest): Observable<void> {
    this.loading.set(true);

    return this.http.post<ApiResponse<unknown>>(`${this.base}/${id}/spending`, dto).pipe(
      switchMap(() => forkJoin([this.loadStatement(id), this.loadSummary()]).pipe(map(() => void 0))),
      tap(() => this.error.set(null)),
      catchError((error) => this.handleError(error)),
      finalize(() => this.loading.set(false))
    );
  }

  settle(id: number, dto: SettleCustodyRequest): Observable<void> {
    this.loading.set(true);

    return this.http.post<ApiResponse<unknown>>(`${this.base}/${id}/settle`, dto).pipe(
      switchMap(() => forkJoin([this.loadAll(), this.loadSummary()]).pipe(map(() => void 0))),
      tap(() => this.error.set(null)),
      catchError((error) => this.handleError(error)),
      finalize(() => this.loading.set(false))
    );
  }

  getActiveCustodiesForPerson(personType: PersonType, personId: number): Observable<Custody[]> {
    this.loading.set(true);

    const params = new HttpParams().set('given_to_person_type', personType);

    return this.http.get<ListResponse<Custody>>(this.base, { params }).pipe(
      map((response) =>
        response.data.filter(
          (custody) =>
            custody.given_to_person_id === personId &&
            (custody.status === 'OPEN' || custody.status === 'PARTIAL')
        )
      ),
      tap(() => this.error.set(null)),
      catchError((error) => this.handleError(error)),
      finalize(() => this.loading.set(false))
    );
  }

  getActiveSafes(options?: { silent?: boolean }): Observable<Safe[]> {
    const silent = options?.silent ?? false;
    if (!silent) {
      this.loading.set(true);
    }

    return this.http.get<ApiResponse<Safe[]>>(environment.apiUrl+'/safes').pipe(
      map((response) => response.data.filter((safe) => safe.is_active)),
      tap(() => this.error.set(null)),
      catchError((error) => (silent ? throwError(() => error) : this.handleError(error))),
      finalize(() => {
        if (!silent) {
          this.loading.set(false);
        }
      })
    );
  }

  getOpenAndPartialCustodies(options?: { silent?: boolean }): Observable<Custody[]> {
    const silent = options?.silent ?? false;
    if (!silent) {
      this.loading.set(true);
    }

    return forkJoin([
      this.http.get<ListResponse<Custody>>(this.base, {
        params: new HttpParams().set('status', 'OPEN')
      }),
      this.http.get<ListResponse<Custody>>(this.base, {
        params: new HttpParams().set('status', 'PARTIAL')
      })
    ]).pipe(
      map(([openResponse, partialResponse]) => {
        const merged = [...openResponse.data, ...partialResponse.data];
        const seen = new Set<number>();
        return merged.filter((custody) => {
          if (seen.has(custody.id)) {
            return false;
          }
          seen.add(custody.id);
          return true;
        });
      }),
      tap(() => this.error.set(null)),
      catchError((error) => (silent ? throwError(() => error) : this.handleError(error))),
      finalize(() => {
        if (!silent) {
          this.loading.set(false);
        }
      })
    );
  }

  getActiveEmployees(options?: { silent?: boolean }): Observable<Employee[]> {
    const silent = options?.silent ?? false;
    if (!silent) {
      this.loading.set(true);
    }

    return this.http.get<ApiResponse<Employee[]>>(environment.apiUrl+'/employees', {
      params: new HttpParams().set('active', 'true')
    }).pipe(
      map((response) => response.data),
      tap(() => this.error.set(null)),
      catchError((error) => (silent ? throwError(() => error) : this.handleError(error))),
      finalize(() => {
        if (!silent) {
          this.loading.set(false);
        }
      })
    );
  }

  getPartners(options?: { silent?: boolean }): Observable<Partner[]> {
    const silent = options?.silent ?? false;
    if (!silent) {
      this.loading.set(true);
    }

    return this.http.get<ApiResponse<Partner[]>>(environment.apiUrl+'/partners').pipe(
      map((response) => response.data),
      tap(() => this.error.set(null)),
      catchError((error) => (silent ? throwError(() => error) : this.handleError(error))),
      finalize(() => {
        if (!silent) {
          this.loading.set(false);
        }
      })
    );
  }

  getCostCategories(): Observable<CostCategory[]> {
    this.loading.set(true);

    return this.http.get<ApiResponse<CostCategory[]>>(environment.apiUrl+'/cost-categories').pipe(
      map((response) => response.data),
      tap(() => this.error.set(null)),
      catchError((error) => this.handleError(error)),
      finalize(() => this.loading.set(false))
    );
  }

  getDailyOperationByDate(date: string): Observable<DailyOperation | null> {
    this.loading.set(true);
    return this.operationService.getByDate(date).pipe(
      map((response) => response.data),
      tap(() => this.error.set(null)),
      catchError((error) => {
        const status = (error as { status?: number })?.status;
        if (status === 404) {
          this.error.set(null);
          return of(null);
        }
        return this.handleError(error);
      }),
      finalize(() => this.loading.set(false))
    );
  }

  private handleError(error: unknown): Observable<never> {
    const message =
      (error as { error?: { message?: string } })?.error?.message ?? 'حدث خطأ أثناء معالجة بيانات العهدة';
    this.error.set(message);
    return throwError(() => error);
  }
}
