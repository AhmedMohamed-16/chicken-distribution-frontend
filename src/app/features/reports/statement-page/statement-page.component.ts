import { Component, OnInit } from '@angular/core';

import { ActivatedRoute } from '@angular/router';
import { AccountStatementComponent } from '../../../shared/components/account-statement/account-statement.component';

@Component({
  selector: 'app-statement-page',
  standalone: true,
  imports: [AccountStatementComponent],
  template: `
    <div class="statement-page">
  <div class="statement-page__container">

    @if (entityType && entityId) {
      <section class="statement-page__content">
        <app-account-statement
          [entityType]="entityType"
          [entityId]="entityId"
          [entityName]="entityName">
        </app-account-statement>
      </section>
    }

  </div>
</div>
  `,
  styles:`/* =========================================================
   STATEMENT PAGE
   Mobile First - RTL Friendly - ERP Style
========================================================= */

:host {
  display: block;
  width: 100%;
  min-width: 0;
  direction: rtl;
  box-sizing: border-box;
}

/* =========================================================
   PAGE LAYOUT
========================================================= */

.statement-page {
  width: 100%;
  min-height: 100%;
  padding: 0.75rem;
  box-sizing: border-box;
}

.statement-page__container {
  width: 100%;
  max-width: 1800px;
  margin-inline: auto;
}

.statement-page__content {
  width: 100%;
  min-width: 0;
}

/* =========================================================
   RESPONSIVE SPACING
========================================================= */

@media (min-width: 768px) {
  .statement-page {
    padding: 1rem 1.25rem;
  }
}

@media (min-width: 1024px) {
  .statement-page {
    padding: 1.5rem;
  }
}

/* =========================================================
   GLOBAL DEEP OVERRIDES
   (Safe responsive helpers for child statement component)
========================================================= */

:host ::ng-deep app-account-statement {
  display: block;
  width: 100%;
  min-width: 0;
}

/* Prevent horizontal overflow */
:host ::ng-deep .mat-mdc-table {
  min-width: 100%;
}

:host ::ng-deep .table-responsive,
:host ::ng-deep .mat-mdc-table-container {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

/* =========================================================
   MOBILE IMPROVEMENTS
========================================================= */

@media (max-width: 767px) {

  :host ::ng-deep .mat-mdc-card,
  :host ::ng-deep .mat-card {
    border-radius: 1rem;
  }

  :host ::ng-deep .mat-mdc-form-field {
    width: 100%;
  }

  :host ::ng-deep .mat-mdc-button,
  :host ::ng-deep .mat-mdc-raised-button,
  :host ::ng-deep .mat-mdc-outlined-button {
    width: 100%;
    min-height: 48px;
  }

  :host ::ng-deep .mat-mdc-table {
    font-size: 0.875rem;
  }

  :host ::ng-deep .mat-mdc-header-cell,
  :host ::ng-deep .mat-mdc-cell {
    white-space: nowrap;
    padding-inline: 0.75rem;
  }
}

/* =========================================================
   TABLET IMPROVEMENTS
========================================================= */

@media (min-width: 768px) and (max-width: 1023px) {

  :host ::ng-deep .mat-mdc-form-field {
    width: 100%;
  }

  :host ::ng-deep .mat-mdc-button,
  :host ::ng-deep .mat-mdc-raised-button {
    min-height: 44px;
  }
}

/* =========================================================
   DESKTOP ENHANCEMENTS
========================================================= */

@media (min-width: 1024px) {

  .statement-page__container {
    padding-inline: 0.5rem;
  }

  :host ::ng-deep .mat-mdc-card,
  :host ::ng-deep .mat-card {
    border-radius: 1.25rem;
  }
}

/* =========================================================
   ACCESSIBILITY & SAFE OVERFLOW
========================================================= */

*,
*::before,
*::after {
  box-sizing: border-box;
}

:host ::ng-deep * {
  min-width: 0;
}

:host ::ng-deep .mat-mdc-dialog-content,
:host ::ng-deep .mat-mdc-card-content {
  overflow-x: hidden;
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}`
})
export class StatementPageComponent implements OnInit {
  entityType: string = '';
  entityId: number = 0;
  entityName: string = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.entityType = params['entityType'];
      this.entityId = +params['entityId'];
    });

    this.route.queryParams.subscribe(queryParams => {
      this.entityName = queryParams['name'] || '';
    });
  }
}
