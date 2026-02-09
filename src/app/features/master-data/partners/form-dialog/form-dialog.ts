// import { Component, Inject, OnInit, inject, signal, computed } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormBuilder, FormArray, FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
// import { MatButtonModule } from '@angular/material/button';
// import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatCheckboxModule } from '@angular/material/checkbox';
// import { MatSelectModule } from '@angular/material/select';
// import { MatIconModule } from '@angular/material/icon';
// import { MatChipsModule } from '@angular/material/chips';
// import { Partner, Vehicle, VehiclePartner } from '../../../../core/models';
// import { VehicleService } from '../../../../core/services/vehicle.service';

// interface VehiclePartnershipFormValue {
//   vehicle_id: number | null;
//   share_percentage: number;
// }

// // Define the shape of the entire form
// interface PartnerFormValue {
//   name: string;
//   phone: string;
//   address: string;
//   investment_amount: number;
//   investment_percentage: number;
//   vehicle_partnerships: VehiclePartnershipFormValue[];
// }
// // For better type safety with FormGroups
// interface VehiclePartnershipFormGroup {
//   vehicle_id: FormControl<number | null>;
//   share_percentage: FormControl<number>;
// }

// @Component({
//   selector: 'app-form-dialog',
//   imports: [  CommonModule,
//     ReactiveFormsModule,
//     MatDialogModule,
//     MatFormFieldModule,
//     MatInputModule,
//     MatButtonModule,
//     MatCheckboxModule,
//     MatSelectModule,
//     MatIconModule,
//     MatChipsModule
// ],
//   templateUrl: './form-dialog.html',
//   styleUrl: './form-dialog.css',
// })
// export class FormDialog implements OnInit {
//   private fb = inject(FormBuilder);
//   private dialogRef = inject(MatDialogRef<FormDialog>);
//   private vehicleService = inject(VehicleService);

//   // ✅ Load available vehicles - Initialize with empty array
//   vehicles = signal<Vehicle[]>([]);

//   // ✅ Computed: vehicles already selected in partnerships
//   selectedVehicleIds = computed(() => {
//     return this.vehiclePartnerships.controls
//       .map(control => control.get('vehicle_id')?.value)
//       .filter(id => id != null);
//   });

//   // ✅ Computed: all available vehicles
//   availableVehicles = computed(() => {
//     const allVehicles = this.vehicles();

//     // Safety check: ensure allVehicles is actually an array
//     if (!Array.isArray(allVehicles)) {
//       return [];
//     }

//     return allVehicles;
//   });

//   // ✅ Computed: Total vehicle partnership percentages
//   totalVehicleShares = computed(() => {
//     const sharesByVehicle = new Map<number, number>();

//     this.vehiclePartnerships.controls.forEach(control => {
//       const vehicleId = control.get('vehicle_id')?.value;
//       const share = control.get('share_percentage')?.value || 0;

//       if (vehicleId) {
//         const current = sharesByVehicle.get(vehicleId) || 0;
//         sharesByVehicle.set(vehicleId, current + share);
//       }
//     });

//     return sharesByVehicle;
//   });

//   constructor(@Inject(MAT_DIALOG_DATA) public data: Partner | null) {}

//   // ✅ REFACTORED FORM - Remove is_vehicle_partner, add vehicle_partnerships
//   form = this.fb.nonNullable.group({
//     name: ['', Validators.required],
//     phone: [''],
//     address: [''],
//     investment_amount: [0, [Validators.required, Validators.min(0)]],
//     investment_percentage: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
//     // ❌ REMOVED: is_vehicle_partner: [false]
//     // ✅ ADDED: vehicle_partnerships FormArray
//     vehicle_partnerships: this.fb.array<FormGroup<VehiclePartnershipFormGroup>>([])
//   });

//   // ✅ Getter for FormArray
//   get vehiclePartnerships(): FormArray {
//     return this.form.get('vehicle_partnerships') as FormArray;
//   }

//   ngOnInit(): void {
//     this.loadVehicles();

//     // ✅ Populate form with existing data
//     if (this.data) {
//       this.form.patchValue({
//         name: this.data.name,
//         phone: this.data.phone || '',
//         address: this.data.address || '',
//         investment_amount: this.data.investment_amount,
//         investment_percentage: this.data.investment_percentage
//       });

//       // ✅ Populate vehicle partnerships if they exist
//       if (this.data.vehicle_partnerships && this.data.vehicle_partnerships.length > 0) {
//         this.data.vehicle_partnerships.forEach(vp => {
//           this.addVehiclePartnership(vp);
//         });
//       }
//     }
//   }

