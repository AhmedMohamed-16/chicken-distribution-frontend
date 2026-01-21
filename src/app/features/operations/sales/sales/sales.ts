import { Component, OnInit, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { OperationService } from '../../../../core/services/operation.service';
import { BuyerService } from '../../../../core/services/buyer.service';
import { ChickenTypeService } from '../../../../core/services/chicken-type.service';
import { Buyer, ChickenType } from '../../../../core/models';
import { toSignal } from '@angular/core/rxjs-interop';


@Component({
  selector: 'app-sales',
  imports: [ CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDividerModule],
  templateUrl: './sales.html',
  styleUrl: './sales.css',
})
export class Sales implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private operationService = inject(OperationService);
  private buyerService:BuyerService = inject(BuyerService);
  private chickenTypeService = inject(ChickenTypeService);
  private snackBar = inject(MatSnackBar);

  loading = signal(false);
  submitting = signal(false);
  buyers = signal<Buyer[]>([]);
  chickenTypes = signal<ChickenType[]>([]);
  operationId = signal<number>(0);
  selectedBuyerDebt = signal<number>(0);

  saleForm = this.fb.nonNullable.group({
    buyer_id: [null as number | null, Validators.required],
    chicken_type_id: [null as number | null, Validators.required],
    loaded_cages_weight: [0, [Validators.required, Validators.min(0)]],
    empty_cages_weight: [0, [Validators.required, Validators.min(0)]],
    cage_count: [0, [Validators.required, Validators.min(0)]],
    price_per_kg: [0, [Validators.required, Validators.min(0)]],
    paid_amount: [0, [Validators.required, Validators.min(0)]],
    old_debt_paid: [0, [Validators.min(0)]]
  });
formValue = toSignal(
  this.saleForm.valueChanges,
  { initialValue: this.saleForm.getRawValue() }
);
  // Computed signals
  netSaleWeight = computed(() => {
    const form = this.formValue();
    const loaded = form.loaded_cages_weight || 0;
    const empty = form.empty_cages_weight || 0;
    return Math.max(0, loaded - empty);
  });

  totalSaleAmount = computed(() => {
    const price = this.formValue().price_per_kg || 0;
    return this.netSaleWeight() * price;
  });

  remainingSaleAmount = computed(() => {
    const paid = this.formValue().paid_amount || 0;
    return Math.max(0, this.totalSaleAmount() - paid);
  });

  newTotalDebt = computed(() => {
    const oldDebt = this.selectedBuyerDebt();
    const oldDebtPaid = this.formValue().old_debt_paid || 0;
    const newDebt = this.remainingSaleAmount();
    return Math.max(0, oldDebt - oldDebtPaid + newDebt);
  });

  ngOnInit(): void {
    this.operationId.set(+this.route.snapshot.params['id']);
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    Promise.all([
      this.buyerService.getAll().toPromise(),
      this.chickenTypeService.getAll().toPromise()
    ]).then(([buyers, types]:any[]) => {
      this.buyers.set(buyers.data || []);
      this.chickenTypes.set(types.data || []);
      this.loading.set(false);
    }).catch(() => {
      this.snackBar.open('فشل تحميل البيانات', 'حسناً', { duration: 3000 });
      this.loading.set(false);
    });
  }

  onBuyerChange(): void {
    const buyerId = this.saleForm.get('buyer_id')?.value;
    if (buyerId) {
      const buyer = this.buyers().find(b => b.id === buyerId);
      this.selectedBuyerDebt.set(buyer?.total_debt || 0);
    } else {
      this.selectedBuyerDebt.set(0);
    }
  }

  onSubmit(): void {
    if (this.saleForm.invalid) return;

    this.submitting.set(true);
    const payload = this.saleForm.getRawValue();

    this.operationService.recordSale(this.operationId(), payload as any).subscribe({
      next: (result) => {
        this.snackBar.open('تم تسجيل البيع بنجاح', 'حسناً', { duration: 3000 });
        this.router.navigate(['/operations/daily', this.operationId()]);
      },
      error: (error) => {
        this.submitting.set(false);
        this.snackBar.open(
          error.error?.message || 'فشل تسجيل البيع',
          'حسناً',
          { duration: 3000 }
        );
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/operations/daily', this.operationId()]);
  }
}
