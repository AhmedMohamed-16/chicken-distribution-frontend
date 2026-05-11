import { Component, Inject, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdvanceService } from '../../../core/services/advance.service';
import { EmployeeAdvance } from '../../../core/models';
import { PaymentMethodSelectorComponent } from '../../../shared/components/payment-method-selector/payment-method-selector.component';
import { PersonSelectorComponent } from '../../../shared/components/person-selector/person-selector.component';
import { firstValueFrom } from 'rxjs';
import { ReportUtilitiesService } from '../../../core/services/ReportUtilitiesService';

@Component({
  selector: 'app-advance-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule,
    MatDatepickerModule, MatNativeDateModule, MatSnackBarModule,
    MatProgressSpinnerModule, PaymentMethodSelectorComponent, PersonSelectorComponent
  ],
  templateUrl: './advance-dialog.component.html',
  styles: [`
    /* =========================
       Advance Dialog - mobile-first
       ========================= */

    :host {
      display: block;
      direction: rtl;
    }

    .dialog-content {
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding-top: 15px;

      /* mobile-first sizing */
      padding-inline: clamp(12px, 3vw, 24px);

      /* remove rigid min-width that can break mobile */
      min-width: unset;
    }

    .form-row {
      display: flex;
      gap: 16px;
    }

    .form-row mat-form-field {
      flex: 1;
    }

    .full-width {
      width: 100%;
    }

    .info-box {
      background: #f7fafc;
      padding: 16px;
      border-radius: 10px;
      border-right: 4px solid #3182ce;
      margin-bottom: 8px;
    }

    .info-box p {
      margin: 0;
      color: #4a5568;
      font-size: 0.95rem;
      line-height: 1.4;
    }

    .info-box span {
      font-weight: 800;
      color: #2d3748;
    }

    .history-section {
      margin-top: 10px;
    }

    .history-card {
      background: white;
      border: 1px solid #edf2f7;
      border-radius: 12px;
      overflow: hidden;
    }

    .history-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      border-bottom: 1px solid #f7fafc;
      font-size: 0.95rem;
      min-width: 0; /* allow text truncation if needed */
    }

    .history-item:last-child {
      border-bottom: none;
    }

    .history-item .date {
      color: #718096;
      white-space: nowrap;
    }

    .history-item .amount {
      font-weight: 800;
      color: #38a169;
      white-space: nowrap;
    }

    /* Touch-friendly */
    mat-dialog-actions button {
      height: 44px;
    }

    /* ---------------- Mobile ---------------- */
    @media (max-width: 767px) {
      .dialog-content {
        gap: 16px;
      }

      .form-row {
        flex-direction: column;
        gap: 12px;
      }

      .info-box {
        padding: 14px;
      }

      .history-item {
        padding: 12px 14px;
        align-items: flex-start;
      }

      .history-item .date {
        white-space: normal;
      }
    }

    /* ---------------- Tablet ---------------- */
    @media (min-width: 768px) and (max-width: 1023px) {
      .dialog-content {
        padding-inline: 18px;
      }
    }
  `]
})
export class AdvanceDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private advanceService = inject(AdvanceService);
  private snackBar = inject(MatSnackBar);
  private utils = inject(ReportUtilitiesService);

  mode: 'CREATE' | 'RETURN' | 'VIEW' = 'CREATE';
  advance?: EmployeeAdvance;
  submitting = signal(false);
  isLoading = signal(false);

  advanceForm = this.fb.group({
    person_id: [null as number | null, Validators.required],
    person_type: ['EMPLOYEE' as string],
    amount: [null as number | null, [Validators.required, Validators.min(1)]],
    advance_date: [new Date(), Validators.required],
    expected_return_date: [null as Date | null],
    description: [''],
    payment_method: ['CASH', Validators.required],
    safe_id: [null as number | null, Validators.required]
  });

  returnForm = this.fb.group({
    amount: [null as number | null, [Validators.required, Validators.min(1)]],
    return_date: [new Date(), Validators.required],
    payment_method: ['CASH', Validators.required],
    safe_id: [null as number | null, Validators.required],
    notes: ['']
  });

  viewData = signal<any>(null);

  constructor(
    public dialogRef: MatDialogRef<AdvanceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.mode = data.mode;
    this.advance = data.advance;
  }

  ngOnInit(): void {
    if (this.mode === 'CREATE') {
      // PersonSelectorComponent handles loading people
    } else if (this.mode === 'RETURN' && this.advance) {
      const remaining = this.advance.amount - this.advance.returned_amount;
      this.returnForm.get('amount')?.setValidators([Validators.required, Validators.min(1), Validators.max(remaining)]);
      this.returnForm.patchValue({ amount: remaining });
    } else if (this.mode === 'VIEW' && this.advance) {
      this.loadDetails();
    }
  }



  async loadDetails() {
    if (!this.advance) return;
    this.isLoading.set(true);
    try {
      const res = await firstValueFrom(this.advanceService.getById(this.advance.id));
      this.viewData.set(res.data);
    } catch (e) {
      this.snackBar.open('فشل تحميل التفاصيل', 'حسناً', { duration: 3000 });
    } finally {
      this.isLoading.set(false);
    }
  }

  async onSubmit() {
    if (this.mode === 'CREATE') {
      await this.saveAdvance();
    } else {
      await this.saveReturn();
    }
  }

  async saveAdvance() {
    if (this.advanceForm.invalid) return;
    this.submitting.set(true);
    try {
      const fv = this.advanceForm.getRawValue();
      const dto = {
        ...fv,
        // Backend handles date strings
      };
      await firstValueFrom(this.advanceService.create(dto));
      this.snackBar.open('تم تسجيل السلفة بنجاح', 'حسناً', { duration: 3000 });
      this.dialogRef.close(true);
    } catch (e: any) {
      this.snackBar.open(e.error?.message || 'فشل تسجيل السلفة', 'حسناً', { duration: 3000 });
    } finally {
      this.submitting.set(false);
    }
  }

  async saveReturn() {
    if (this.returnForm.invalid || !this.advance) return;
    this.submitting.set(true);
    try {
      const fv = this.returnForm.getRawValue();
      await firstValueFrom(this.advanceService.recordReturn(this.advance.id, fv));
      this.snackBar.open('تم تسجيل استلام المبلغ بنجاح', 'حسناً', { duration: 3000 });
      this.dialogRef.close(true);
    } catch (e: any) {
      this.snackBar.open(e.error?.message || 'فشل تسجيل العملية', 'حسناً', { duration: 3000 });
    } finally {
      this.submitting.set(false);
    }
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  formatCurrency = (amt: number | undefined | null) => this.utils.formatCurrency(amt);

  getPersonName(): string {
    return this.advance?.person_name || this.advance?.employee?.full_name || 'غير محدد';
  }
}