//   loadVehicles(): void {
//     this.vehicleService.getAll().subscribe({
//       next: (vehicles:any) => {
//         // Ensure vehicles is always an array
//         this.vehicles.set(Array.isArray(vehicles.data) ? vehicles.data : []);
//         console.log(vehicles);
//         this.isVehicleFullyInvested(1,0)
//       },
//       error: (err) => {
//         console.error('Failed to load vehicles:', err);
//         // Set empty array on error to prevent filter issues
//         this.vehicles.set([]);
//       }
//     });
//   }

//   // ✅ Add new vehicle partnership
//   addVehiclePartnership(existingData?: VehiclePartner): void {
//     const partnership = this.fb.group({
//       vehicle_id: [existingData?.vehicle_id || null, Validators.required],
//       share_percentage: [
//         existingData?.share_percentage || 0,
//         [Validators.required, Validators.min(0), Validators.max(100)]
//       ]
//     });

//     this.vehiclePartnerships.push(partnership);
//   }

//   // ✅ Remove vehicle partnership
//   removeVehiclePartnership(index: number): void {
//     this.vehiclePartnerships.removeAt(index);
//   }

//   // ✅ Check if vehicle is already selected in another partnership
//   isVehicleSelectedInOtherPartnership(vehicleId: number, currentIndex: number): boolean {
//     return this.vehiclePartnerships.controls.some((control, index) =>
//       index !== currentIndex && control.get('vehicle_id')?.value === vehicleId
//     );
//   }

//   // ✅ Check if vehicle has reached 100% investment (from ALL partners, not just current one)
//   // This should check the TOTAL investment in this vehicle across ALL partners in the system
//   isVehicleFullyInvested(vehicleId: number, currentIndex: number): boolean {
//     // Get total shares for this vehicle from CURRENT form only (current partner's partnerships)
//     const currentPartnerTotal = this.vehiclePartnerships.controls
//       .filter((control, index) => index !== currentIndex) // Exclude current partnership
//       .reduce((sum, control) => {
//          console.log("share_percentage",control.get('share_percentage')?.value);
//         if (control.get('vehicle_id')?.value === vehicleId) {
//           return sum + (control.get('share_percentage')?.value || 0);
//         }
//         return sum;
//       }, 0);


//       console.log("currentPartnerTotal",currentPartnerTotal);

//     // If total is >= 100%, vehicle is fully invested
//     return currentPartnerTotal >= 100;
//   }
//   getVehicleName(vehicleId: number): string {
//     const allVehicles = this.vehicles();
//     if (!Array.isArray(allVehicles)) {
//       return '';
//     }
//     return allVehicles.find(v => v.id === vehicleId)?.name || '';
//   }

//   // ✅ Check if vehicle partnership shares exceed 100%
//   getVehicleShareWarning(vehicleId: number): string | null {
//     const total = this.totalVehicleShares().get(vehicleId) || 0;
//     if (total > 100) {
//       return `تحذير: إجمالي المشاركات في هذه المركبة ${total}% (يجب أن يكون ≤ 100%)`;
//     }
//     return null;
//   }

//   // ✅ Validate before saving
//   isFormValid(): boolean {
//     if (!this.form.valid) {
//       return false;
//     }

//     // ✅ Validate that no vehicle has partnerships exceeding 100%
//     for (const [vehicleId, total] of this.totalVehicleShares()) {
//       if (total > 100) {
//         return false;
//       }
//     }

//     return true;
//   }

//   onSave(): void {
//     if (this.isFormValid()) {
//       const formValue = this.form.getRawValue();

//       // ✅ Clean up vehicle_partnerships: remove empty entries
//       const cleanedPartnerships = formValue.vehicle_partnerships.filter(
//         vp => vp.vehicle_id  != null && vp.share_percentage > 0
//       );

//       const result = {
//         ...formValue,
//         vehicle_partnerships: cleanedPartnerships
//       };

//       this.dialogRef.close(result);
//     }
//   }
// }
// import { Component, Inject, OnInit, inject, signal, computed } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormBuilder, FormArray, FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
// import { MatButtonModule } from '@angular/material/button';
// import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatCheckboxModule } from '@angular/material/checkbox';
// import { MatSelectModule } from '@angular/material/select';
// import { MatIconModule } from '@angular/material/icon';
// import { MatChipsModule } from '@angular/material/chips';
// import { Partner, Vehicle, VehiclePartner } from '../../../../core/models';
// import { VehicleService } from '../../../../core/services/vehicle.service';

