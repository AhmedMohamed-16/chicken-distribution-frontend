import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { EmployeeService } from '../../../core/services/employee.service';
import { PartnerService } from '../../../core/services/partner.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-person-selector',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule
  ],
  template: `
<div
  [formGroup]="parentForm"
  class="person-selector-container">

  <!-- =====================================================
       SECTION HEADER
  ====================================================== -->

  <div class="section-header">

    <div class="section-title-wrapper">

      <h3 class="section-title">
        {{ label }}
      </h3>

      <p class="section-subtitle">
        اختر الشخص المرتبط بالعملية الحالية
      </p>

    </div>

  </div>

  <!-- =====================================================
       PERSON SELECTOR
  ====================================================== -->

  <div class="selector-card">

    <mat-form-field
      appearance="outline"
      class="form-field">

      <mat-label>
        {{ label }}
      </mat-label>

      <mat-select [formControlName]="idControlName">

        @for (person of people(); track person.id + '-' + person.type) {

          <mat-option [value]="person.id">

            <div class="person-option">

              <div class="person-main-info">

                <span class="person-name">
                  {{ person.name }}
                </span>

              </div>

              <span
                class="person-badge"
                [class.employee-badge]="person.type === 'EMPLOYEE'"
                [class.partner-badge]="person.type === 'PARTNER'">

                {{
                  person.type === 'EMPLOYEE'
                    ? 'موظف'
                    : 'شريك'
                }}

              </span>

            </div>

          </mat-option>
        }

      </mat-select>

      @if (parentForm.get(idControlName)?.hasError('required')) {

        <mat-error>
          {{ label }} مطلوب
        </mat-error>

      }

      @if (people().length === 0) {

        <mat-hint>
          لا توجد بيانات متاحة حالياً
        </mat-hint>

      }

    </mat-form-field>

  </div>

</div>
  `,
  styles: [`
/* =========================================================
   ROOT CONTAINER
========================================================= */

.person-selector-container {
  width: 100%;

  display: flex;
  flex-direction: column;
  gap: 1rem;

  direction: rtl;
}

/* =========================================================
   HEADER
========================================================= */

.section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;

  gap: 1rem;
}

.section-title-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.section-title {
  margin: 0;

  font-size: clamp(1rem, 2vw, 1.15rem);
  font-weight: 800;

  color: #111827;
}

.section-subtitle {
  margin: 0;

  font-size: 0.85rem;
  line-height: 1.5;

  color: #6b7280;
}

/* =========================================================
   CARD
========================================================= */

.selector-card {
  padding: 1rem;

  border-radius: 1rem;

  background:
    linear-gradient(
      180deg,
      rgba(250, 250, 250, 0.96) 0%,
      rgba(245, 245, 245, 0.92) 100%
    );

  border: 1px solid rgba(0, 0, 0, 0.06);
}

/* =========================================================
   FORM FIELD
========================================================= */

.form-field {
  width: 100%;
}

/* =========================================================
   PERSON OPTION
========================================================= */

.person-option {
  width: 100%;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 0.75rem;

  padding-block: 0.15rem;
}

.person-main-info {
  min-width: 0;

  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.person-name {
  font-size: 0.95rem;
  font-weight: 600;

  color: #111827;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* =========================================================
   BADGES
========================================================= */

.person-badge {
  flex-shrink: 0;

  padding: 0.3rem 0.7rem;

  border-radius: 999px;

  font-size: 0.72rem;
  font-weight: 700;

  line-height: 1;
}

.employee-badge {
  background: rgba(59, 130, 246, 0.12);
  color: #1d4ed8;
}

.partner-badge {
  background: rgba(16, 185, 129, 0.12);
  color: #047857;
}

/* =========================================================
   MOBILE
========================================================= */

@media (max-width: 767px) {

  .person-selector-container {
    gap: 0.875rem;
  }

  .selector-card {
    padding: 0.875rem;
    border-radius: 0.875rem;
  }

  .person-option {
    align-items: flex-start;
    flex-direction: column;
  }

  .person-badge {
    align-self: flex-start;
  }

  .person-name {
    white-space: normal;
    line-height: 1.5;
  }
}

/* =========================================================
   TABLET
========================================================= */

@media (min-width: 768px) {

  .selector-card {
    padding: 1.15rem;
  }
}

/* =========================================================
   DESKTOP
========================================================= */

@media (min-width: 1024px) {

  .person-selector-container {
    gap: 1.25rem;
  }

  .selector-card {
    padding: 1.25rem;
  }
}

/* =========================================================
   MATERIAL CUSTOMIZATION
========================================================= */

.form-field ::ng-deep .mdc-notched-outline__leading,
.form-field ::ng-deep .mdc-notched-outline__notch,
.form-field ::ng-deep .mdc-notched-outline__trailing {
  border-radius: 0.875rem;
}

.form-field ::ng-deep .mat-mdc-form-field-subscript-wrapper {
  padding-inline: 0.25rem;
}

/* =========================================================
   ACCESSIBILITY & INTERACTION
========================================================= */

@media (hover: hover) {

  .selector-card {
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease,
      border-color 0.2s ease;
  }

  .selector-card:hover {
    transform: translateY(-1px);

    border-color: rgba(0, 0, 0, 0.08);

    box-shadow:
      0 8px 24px rgba(0, 0, 0, 0.05);
  }
}

/* =========================================================
   RTL SUPPORT
========================================================= */

:host {
  display: block;
  width: 100%;
  direction: rtl;
}
  `]
})
export class PersonSelectorComponent implements OnInit {
  @Input({ required: true }) parentForm!: FormGroup;
  @Input() label: string = 'الشخص';
  @Input() typeControlName: string = 'person_type';
  @Input() idControlName: string = 'person_id';

  private employeeService = inject(EmployeeService);
  private partnerService = inject(PartnerService);

  people = signal<any[]>([]);

  ngOnInit(): void {
    this.loadAllPeople();

    // لما المستخدم يختار شخص
    this.parentForm.get(this.idControlName)?.valueChanges.subscribe(id => {
      const selected = this.people().find(p => p.id === id);

      if (selected) {
        // set النوع أوتوماتيك
        this.parentForm.get(this.typeControlName)?.setValue(selected.type);
      }
    });
  }

  loadAllPeople(): void {
    forkJoin({
      employees: this.employeeService.getAll(true),
      partners: this.partnerService.getAll()
    }).subscribe(({ employees, partners }) => {

      const employeeList = employees.data.map((e: any) => ({
        id: e.id,
        name: e.full_name,
        type: 'EMPLOYEE'
      }));

      const partnerList =  partners.data.map((p: any) => ({
        id: p.id,
        name: p.name,
        type: 'PARTNER'
      }));

      // دمج الكل
      this.people.set([...employeeList, ...partnerList]);
      console.log("this.people",this.people());

    });
  }
}
