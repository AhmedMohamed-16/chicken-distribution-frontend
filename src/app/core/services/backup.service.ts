import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment.prod';
import {
  Backup,
  BackupListResponse,
  CreateBackupResponse,
  RestoreBackupResponse,
  RestoreStrategy,
  ApiError
} from '../models/index';

/**
 * Service for managing database backup and restore operations
 * Handles all API communication with the backend
 */
@Injectable({
  providedIn: 'root'
})
export class BackupService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  /**
   * Fetch all backups from the server
   * GET /api/backup/list
   */
  listBackups(): Observable<Backup[]> {
    return this.http.get<BackupListResponse>(`${this.apiUrl}/backup/list`).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  /**
   * Create a new manual backup
   * POST /api/backup
   *
   * Triggers manual backup creation on the backend
   * Returns backup metadata including ID, filename, size, duration
   */
  createBackup(): Observable<CreateBackupResponse> {
    return this.http.post<CreateBackupResponse>(`${this.apiUrl}/backup`, {}).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Download a backup file
   * GET /api/backup/download/:filename
   * Returns a Blob for file download
   */
  downloadBackup(filename: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/backup/download/${filename}`, {
      responseType: 'blob',
      observe: 'body'
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Restore database from backup file
   * POST /api/backup/restore
   */
  restoreBackup(file: File, strategy: RestoreStrategy): Observable<RestoreBackupResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('strategy', strategy);

    return this.http.post<RestoreBackupResponse>(`${this.apiUrl}/backup/restore`, formData).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Trigger browser download for a blob
   * Programmatic file download helper
   */
  triggerBrowserDownload(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Handle HTTP errors with user-friendly messages
   */
private handleError(error: HttpErrorResponse): Observable<never> {
  let errorMessage = 'حدث خطأ غير معروف';

  if (error.error instanceof ErrorEvent) {
    // خطأ من جهة العميل
    errorMessage = `خطأ: ${error.error.message}`;
  } else {
    // خطأ من جهة الخادم
    switch (error.status) {
      case 401:
        errorMessage = 'غير مصرح: الرجاء تسجيل الدخول مرة أخرى.';
        break;
      case 403:
        errorMessage = 'ممنوع: ليس لديك صلاحية الوصول.';
        break;
      case 404:
        errorMessage = 'المورد غير موجود.';
        break;
      case 500:
        errorMessage = 'خطأ في الخادم. الرجاء المحاولة لاحقًا.';
        break;
      default:
        // محاولة استخراج رسالة الخطأ من الخادم
        if (error.error && typeof error.error === 'object') {
          const apiError = error.error as ApiError;
          errorMessage = apiError.message || apiError.error || errorMessage;
        } else if (typeof error.error === 'string') {
          errorMessage = error.error;
        } else {
          errorMessage = `الخادم أعاد الرمز ${error.status}: ${error.statusText}`;
        }
    }
  }

  // تسجيل الخطأ في الكونسول أثناء التطوير
  if (!environment.production) {
    console.error('خطأ HTTP:', error);
    console.error('رسالة الخطأ:', errorMessage);
  }

  return throwError(() => new Error(errorMessage));
}
}