// interface VehiclePartnershipFormValue {
//   vehicle_id: number | null;
//   share_percentage: number;
// }

// // Define the shape of the entire form
// interface PartnerFormValue {
//   name: string;
//   phone: string;
//   address: string;
//   investment_amount: number;
//   investment_percentage: number;
//   vehicle_partnerships: VehiclePartnershipFormValue[];
// }
// // For better type safety with FormGroups
// interface VehiclePartnershipFormGroup {
//   vehicle_id: FormControl<number | null>;
//   share_percentage: FormControl<number>;
// }

// @Component({
//   selector: 'app-form-dialog',
//   imports: [  CommonModule,
//     ReactiveFormsModule,
//     MatDialogModule,
//     MatFormFieldModule,
//     MatInputModule,
//     MatButtonModule,
//     MatCheckboxModule,
//     MatSelectModule,
//     MatIconModule,
//     MatChipsModule
// ],
//   templateUrl: './form-dialog.html',
//   styleUrl: './form-dialog.css',
// })
// export class FormDialog implements OnInit {
//   private fb = inject(FormBuilder);
//   private dialogRef = inject(MatDialogRef<FormDialog>);
//   private vehicleService = inject(VehicleService);

//   // ✅ Load available vehicles - Initialize with empty array
//   vehicles = signal<Vehicle[]>([]);

//   // ✅ Computed: vehicles already selected in partnerships
//   selectedVehicleIds = computed(() => {
//     const result = this.vehiclePartnerships.controls
//       .map(control => control.get('vehicle_id')?.value)
//       .filter(id => id != null);
//     console.log('🔍 selectedVehicleIds computed:', result);
//     return result;
//   });

//   // ✅ Computed: all available vehicles
//   availableVehicles = computed(() => {
//     const allVehicles = this.vehicles();
//     console.log('🚗 availableVehicles computed - all vehicles:', allVehicles);

//     // Safety check: ensure allVehicles is actually an array
//     if (!Array.isArray(allVehicles)) {
//       console.error('❌ allVehicles is NOT an array:', typeof allVehicles, allVehicles);
//       return [];
//     }

//     console.log('✅ Returning', allVehicles.length, 'vehicles');
//     return allVehicles;
//   });

//   // ✅ Computed: Total vehicle partnership percentages
//   totalVehicleShares = computed(() => {
//     console.log('📊 Computing totalVehicleShares...');
//     const sharesByVehicle = new Map<number, number>();

//     this.vehiclePartnerships.controls.forEach((control, index) => {
//       const vehicleId = control.get('vehicle_id')?.value;
//       const share = control.get('share_percentage')?.value || 0;

//       console.log(`  Partnership ${index}: vehicle_id=${vehicleId}, share=${share}`);

//       if (vehicleId) {
//         const current = sharesByVehicle.get(vehicleId) || 0;
//         sharesByVehicle.set(vehicleId, current + share);
//         console.log(`    Updated vehicle ${vehicleId}: ${current} + ${share} = ${current + share}`);
//       }
//     });

//     console.log('📊 Final totalVehicleShares:', Object.fromEntries(sharesByVehicle));
//     return sharesByVehicle;
//   });

//   constructor(@Inject(MAT_DIALOG_DATA) public data: Partner | null) {}

//   // ✅ REFACTORED FORM - Remove is_vehicle_partner, add vehicle_partnerships
//   form = this.fb.nonNullable.group({
//     name: ['', Validators.required],
//     phone: [''],
//     address: [''],
//     investment_amount: [0, [Validators.required, Validators.min(0)]],
//     investment_percentage: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
//     // ❌ REMOVED: is_vehicle_partner: [false]
//     // ✅ ADDED: vehicle_partnerships FormArray
//     vehicle_partnerships: this.fb.array<FormGroup<VehiclePartnershipFormGroup>>([])
//   });

//   // ✅ Getter for FormArray
//   get vehiclePartnerships(): FormArray {
//     return this.form.get('vehicle_partnerships') as FormArray;
//   }

//   ngOnInit(): void {
//     console.log('🚀 ngOnInit started');
//     console.log('📝 Dialog data:', this.data);

//     this.loadVehicles();

//     // ✅ Populate form with existing data
//     if (this.data) {
//       console.log('✏️ Populating form with existing partner data');
//       this.form.patchValue({
//         name: this.data.name,
//         phone: this.data.phone || '',
//         address: this.data.address || '',
//         investment_amount: this.data.investment_amount,
//         investment_percentage: this.data.investment_percentage
//       });

