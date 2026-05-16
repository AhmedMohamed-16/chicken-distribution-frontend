import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment.prod';
import { AccountStatementComponent } from '../../../shared/components/account-statement/account-statement.component';

interface Entity {
  id: number;
  name: string;
}

@Component({
  selector: 'app-statement-selector',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    RouterModule,
    AccountStatementComponent
  ],
  template: `
    <div class="statement-selector-page">

  <!-- =====================================================
       HEADER / FILTER CARD
  ====================================================== -->
  <mat-card class="selector-card no-print">

    <mat-card-header class="selector-card__header">
      <div class="selector-card__title-wrapper">

        <div class="selector-card__icon">
          <mat-icon>account_balance_wallet</mat-icon>
        </div>

        <div class="selector-card__titles">
          <mat-card-title>
            استخراج كشف حساب
          </mat-card-title>

          <mat-card-subtitle>
            اختر نوع الحساب والجهة لعرض كشف الحساب التفصيلي
          </mat-card-subtitle>
        </div>

      </div>
    </mat-card-header>

    <mat-card-content class="selector-card__content">

      <div class="filters-grid">

        <!-- Account Type -->
        <mat-form-field appearance="outline" class="form-field">
          <mat-label>نوع الحساب</mat-label>

          <mat-select
            [(ngModel)]="selectedType"
            (selectionChange)="onTypeChange()">

            @for (type of entityTypes; track type.value) {
              <mat-option [value]="type.value">
                {{ type.label }}
              </mat-option>
            }

          </mat-select>
        </mat-form-field>

        <!-- Entity Selector -->
        <mat-form-field appearance="outline" class="form-field">
          <mat-label>اختر الحساب / الاسم</mat-label>

          <mat-select
            [(ngModel)]="selectedEntityId"
            (selectionChange)="onEntityChange()"
            [disabled]="!selectedType">

            @for (entity of entities; track entity.id) {
              <mat-option [value]="entity.id">
                {{ entity.name }}
              </mat-option>
            }

          </mat-select>
        </mat-form-field>

        <!-- Action Button -->
        <div class="action-section">
          <button
            mat-flat-button
            color="primary"
            type="button"
            class="view-button"
            [disabled]="!selectedType || !selectedEntityId"
            (click)="viewStatement()">

            <mat-icon>visibility</mat-icon>
            <span>عرض الكشف</span>

          </button>
        </div>

      </div>

    </mat-card-content>

  </mat-card>

  <!-- =====================================================
       STATEMENT VIEW
  ====================================================== -->

  @if (viewingStatement && selectedType && selectedEntityId) {

    <section class="statement-section">
      <app-account-statement
        [entityType]="selectedType"
        [entityId]="selectedEntityId"
        [entityName]="selectedEntityName">
      </app-account-statement>
    </section>

  } @else {

    <!-- =====================================================
         EMPTY STATE
    ====================================================== -->

    <section class="welcome-state">

      <div class="welcome-state__icon">
        <mat-icon>receipt_long</mat-icon>
      </div>

      <h2 class="welcome-state__title">
        اختر الحساب المطلوب لعرض كشف الحساب
      </h2>

      <p class="welcome-state__description">
        نظام كشوف الحسابات الموحد يغطي المبيعات، المشتريات،
        المصروفات، السلف، العهدة، والخزائن.
      </p>

    </section>

  }

</div>
  `,
  styles: [`
   /* =========================================================
   HOST
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

.statement-selector-page {
  width: 100%;
  min-height: 100%;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-sizing: border-box;
}

/* =========================================================
   CARD
========================================================= */

.selector-card {
  border-radius: 1.25rem;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.04),
    0 1px 3px rgba(0, 0, 0, 0.06);
}

.selector-card__header {
  padding-bottom: 0;
}

.selector-card__title-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  width: 100%;
}

.selector-card__icon {
  width: 3.25rem;
  height: 3.25rem;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  background:
    linear-gradient(
      135deg,
      rgba(63, 81, 181, 0.12),
      rgba(63, 81, 181, 0.04)
    );
}

.selector-card__icon mat-icon {
  font-size: 1.5rem;
  width: 1.5rem;
  height: 1.5rem;
}

.selector-card__titles {
  min-width: 0;
  flex: 1;
}

.selector-card__titles mat-card-title {
  font-size: clamp(1.1rem, 2vw, 1.5rem);
  font-weight: 700;
  line-height: 1.4;
  margin-bottom: 0.35rem;
}

.selector-card__titles mat-card-subtitle {
  line-height: 1.7;
  font-size: 0.95rem;
}

.selector-card__content {
  padding-top: 1rem;
}

/* =========================================================
   FILTER GRID
========================================================= */

.filters-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  align-items: stretch;
}

.form-field {
  width: 100%;
}

/* =========================================================
   ACTION BUTTON
========================================================= */

.action-section {
  display: flex;
  align-items: stretch;
}

.view-button {
  width: 100%;
  min-height: 52px;
  border-radius: 0.9rem;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  font-size: 0.95rem;
  font-weight: 600;
}

/* =========================================================
   STATEMENT SECTION
========================================================= */

.statement-section {
  width: 100%;
  min-width: 0;
}

/* =========================================================
   EMPTY STATE
========================================================= */

.welcome-state {
  min-height: 320px;

  border-radius: 1.5rem;
  padding: 2rem 1.25rem;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;

  background:
    linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.015),
      rgba(0, 0, 0, 0.03)
    );

  border: 1px dashed rgba(0, 0, 0, 0.12);
}

.welcome-state__icon {
  width: 6rem;
  height: 6rem;
  border-radius: 50%;

  display: flex;
  align-items: center;
  justify-content: center;

  margin-bottom: 1.5rem;

  background:
    linear-gradient(
      135deg,
      rgba(63, 81, 181, 0.08),
      rgba(63, 81, 181, 0.02)
    );
}

.welcome-state__icon mat-icon {
  font-size: 3rem;
  width: 3rem;
  height: 3rem;
  opacity: 0.5;
}

.welcome-state__title {
  margin: 0 0 0.75rem;
  font-size: clamp(1.1rem, 2vw, 1.6rem);
  font-weight: 700;
  line-height: 1.5;
}

.welcome-state__description {
  margin: 0;
  max-width: 700px;

  font-size: 0.95rem;
  line-height: 1.9;

  opacity: 0.75;
}

/* =========================================================
   MATERIAL OVERRIDES
========================================================= */

:host ::ng-deep .mat-mdc-form-field-subscript-wrapper {
  margin-top: 0.25rem;
}

:host ::ng-deep .mat-mdc-text-field-wrapper {
  border-radius: 0.9rem;
}

:host ::ng-deep .mat-mdc-select-trigger {
  min-height: 24px;
}

:host ::ng-deep .mat-mdc-card-header-text {
  width: 100%;
}

/* =========================================================
   RESPONSIVE - TABLET
========================================================= */

@media (min-width: 768px) {

  .statement-selector-page {
    padding: 1rem;
    gap: 1.25rem;
  }

  .filters-grid {
    grid-template-columns:
      minmax(220px, 1fr)
      minmax(220px, 1fr)
      minmax(180px, 220px);
  }

  .selector-card__content {
    padding-top: 1.25rem;
  }

  .view-button {
    height: 56px;
  }
}

/* =========================================================
   RESPONSIVE - DESKTOP
========================================================= */

@media (min-width: 1024px) {

  .statement-selector-page {
    padding: 1.5rem;
  }

  .selector-card {
    border-radius: 1.5rem;
  }

  .selector-card__content {
    padding-top: 1.5rem;
  }

  .welcome-state {
    min-height: 380px;
    padding: 3rem 2rem;
  }
}

/* =========================================================
   PRINT
========================================================= */

@media print {

  .no-print {
    display: none !important;
  }

  .statement-selector-page {
    padding: 0;
  }

  .welcome-state {
    display: none;
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

:host ::ng-deep .mat-mdc-table-container,
:host ::ng-deep .table-responsive {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
  `]
})
export class StatementSelectorComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);

  // Updated entity types to reflect the new accounting ledgers.
  // EMPLOYEE is split into EMPLOYEE_SALARY (salary ledger) and ADVANCE (advances for both employees and partners).
  entityTypes = [
    { value: 'BUYER', label: 'المشترين (العملاء)' },
    { value: 'FARM', label: 'المزارع (الموردين)' },
    { value: 'PARTNER', label: 'الشركاء' },
    { value: 'EMPLOYEE_SALARY', label: 'الموظفين (المرتبات)' },
    { value: 'ADVANCE', label: 'السلف' },
    { value: 'SAFE', label: 'الخزينة' },
    { value: 'CUSTODY', label: 'العهدة' },
    { value: 'COST_CATEGORY', label: 'بنود المصروفات' }
  ];

  selectedType: string = '';
  selectedEntityId: number | null = null;
  selectedEntityName: string = '';
  entities: Entity[] = [];
  viewingStatement = false;

  ngOnInit(): void {}

  onTypeChange(): void {
    this.selectedEntityId = null;
    this.entities = [];
    this.viewingStatement = false;
    this.loadEntities();
  }

  onEntityChange(): void {
    this.viewingStatement = false;
    const entity = this.entities.find(e => e.id === this.selectedEntityId);
    this.selectedEntityName = entity ? entity.name : '';
  }

  loadEntities(): void {
    if (!this.selectedType) return;

    let endpoint = '';
    // Determine the API endpoint(s) based on the selected ledger type.
    let endpoints: string[] = [];
    switch (this.selectedType) {
      case 'BUYER': endpoints = ['buyers']; break;
      case 'FARM': endpoints = ['farms']; break;
      case 'PARTNER': endpoints = ['partners']; break;
      case 'EMPLOYEE_SALARY': endpoints = ['employees']; break;
      case 'ADVANCE': endpoints = ['employees', 'partners']; break; // polymorphic advance ledger
      case 'SAFE': endpoints = ['safes']; break;
      case 'CUSTODY': endpoints = ['custodies']; break;
      case 'COST_CATEGORY': endpoints = ['cost-categories']; break;
    }

    // Helper to normalize response data into a flat array of items.
    const normalize = (res: any, endpoint: string): any[] => {
      if (!res || !res.success || !res.data) return [];
      if (Array.isArray(res.data)) return res.data;
      const key = endpoint.replace('-', '_');
      if (res.data[key]) return res.data[key];
      // Specific fallbacks for known endpoints
      if (endpoint === 'buyers' && res.data.buyers) return res.data.buyers;
      if (endpoint === 'farms' && res.data.farms) return res.data.farms;
      if (endpoint === 'employees' && res.data.employees) return res.data.employees;
      if (endpoint === 'partners' && res.data.partners) return res.data.partners;
      if (endpoint === 'safes' && res.data.safes) return res.data.safes;
      if (endpoint === 'custodies' && res.data.custodies) return res.data.custodies;
      if (endpoint === 'cost-categories' && res.data.categories) return res.data.categories;
      // Generic fallback: first array property
      const arrKey = Object.keys(res.data).find(k => Array.isArray(res.data[k]));
      return arrKey ? res.data[arrKey] : [];
    };

    // Fetch all required endpoints and merge results.
    const requests = endpoints.map(ep => this.http.get<any>(`${environment.apiUrl}/${ep}`).toPromise());
    Promise.all(requests).then(responses => {
      let combined: any[] = [];
      responses.forEach((res, idx) => {
        combined = combined.concat(normalize(res, endpoints[idx]));
      });

      // For ADVANCE ledger we want to keep track of the person type for UI labeling.
      this.entities = combined.map((item: any) => {
        let name = '';
        if (this.selectedType === 'CUSTODY') {
          const date = item.custody_date ? new Date(item.custody_date).toLocaleDateString('ar-EG') : '';
          name = `عهدة #${item.id} - ${item.recipient_name || item.given_to_person_name || 'جهة'} (${date})`;
        } else if (this.selectedType === 'ADVANCE') {
          // Show person type alongside name for clarity.
          const typeLabel = item.person_type === 'EMPLOYEE' ? 'موظف' : 'شريك';
          name = `${item.full_name || item.name || `حساب #${item.id}`} (${typeLabel})`;
        } else {
          name = item.name || item.full_name || item.category_name || item.label || `حساب #${item.id}`;
        }
        return { id: item.id, name };
      });
    });
  }

  viewStatement(): void {
    if (this.selectedType && this.selectedEntityId) {
      this.viewingStatement = true;
    }
  }
}
