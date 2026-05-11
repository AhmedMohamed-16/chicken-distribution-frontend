import { Component, Inject, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Vehicle } from '../../../../core/models';
import { Safe } from '../../../../core/models/safe.model';
import { SafeService } from '../../../../core/services/safe.service';

export interface VehicleFormResult {
  name: string;
  plate_number: string;
  purchase_price: number;
  empty_weight: number | null;
  payment_source: 'safe' | 'partners';
  safe_id?: number;
  navigate_to_partners?: boolean;
}

@Component({
  selector: 'app-form-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './form-dialog.html',
  styleUrl: './form-dialog.css',
})
export class FormDialog implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<FormDialog>);
  private safeService = inject(SafeService);

  constructor(@Inject(MAT_DIALOG_DATA) public data?: Vehicle) {}

  safes = signal<Safe[]>([]);
  loadingSafes = signal(false);

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    plate_number: [''],
    purchase_price: [0, [Validators.required, Validators.min(0)]],
    empty_weight: [null as number | null, [Validators.min(0)]],
    payment_source: ['safe' as 'safe' | 'partners', Validators.required],
    safe_id: [null as number | null],
  });

  get paymentSource() {
    return this.form.get('payment_source')!.value;
  }

  ngOnInit(): void {
    if (this.data) {
      this.form.patchValue({
        name: this.data.name,
        plate_number: this.data.plate_number ?? '',
        purchase_price: this.data.purchase_price,
        empty_weight: this.data.empty_weight ?? null,
        payment_source: this.data.payment_source ?? 'safe',
        safe_id: this.data.safe_id
      });
    }

    this.loadSafes();

    // Dynamically require safe_id when payment source is 'safe'
    this.form.get('payment_source')!.valueChanges.subscribe(source => {
      const safeCtrl = this.form.get('safe_id')!;
      if (source === 'safe') {
        safeCtrl.setValidators([Validators.required]);
      } else {
        safeCtrl.clearValidators();
        safeCtrl.setValue(null);
      }
      safeCtrl.updateValueAndValidity();
    });

    // Trigger initial validator setup
    this.form.get('payment_source')!.updateValueAndValidity({ emitEvent: true });
  }

  loadSafes(): void {
    this.loadingSafes.set(true);
    this.safeService.getAll().subscribe({
      next: (res: any) => {
        this.safes.set((res.data ?? []).filter((s: Safe) => s.is_active));
        this.loadingSafes.set(false);
      },
      error: () => this.loadingSafes.set(false)
    });
  }

  onSave(): void {
    if (this.form.invalid) return;
    const raw = this.form.getRawValue();

    const result: VehicleFormResult = {
      name: raw.name,
      plate_number: raw.plate_number,
      purchase_price: raw.purchase_price,
      empty_weight: raw.empty_weight,
      payment_source: raw.payment_source,
      ...(raw.payment_source === 'safe' && raw.safe_id ? { safe_id: raw.safe_id } : {}),
    };

    this.dialogRef.close(result);
  }

  onGoToPartners(): void {
    if (this.form.get('name')!.invalid) return;
    const raw = this.form.getRawValue();

    const result: VehicleFormResult = {
      name: raw.name,
      plate_number: raw.plate_number,
      purchase_price: raw.purchase_price,
      empty_weight: raw.empty_weight,
      payment_source: 'partners',
      navigate_to_partners: true,
    };

    this.dialogRef.close(result);
  }
}