//       // ✅ Populate vehicle partnerships if they exist
//       if (this.data.vehicle_partnerships && this.data.vehicle_partnerships.length > 0) {
//         console.log('🚗 Adding existing vehicle partnerships:', this.data.vehicle_partnerships);
//         this.data.vehicle_partnerships.forEach((vp, index) => {
//           console.log(`  Partnership ${index}:`, vp);
//           this.addVehiclePartnership(vp);
//         });
//       } else {
//         console.log('ℹ️ No existing vehicle partnerships');
//       }
//     } else {
//       console.log('➕ Creating new partner (no existing data)');
//     }
//   }

//   loadVehicles(): void {
//     console.log('🔄 Loading vehicles from service...');
//     this.vehicleService.getAll().subscribe({
//       next: (vehicles:any) => {
//         console.log('✅ Vehicles loaded successfully:', vehicles);
//         console.log('   Type:', typeof vehicles);
//         console.log('   Is Array:', Array.isArray(vehicles));
//         console.log('   Length:', vehicles?.length);

//         // Ensure vehicles is always an array
//         const vehiclesArray = Array.isArray(vehicles.data) ? vehicles.data : [];
//         console.log('📦 Setting vehicles signal with', vehiclesArray.length, 'items');
//         this.vehicles.set(vehiclesArray);

//         console.log('🔍 Current vehicles signal value:', this.vehicles());
//       },
//       error: (err) => {
//         console.error('❌ Failed to load vehicles:', err);
//         console.error('   Error details:', {
//           message: err.message,
//           status: err.status,
//           statusText: err.statusText
//         });
//         // Set empty array on error to prevent filter issues
//         this.vehicles.set([]);
//       }
//     });
//   }

//   // ✅ Add new vehicle partnership
//   addVehiclePartnership(existingData?: VehiclePartner): void {
//     console.log('➕ Adding vehicle partnership');
//     console.log('   Existing data:', existingData);

//     const partnership = this.fb.group({
//       vehicle_id: [existingData?.vehicle_id || null, Validators.required],
//       share_percentage: [
//         existingData?.share_percentage || 0,
//         [Validators.required, Validators.min(0), Validators.max(100)]
//       ]
//     });

//     console.log('   Created partnership form group:', partnership.value);
//     this.vehiclePartnerships.push(partnership);
//     console.log('   Total partnerships now:', this.vehiclePartnerships.length);
//   }

//   // ✅ Remove vehicle partnership
//   removeVehiclePartnership(index: number): void {
//     console.log(`🗑️ Removing partnership at index ${index}`);
//     console.log('   Partnership value:', this.vehiclePartnerships.at(index)?.value);
//     this.vehiclePartnerships.removeAt(index);
//     console.log('   Total partnerships now:', this.vehiclePartnerships.length);
//   }

//   // ✅ Check if vehicle is already selected in another partnership
//   isVehicleSelectedInOtherPartnership(vehicleId: number, currentIndex: number): boolean {
//     const result = this.vehiclePartnerships.controls.some((control, index) =>
//       index !== currentIndex && control.get('vehicle_id')?.value === vehicleId
//     );
//     console.log(`🔍 isVehicleSelectedInOtherPartnership(${vehicleId}, ${currentIndex}):`, result);
//     return result;
//   }

//   // ✅ Check if vehicle has reached 100% investment (from ALL partners, not just current one)
//   // This should check the TOTAL investment in this vehicle across ALL partners in the system
//   isVehicleFullyInvested(vehicleId: number, currentIndex: number): boolean {
//     console.log(`💯 Checking if vehicle ${vehicleId} is fully invested (excluding index ${currentIndex})`);

//     // Get total shares for this vehicle from CURRENT form only (current partner's partnerships)
//     const currentPartnerTotal = this.vehiclePartnerships.controls
//       .filter((control, index) => index !== currentIndex) // Exclude current partnership
//       .reduce((sum, control) => {
//         const controlVehicleId = control.get('vehicle_id')?.value;
//         const share = control.get('share_percentage')?.value || 0;

//         if (controlVehicleId === vehicleId) {
//           console.log(`   Partnership with vehicle ${vehicleId}: adding ${share}% to total`);
//           return sum + share;
//         }
//         return sum;
//       }, 0);

//     console.log(`   Total investment in vehicle ${vehicleId}: ${currentPartnerTotal}%`);
//     const isFull = currentPartnerTotal >= 100;
//     console.log(`   Is fully invested (>= 100%): ${isFull}`);

