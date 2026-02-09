// import { Component, Inject, inject } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
// import {
//   MAT_DIALOG_DATA,
//   MatDialogModule,
//   MatDialogRef,
// } from '@angular/material/dialog';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatButtonModule } from '@angular/material/button';
// import { MatCheckboxModule } from '@angular/material/checkbox';

// @Component({
//   selector: 'app-form-dialog',
//   imports: [CommonModule,
//     ReactiveFormsModule,
//     MatDialogModule,
//     MatFormFieldModule,
//     MatInputModule,
//     MatButtonModule,
//     MatCheckboxModule,],
//   templateUrl: './form-dialog.html',
//   styleUrl: './form-dialog.css',
// })
// export class FormDialog {
//   private fb = inject(FormBuilder);
//   private dialogRef = inject(MatDialogRef<FormDialog>);

//   constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

//   form = this.fb.nonNullable.group({
//     name: ['', Validators.required],
//     description: [''],
//     is_vehicle_cost: [false],
//   });

//   ngOnInit(): void {
//     if (this.data) {
//       this.form.patchValue(this.data);
//     }
//   }

//   onSave(): void {
//     if (this.form.valid) {
//       this.dialogRef.close(this.form.getRawValue());
//     }
//   }
// }
// form-dialog.component.ts
import { Component, Inject, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CostCategory } from '../../../../core/models';

@Component({
  selector: 'app-form-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
  ],
  templateUrl: './form-dialog.html',
  styleUrl: './form-dialog.css',
})
export class FormDialog implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<FormDialog>);

  constructor(@Inject(MAT_DIALOG_DATA) public data: CostCategory | null) {}

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    is_vehicle_cost: [false],
  });

  get isEditMode(): boolean {
    return this.data !== null;
  }

  ngOnInit(): void {
    if (this.data) {
      this.form.patchValue({
        name: this.data.name,
        description: this.data.description || '',
        is_vehicle_cost: this.data.is_vehicle_cost,
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
