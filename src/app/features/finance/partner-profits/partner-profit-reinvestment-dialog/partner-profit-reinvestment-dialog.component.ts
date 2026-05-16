import { Component, signal, inject, ChangeDetectionStrategy } from '@angular/core';

import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { firstValueFrom } from 'rxjs';

import { PartnerProfitService } from '../../../../core/services/partner-profit.service';
import { PartnerBalance } from '../../../../core/models';
import { ReportUtilitiesService } from '../../../../core/services/ReportUtilitiesService';

@Component({
  selector: 'app-partner-profit-reinvestment-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule
],
  templateUrl: './partner-profit-reinvestment-dialog.component.html',
  styleUrls: ['./partner-profit-reinvestment-dialog.component.css']
})
export class PartnerProfitReinvestmentDialogComponent {
  readonly fb = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef<PartnerProfitReinvestmentDialogComponent>);
  readonly data = inject(MAT_DIALOG_DATA) as { partner: PartnerBalance };
  readonly service = inject(PartnerProfitService);
  readonly snackbar = inject(MatSnackBar);
  readonly utils = inject(ReportUtilitiesService);

  readonly submitting = signal(false);
  readonly reinvestForm = this.fb.group({
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    reinvest_date: [new Date(), Validators.required],
    notes: ['']
  });

  readonly partner = this.data.partner;

  formatCurrency(amount: number): string {
    return this.utils.formatCurrency(amount);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  async submit(): Promise<void> {
    if (this.reinvestForm.invalid) return;

    const value = this.reinvestForm.value as any;
    const amount = value.amount ?? 0;

    if (amount > this.partner.current_balance) {
      this.snackbar.open('المبلغ أكبر من رصيد الأرباح المتاح', 'حسناً', {
        duration: 4000,
        panelClass: ['warn-snackbar']
      });
      return;
    }

    this.submitting.set(true);
    try {
      await firstValueFrom(
        this.service.recordReinvestment(this.partner.partner.id, value)
      );
      this.dialogRef.close(true);
    } catch (error) {
      console.error('Reinvestment failed:', error);
      this.snackbar.open('فشل إعادة الاستثمار', 'حسناً', { duration: 4000 });
    } finally {
      this.submitting.set(false);
    }
  }
}