//     // If total is >= 100%, vehicle is fully invested
//     return isFull;
//   }
//   getVehicleName(vehicleId: number): string {
//     const allVehicles = this.vehicles();
//     if (!Array.isArray(allVehicles)) {
//       return '';
//     }
//     return allVehicles.find(v => v.id === vehicleId)?.name || '';
//   }

//   // ✅ Check if vehicle partnership shares exceed 100%
//   getVehicleShareWarning(vehicleId: number): string | null {
//     const total = this.totalVehicleShares().get(vehicleId) || 0;
//     console.log(`⚠️ Checking warning for vehicle ${vehicleId}: ${total}%`);

//     if (total > 100) {
//       const warning = `تحذير: إجمالي المشاركات في هذه المركبة ${total}% (يجب أن يكون ≤ 100%)`;
//       console.log(`   WARNING: ${warning}`);
//       return warning;
//     }

//     console.log('   No warning needed');
//     return null;
//   }

//   // ✅ Validate before saving
//   isFormValid(): boolean {
//     console.log('✔️ Validating form...');
//     console.log('   Form valid:', this.form.valid);
//     console.log('   Form value:', this.form.value);
//     console.log('   Form errors:', this.form.errors);

//     if (!this.form.valid) {
//       console.log('   ❌ Form is invalid');

//       // Log which fields are invalid
//       Object.keys(this.form.controls).forEach(key => {
//         const control = this.form.get(key);
//         if (control && control.invalid) {
//           console.log(`   Invalid field: ${key}`, control.errors);
//         }
//       });

//       return false;
//     }

//     // ✅ Validate that no vehicle has partnerships exceeding 100%
//     console.log('   Checking vehicle share totals...');
//     for (const [vehicleId, total] of this.totalVehicleShares()) {
//       console.log(`   Vehicle ${vehicleId}: ${total}%`);
//       if (total > 100) {
//         console.log(`   ❌ Vehicle ${vehicleId} exceeds 100%!`);
//         return false;
//       }
//     }

//     console.log('   ✅ Form is valid');
//     return true;
//   }

//   onSave(): void {
//     console.log('💾 Save button clicked');
//     console.log('   Is form valid:', this.isFormValid());

//     if (this.isFormValid()) {
//       const formValue = this.form.getRawValue();
//       console.log('   Raw form value:', formValue);

//       // ✅ Clean up vehicle_partnerships: remove empty entries
//       const cleanedPartnerships = formValue.vehicle_partnerships.filter(
//         vp => vp.vehicle_id  != null && vp.share_percentage > 0
//       );

//       console.log('   Cleaned partnerships:', cleanedPartnerships);

//       const result = {
//         ...formValue,
//         vehicle_partnerships: cleanedPartnerships
//       };

//       console.log('   Final result to save:', result);
//       this.dialogRef.close(result);
//       console.log('   ✅ Dialog closed with result');
//     } else {
//       console.log('   ❌ Form validation failed, not saving');
//     }
//   }
// }
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
import { Partner, Vehicle, VehiclePartner } from '../../../../core/models';
import { VehicleService } from '../../../../core/services/vehicle.service';

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
    MatTooltipModule
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
    vehicle_shares: this.fb.array<FormGroup<VehicleShareFormGroup>>([])
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
          // Backend returns vehicles with VehiclePartner join data
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
  }

  loadVehicles(): void {
    this.vehicleService.getAll().subscribe({
      next: (response: any) => {
        const vehicles = Array.isArray(response.data) ? response.data : [];
        this.vehicles.set(vehicles);

        // Load existing shares for each vehicle from all partners
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
          // Exclude current partner when editing
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
    // Get existing shares from other partners
    const existingShares = this.existingVehicleShares().get(vehicleId) || 0;

    // Get shares from current partner (excluding current form entry)
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
  const numericTotal = Number(total); // أو parseFloat(total)

  return `تحذير: إجمالي المشاركات في هذه المركبة ${numericTotal.toFixed(2)}% (يجب أن يكون ≤ 100%)`;
}


    if (total === 100) {
      const numericTotal = Number(total);
      return `تم اكتمال استثمار هذه المركبة (${numericTotal}%)`;
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
        const currentShare = control.get('share_percentage')?.value || 0;

        // Get total from all entries for this vehicle in current form
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

      const result = {
        name: formValue.name,
        phone: formValue.phone,
        address: formValue.address,
        investment_amount: formValue.investment_amount,
        investment_percentage: formValue.investment_percentage,
        vehicle_shares: cleanedShares
      };

      this.dialogRef.close(result);
    }
  }
}
