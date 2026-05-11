import { Component, Inject, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormArray, FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { Partner, Vehicle, VehiclePartner } from '../../../../core/models';
import { VehicleService } from '../../../../core/services/vehicle.service';
import { PaymentMethodSelectorComponent } from '../../../../shared/components/payment-method-selector/payment-method-selector.component';

interface VehicleShareFormValue {
  vehicle_id: number | null;
  share_percentage: number;
}

interface PartnerFormValue {
  name: string;
  phone: string;
  address: string;
  investment_amount: number;
  investment_percentage: number;
  vehicle_shares: VehicleShareFormValue[];
}

interface VehicleShareFormGroup {
  vehicle_id: FormControl<number | null>;
  share_percentage: FormControl<number>;
}

@Component({
  selector: 'app-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatDividerModule,
    PaymentMethodSelectorComponent
  ],
  templateUrl: './form-dialog.html',
  styleUrl: './form-dialog.css',
})
export class FormDialog implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<FormDialog>);
  private vehicleService = inject(VehicleService);

  vehicles = signal<Vehicle[]>([]);
  existingVehicleShares = signal<Map<number, number>>(new Map());

  // Track original investment amount for edit mode
  originalInvestmentAmount = signal<number>(0);
  // Track current investment amount as a signal for proper reactivity
  currentInvestmentAmount = signal<number>(0);

  investmentChanged = computed(() => {
    return Number(this.currentInvestmentAmount()) !== Number(this.originalInvestmentAmount());
  });

  selectedVehicleIds = computed(() => {
    return this.vehicleShares.controls
      .map(control => control.get('vehicle_id')?.value)
      .filter(id => id != null);
  });

  availableVehicles = computed(() => {
    const allVehicles = this.vehicles();
    if (!Array.isArray(allVehicles)) {
      return [];
    }
    return allVehicles;
  });

  totalVehicleShares = computed(() => {
    const sharesByVehicle = new Map<number, number>();

    this.vehicleShares.controls.forEach(control => {
      const vehicleId = control.get('vehicle_id')?.value;
      const share = control.get('share_percentage')?.value || 0;

      if (vehicleId) {
        const current = sharesByVehicle.get(vehicleId) || 0;
        sharesByVehicle.set(vehicleId, current + share);
      }
    });

    return sharesByVehicle;
  });

  constructor(@Inject(MAT_DIALOG_DATA) public data: Partner | null) {}

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    phone: [''],
    address: [''],
    investment_amount: [0, [Validators.required, Validators.min(0)]],
    investment_percentage: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
    vehicle_shares: this.fb.array<FormGroup<VehicleShareFormGroup>>([]),
    payment_method: [''],
    safe_id: [null as number | null]
  });

  get vehicleShares(): FormArray {
    return this.form.get('vehicle_shares') as FormArray;
  }

  // Alias for template compatibility with old naming
  get vehiclePartnerships(): FormArray {
    return this.vehicleShares;
  }

  ngOnInit(): void {
    this.loadVehicles();

    if (this.data) {
      this.originalInvestmentAmount.set(Number(this.data.investment_amount) || 0);
      this.form.patchValue({
        name: this.data.name,
        phone: this.data.phone || '',
        address: this.data.address || '',
        investment_amount: this.data.investment_amount,
        investment_percentage: this.data.investment_percentage
      });

      // Handle vehicles array from backend response
      if (this.data.vehicles && Array.isArray(this.data.vehicles)) {
        this.data.vehicles.forEach(vehicle => {
          const sharePercentage = vehicle.vehicle_share?.share_percentage ||
                                 (vehicle as any).VehiclePartner?.share_percentage || 0;

          this.addVehicleShare({
            vehicle_id: vehicle.id,
            partner_id: this.data!.id,
            share_percentage: sharePercentage
          });
        });
      }
    }

    // Dynamic validation: payment_method and safe_id are required when investment_amount > 0
    // and when creating new partner OR when editing and investment amount changed
    this.form.get('investment_amount')?.valueChanges.subscribe((value) => {
      this.currentInvestmentAmount.set(Number(value) || 0);
      this.updatePaymentValidators();
    });

    // Initialize current investment signal
    this.currentInvestmentAmount.set(Number(this.form.get('investment_amount')?.value) || 0);

    // Initial validator setup
    this.updatePaymentValidators();
  }
  private updatePaymentValidators(): void {
    const investmentAmount = Number(this.form.get('investment_amount')?.value) || 0;
    const paymentMethodControl = this.form.get('payment_method');
    const safeIdControl = this.form.get('safe_id');

    // Payment fields required when:
    // 1. Creating new partner and investment > 0
    // 2. Editing partner and investment amount changed and > 0
    const requiresPayment = investmentAmount > 0 && (
      !this.data || // new partner
      this.investmentChanged() // edit mode with changed amount
    );

    if (requiresPayment) {
      paymentMethodControl?.setValidators([Validators.required]);
      safeIdControl?.setValidators([Validators.required]);
    } else {
      paymentMethodControl?.clearValidators();
      safeIdControl?.clearValidators();
    }

    paymentMethodControl?.updateValueAndValidity();
    safeIdControl?.updateValueAndValidity();
  }

  loadVehicles(): void {
    this.vehicleService.getAll().subscribe({
      next: (response: any) => {
        const vehicles = Array.isArray(response.data) ? response.data : [];
        this.vehicles.set(vehicles);
        this.loadExistingVehicleShares(vehicles);
      },
      error: (err) => {
        console.error('Failed to load vehicles:', err);
        this.vehicles.set([]);
      }
    });
  }

  loadExistingVehicleShares(vehicles: Vehicle[]): void {
    const sharesMap = new Map<number, number>();

    vehicles.forEach(vehicle => {
      if (vehicle.partners && Array.isArray(vehicle.partners)) {
        const totalShares = vehicle.partners.reduce((sum, partner) => {
          if (this.data && partner.id === this.data.id) {
            return sum;
          }
          const sharePercentage = (partner as any).VehiclePartner?.share_percentage || 0;
          return sum + parseFloat(sharePercentage.toString());
        }, 0);

        sharesMap.set(vehicle.id, totalShares);
      }
    });

    this.existingVehicleShares.set(sharesMap);
  }

  addVehicleShare(existingData?: VehiclePartner): void {
    const share = this.fb.group({
      vehicle_id: [existingData?.vehicle_id || null, Validators.required],
      share_percentage: [
        existingData?.share_percentage || 0,
        [Validators.required, Validators.min(0.01), Validators.max(100)]
      ]
    });

    this.vehicleShares.push(share);
  }

  removeVehicleShare(index: number): void {
    this.vehicleShares.removeAt(index);
  }

  // Alias for template compatibility
  addVehiclePartnership(existingData?: VehiclePartner): void {
    this.addVehicleShare(existingData);
  }

  removeVehiclePartnership(index: number): void {
    this.removeVehicleShare(index);
  }

  isVehicleFullyInvested(vehicleId: number, currentIndex: number): boolean {
    const existingShares = this.existingVehicleShares().get(vehicleId) || 0;

    const currentPartnerShares = this.vehicleShares.controls
      .filter((control, index) => index !== currentIndex)
      .reduce((sum, control) => {
        if (control.get('vehicle_id')?.value === vehicleId) {
          return sum + (control.get('share_percentage')?.value || 0);
        }
        return sum;
      }, 0);

    const totalShares = existingShares + currentPartnerShares;
    return totalShares >= 100;
  }

  getVehicleName(vehicleId: number): string {
    const allVehicles = this.vehicles();
    if (!Array.isArray(allVehicles)) {
      return '';
    }
    const vehicle = allVehicles.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.name} - ${vehicle.plate_number}` : '';
  }

  getVehicleShareWarning(vehicleId: number): string | null {
    const existingShares = this.existingVehicleShares().get(vehicleId) || 0;
    const currentShares = this.vehicleShares.controls
      .filter(control => control.get('vehicle_id')?.value === vehicleId)
      .reduce((sum, control) => sum + (control.get('share_percentage')?.value || 0), 0);

    const total = Number(existingShares) + Number(currentShares);

    if (total > 100) {
      return `تحذير: إجمالي المشاركات في هذه المركبة ${total.toFixed(2)}% (يجب أن يكون ≤ 100%)`;
    }

    if (total === 100) {
      return `تم اكتمال استثمار هذه المركبة (${total}%)`;
    }

    return null;
  }

  isFormValid(): boolean {
    if (!this.form.valid) {
      return false;
    }

    // Validate that no vehicle has partnerships exceeding 100%
    for (const control of this.vehicleShares.controls) {
      const vehicleId = control.get('vehicle_id')?.value;
      if (vehicleId) {
        const existingShares = this.existingVehicleShares().get(vehicleId) || 0;
        const totalCurrentShares = this.vehicleShares.controls
          .filter(c => c.get('vehicle_id')?.value === vehicleId)
          .reduce((sum, c) => sum + (Number(c.get('share_percentage')?.value) || 0), 0);
        if ((Number(existingShares) + Number(totalCurrentShares)) > 100) {
          return false;
        }
      }
    }

    return true;
  }

  onSave(): void {
    if (this.isFormValid()) {
      const formValue = this.form.getRawValue();

      // Clean up vehicle_shares: remove empty entries
      const cleanedShares = formValue.vehicle_shares.filter(
        vs => vs.vehicle_id != null && vs.share_percentage > 0
      );

      const result: any = {
        name: formValue.name,
        phone: formValue.phone,
        address: formValue.address,
        investment_amount: formValue.investment_amount,
        investment_percentage: formValue.investment_percentage,
        vehicle_shares: cleanedShares
      };

      // Include payment fields when investment > 0 and (new partner or changed investment)
      const investmentAmount = Number(formValue.investment_amount) || 0;
      const investmentChanged = Number(formValue.investment_amount) !== Number(this.originalInvestmentAmount());

      if (investmentAmount > 0 && (!this.data || investmentChanged)) {
        result.payment_method = formValue.payment_method;
        result.safe_id = formValue.safe_id;
      }

      this.dialogRef.close(result);
    }
  }
}

