import { Component, Inject, OnInit, inject } from '@angular/core';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { SafeDashboard } from '../../../../core/models';

@Component({
  selector: 'app-safe-transfer-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule
],
  template: `
    <h2 mat-dialog-title>تحويل بين الخزن</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="transfer-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>من خزنة</mat-label>
          <mat-select formControlName="from_safe_id">
            @for (safe of data.safes; track safe.id) {
              <mat-option [value]="safe.id">{{ safe.name }} ({{ safe.current_balance }} ج.م)</mat-option>
            }
          </mat-select>
        </mat-form-field>
    
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>إلى خزنة</mat-label>
          <mat-select formControlName="to_safe_id">
            @for (safe of filteredToSafes; track safe.id) {
              <mat-option [value]="safe.id">{{ safe.name }}</mat-option>
            }
          </mat-select>
          @if (form.get('to_safe_id')?.hasError('sameSafe')) {
            <mat-error>لا يمكن التحويل لنفس الخزنة</mat-error>
          }
        </mat-form-field>
    
        <div class="row">
          <mat-form-field appearance="outline" class="half-width">
            <mat-label>المبلغ</mat-label>
            <input matInput type="number" formControlName="amount" placeholder="0.00">
            @if (form.get('amount')?.hasError('required')) {
              <mat-error>المبلغ مطلوب</mat-error>
            }
            @if (form.get('amount')?.hasError('min')) {
              <mat-error>المبلغ يجب أن يكون أكبر من 0</mat-error>
            }
          </mat-form-field>
    
          <mat-form-field appearance="outline" class="half-width">
            <mat-label>التاريخ</mat-label>
            <input matInput [matDatepicker]="picker" formControlName="date">
            <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
          </mat-form-field>
        </div>
    
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>ملاحظات</mat-label>
          <textarea matInput formControlName="notes" placeholder="ملاحظات حول التحويل"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">إلغاء</button>
      <button mat-raised-button color="primary" (click)="onSave()" [disabled]="form.invalid">
        تأكيد التحويل
      </button>
    </mat-dialog-actions>
    `,
  styles: [`
    .transfer-form { display: flex; flex-direction: column; gap: 8px; padding: 12px 0; }
    .full-width { width: 100%; }
    .half-width { width: 48%; }
    .row { display: flex; justify-content: space-between; }
  `]
})
export class SafeTransferDialog implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<SafeTransferDialog>);
  
  form = this.fb.group({
    from_safe_id: [null as number | null, Validators.required],
    to_safe_id: [null as number | null, Validators.required],
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    date: [new Date(), Validators.required],
    notes: ['']
  }, { validators: this.sameSafeValidator });

  constructor(@Inject(MAT_DIALOG_DATA) public data: { safes: SafeDashboard[] }) {}

  ngOnInit(): void {}

  get filteredToSafes() {
    return this.data.safes.filter(s => s.id !== this.form.get('from_safe_id')?.value);
  }

  sameSafeValidator(group: any) {
    const from = group.get('from_safe_id')?.value;
    const to = group.get('to_safe_id')?.value;
    if (from && to && from === to) {
      group.get('to_safe_id')?.setErrors({ sameSafe: true });
      return { sameSafe: true };
    }
    return null;
  }

  onSave(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
