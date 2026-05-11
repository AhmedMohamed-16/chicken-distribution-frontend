import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Safe } from '../../../../core/models';


@Component({
  selector: 'app-safe-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSlideToggleModule
  ],


  template: `
    <h2 mat-dialog-title>{{ isEdit ? 'تعديل خزنة / حساب' : 'إضافة خزنة / حساب جديد' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="safe-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>الاسم</mat-label>
          <input matInput formControlName="name" placeholder="مثال: الخزنة الرئيسية، حساب البنك الأهلي" required>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>النوع</mat-label>
          <mat-select formControlName="type" [disabled]="isEdit">
            <mat-option value="CASH">نقدي</mat-option>
            <mat-option value="BANK">بنك</mat-option>
            <mat-option value="VODAFONE_CASH">فودافون كاش</mat-option>
            <mat-option value="INSTAPAY">انستاباي</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>بدايه رصيد المده</mat-label>
          <input matInput type="number" formControlName="current_balance" placeholder="0.00" step="0.01" min="0">
          <mat-hint>الرصيد الأولي للخزنة</mat-hint>
        </mat-form-field>

        <mat-slide-toggle formControlName="is_active" class="toggle-control">
          حالة الخزنة
        </mat-slide-toggle>

        <div class="toggle-status" [class.inactive]="!form.get('is_active')?.value">
          الخزنة {{ form.get('is_active')?.value ? 'فعالة' : 'غير فعالة' }}
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>ملاحظات</mat-label>
          <textarea matInput formControlName="notes" placeholder="ملاحظات إضافية (اختياري)"></textarea>
        </mat-form-field>

      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">إلغاء</button>
      <button mat-raised-button color="primary" (click)="onSave()" [disabled]="form.invalid">
        {{ isEdit ? 'حفظ التعديلات' : 'إضافة' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .safe-form { display: flex; flex-direction: column; gap: 8px; padding: 12px 0; }
    .full-width { width: 100%; }
    .toggle-status {
      margin: 8px 0;
      padding: 8px 12px;
      border-radius: 4px;
      background: #f5f5f5;
      font-weight: 500;
    }
    .toggle-status.inactive {
      opacity: 0.6;
      color: #666;
      background: #f0f0f0;
    }
  `]
})
export class SafeFormDialog implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<SafeFormDialog>);
  isEdit = false;

  form = this.fb.group({
    name: ['', Validators.required],
    type: ['CASH', Validators.required],
    current_balance: [0, [Validators.min(0)]],
    is_active: [true],
    notes: ['']
  });



  constructor(@Inject(MAT_DIALOG_DATA) public data: Safe) {}

  ngOnInit(): void {
    if (this.data) {
      this.isEdit = true;
      this.form.patchValue({
        ...this.data,
        current_balance: this.data.current_balance || 0
      });
    }
  }


  onSave(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.getRawValue());
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
