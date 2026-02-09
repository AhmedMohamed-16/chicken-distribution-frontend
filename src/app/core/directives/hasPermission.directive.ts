import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  inject,
  effect
} from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Structural directive to conditionally render elements based on permissions
 *
 * Usage:
 *
 * Single permission:
 * <button *hasPermission="'MANAGE_USERS'">Create User</button>
 *
 * Multiple permissions (require all):
 * <button *hasPermission="['MANAGE_USERS', 'VIEW_USERS']">Action</button>
 *
 * Multiple permissions (require any):
 * <button *hasPermission="['MANAGE_USERS', 'VIEW_USERS']; requireAll: false">Action</button>
 *
 * With else template:
 * <button *hasPermission="'MANAGE_USERS'; else noPermission">Create User</button>
 * <ng-template #noPermission>
 *   <span>No permission</span>
 * </ng-template>
 */
@Directive({
  selector: '[hasPermission]',
  standalone: true
})
export class HasPermissionDirective {
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);
  private authService = inject(AuthService);

  private permissions: string[] = [];
  private requireAll = true;
  private elseTemplateRef: TemplateRef<any> | null = null;

  constructor() {
    // React to permission changes using effect
    effect(() => {
      // Track permissions signal changes
      this.authService.permissions();
      this.updateView();
    });
  }

  /**
   * Set the required permission(s)
   */
  @Input() set hasPermission(permissions: string | string[]) {
    this.permissions = Array.isArray(permissions) ? permissions : [permissions];
    this.updateView();
  }

  /**
   * Set whether all permissions are required (default: true)
   */
  @Input() set hasPermissionRequireAll(value: boolean) {
    this.requireAll = value;
    this.updateView();
  }

  /**
   * Set the else template to show when permission check fails
   */
  @Input() set hasPermissionElse(templateRef: TemplateRef<any> | null) {
    this.elseTemplateRef = templateRef;
    this.updateView();
  }

  /**
   * Update the view based on permission check
   */
  private updateView(): void {
    const hasPermission = this.checkPermissions();

    this.viewContainer.clear();

    if (hasPermission) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else if (this.elseTemplateRef) {
      this.viewContainer.createEmbeddedView(this.elseTemplateRef);
    }
  }

  /**
   * Check if user has required permissions
   */
  private checkPermissions(): boolean {
    // إذا المستخدم عنده صلاحية APPLICATION_ADMIN، نتجاوز كل القيود
  if (this.authService.hasPermission('APPLICATION_ADMIN')) {
    return true;
  }

    if (!this.permissions || this.permissions.length === 0) {
      return true; // No permissions required
    }

    return this.requireAll
      ? this.authService.hasAllPermissions(this.permissions)
      : this.authService.hasAnyPermission(this.permissions);
  }
}
