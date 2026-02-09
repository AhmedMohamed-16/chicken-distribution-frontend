import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard to protect routes based on user permissions
 *
 * Usage in route:
 * {
 *   path: 'users',
 *   component: UserListComponent,
 *   canActivate: [permissionGuard],
 *   data: {
 *     permissions: ['VIEW_USERS'],
 *     requireAll: true  // optional, default is true
 *   }
 * }
 */
export const permissionGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
    // ADMIN يتجاوز كل القيود
    if (authService.hasPermission('APPLICATION_ADMIN')) {
      return true;
    }

  const requiredPermissions = getRequiredPermissions(route);
  const requireAll = route.data['requireAll'] ?? true;

  // If no permissions required, allow access
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true;
  }

  // Check permissions
  const hasPermission = requireAll
    ? authService.hasAllPermissions(requiredPermissions)
    : authService.hasAnyPermission(requiredPermissions);

  if (!hasPermission) {
    console.warn('Access denied. Required permissions:', requiredPermissions);
    router.navigate(['/unauthorized'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }

  return true;
};

/**
 * Helper function to get required permissions from route data
 */
function getRequiredPermissions(route: ActivatedRouteSnapshot): string[] {
  const permissions = route.data['permissions'];

  if (!permissions) {
    return [];
  }

  // Support both array and single permission string
  return Array.isArray(permissions) ? permissions : [permissions];
}
