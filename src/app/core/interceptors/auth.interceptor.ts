import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * HTTP Interceptor to:
 * 1. Add Authorization header to requests
 * 2. Handle authentication errors (401)
 * 3. Handle authorization errors (403)
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Get current token
  const token = authService.token();

  // Clone request and add auth header if token exists
  let authReq = req;
  if (token && !isPublicEndpoint(req.url)) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Handle the request and catch errors
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Unauthorized - token invalid or expired
        console.warn('Authentication failed. Logging out...');
        authService.logout();
      } else if (error.status === 403) {
        // Forbidden - user doesn't have permission
        console.warn('Access forbidden. Insufficient permissions.');
      }

      return throwError(() => error);
    })
  );
};

/**
 * Check if endpoint is public (doesn't require authentication)
 */
function isPublicEndpoint(url: string): boolean {
  const publicEndpoints = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
  ];

  return publicEndpoints.some(endpoint => url.includes(endpoint));
}
