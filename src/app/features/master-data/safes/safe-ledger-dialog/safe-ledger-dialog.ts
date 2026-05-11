import { Component, Inject, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { SafeService } from '../../../../core/services/safe.service';
import { SafeDashboard, SafeLedgerResponse, ApiResponse } from '../../../../core/models';
import { ReportUtilitiesService } from '../../../../core/services/ReportUtilitiesService';
import { TransactionTypeArabicPipe } from '../../../../shared/pipes/transaction-type-arabic.pipe';

@Component({
  selector: 'app-safe-ledger-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatIconModule,
    TransactionTypeArabicPipe
  ],
  templateUrl: './safe-ledger-dialog.html',
  styleUrl: './safe-ledger-dialog.css'
})
export class SafeLedgerDialog implements OnInit {
  private safeService = inject(SafeService);
  private utils = inject(ReportUtilitiesService);
  private fb = inject(FormBuilder);
Math=Math
  ledger = signal<SafeLedgerResponse | null>(null);
  isLoading = signal(false);

  dateForm = this.fb.group({
    from: [new Date(new Date().getFullYear(), new Date().getMonth(), 1), Validators.required],
    to: [new Date(), Validators.required]
  });

  displayedColumns = ['date', 'type', 'direction', 'amount', 'balance'];

  constructor(@Inject(MAT_DIALOG_DATA) public safe: SafeDashboard) {}

  ngOnInit(): void {
    this.loadLedger();

    this.dateForm.valueChanges.subscribe(() => {
      if (this.dateForm.valid) {
        this.loadLedger();
      }
    });
  }

  loadLedger(): void {
    const from = this.utils.toISODate(this.dateForm.value.from!);
    const to = this.utils.toISODate(this.dateForm.value.to!);

    this.isLoading.set(true);
    this.safeService.getLedger(this.safe.id, from, to).subscribe({
      next: (res: ApiResponse<SafeLedgerResponse>) => {
        this.ledger.set(res.data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  formatCurrency(amount: number | undefined): string {
    return this.utils.formatCurrency(amount || 0);
  }

  formatDate(date: string): string {
    return this.utils.formatDate(date);
  }
}
