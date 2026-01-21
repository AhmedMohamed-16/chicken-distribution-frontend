import { Component, Inject, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {  MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Partner } from '../../../../core/models';


@Component({
  selector: 'app-form-dialog',
  imports: [  CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule],
  templateUrl: './form-dialog.html',
  styleUrl: './form-dialog.css',
})
export class FormDialog {
private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<FormDialog>);
  constructor(@Inject(MAT_DIALOG_DATA) public data: Partner) {}


  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    phone: [''],
    address: [''],
    investment_amount: [0, [Validators.required, Validators.min(0)]],
    investment_percentage: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
    is_vehicle_partner: [false]
  });

  ngOnInit(): void {
    if (this.data) {
      this.form.patchValue(this.data);
    }
  }

  onSave(): void {
    if (this.form.valid) {
      (this.dialogRef as any).close(this.form.getRawValue());
    }
  }
}
