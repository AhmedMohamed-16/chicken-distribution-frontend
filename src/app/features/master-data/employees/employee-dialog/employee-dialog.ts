import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Employee } from '../../../../core/models';

@Component({
  selector: 'app-employee-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSlideToggleModule
  ],
  templateUrl: './employee-dialog.html',
  styleUrl: './employee-dialog.css',
})
export class EmployeeDialog implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<EmployeeDialog>);
  
  isEditMode = false;

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    phone: [''],
    national_id: ['', [Validators.pattern('^[0-9]{14}$')]],
    role: [''],
    is_active: [true]
  });

  constructor(@Inject(MAT_DIALOG_DATA) public data: Employee) {}

  ngOnInit(): void {
    if (this.data) {
      this.isEditMode = true;
      this.form.patchValue(this.data);
    } else {
      // In create mode, status defaults to active and might not be editable
      // depending on requirement, but here we allow it.
    }
  }

  onSave(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    } else {
      this.form.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
