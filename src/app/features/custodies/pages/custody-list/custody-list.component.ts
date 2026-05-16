import { Component, computed, inject, signal, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { CustodyStatus, PersonType } from '../../../../models/custody.models';
import { CustodyService } from '../../../../core/services/custody.service';
import { ReportUtilitiesService } from '../../../../core/services/ReportUtilitiesService';
import { CustodyStatusBadgeComponent } from '../../components/custody-status-badge/custody-status-badge.component';
import { CreateCustodyDialogComponent } from '../../components/create-custody-dialog/create-custody-dialog.component';
import { RecordReturnDialogComponent } from '../../components/record-return-dialog/record-return-dialog.component';
import { RecordSpendingDialogComponent } from '../../components/record-spending-dialog/record-spending-dialog.component';
import { SettleCustodyDialogComponent } from '../../components/settle-custody-dialog/settle-custody-dialog.component';

type StatusFilter = 'ALL' | CustodyStatus;
type PersonFilter = 'ALL' | PersonType;

interface FiltersState {
  status: StatusFilter;
  personType: PersonFilter;
  search: string;
}

@Component({
  selector: 'app-custody-list',
  standalone: true,
  imports: [
    MatTabsModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    ReactiveFormsModule,
    CustodyStatusBadgeComponent
],
  templateUrl: './custody-list.component.html',
  styleUrl: './custody-list.component.css'
})
export class CustodyListComponent implements OnDestroy {
  custodyService = inject(CustodyService);
  private utils = inject(ReportUtilitiesService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  private destroy$ = new Subject<void>();

  // ── Core signals ────────────────────────────────────────────────────────────
  custodies = this.custodyService.custodies;
  summary   = this.custodyService.summary;
  isLoading = this.custodyService.loading;
  currentTab = signal(0);

  /**
   * FIX: Bridge the reactive form into a signal so computed() can track it.
   * Without this, computed() reads getRawValue() once at definition time and
   * never re-runs when the form changes — the filters appear broken.
   */
  private filtersSignal = signal<FiltersState>({
    status:     'ALL',
    personType: 'ALL',
    search:     ''
  });

  // Pagination signals
  activePage      = signal(1);
  activePageSize  = signal(10);
  historyPage     = signal(1);
  historyPageSize = signal(10);

  // ── Form ─────────────────────────────────────────────────────────────────────
  filtersForm = this.fb.nonNullable.group({
    status:     'ALL' as StatusFilter,
    personType: 'ALL' as PersonFilter,
    search:     ''
  });

  constructor() {
    this.refresh();

    /**
     * FIX: On every form value change, push the new value into the signal.
     * The computed() signals below will then automatically re-evaluate
     * because they depend on filtersSignal().
     *
     * We deliberately removed the API call from here — filtering is done
     * locally on the already-loaded custodies, which is consistent and fast.
     * The API call (loadAll) only happens on initial load and after mutations.
     */
    this.filtersForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        this.filtersSignal.set({
          status:     (value.status     ?? 'ALL') as StatusFilter,
          personType: (value.personType ?? 'ALL') as PersonFilter,
          search:     (value.search     ?? '').trim().toLowerCase()
        });

        // Reset pagination when filters change
        this.activePage.set(1);
        this.historyPage.set(1);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Filtered data ─────────────────────────────────────────────────────────

  /**
   * FIX: Use filtersSignal() instead of filtersForm.getRawValue().
   * This means computed() properly tracks the dependency and re-evaluates
   * whenever the user types in the search box or changes a dropdown.
   */
  filteredActiveCustodies = computed(() => {
    const { status, personType, search } = this.filtersSignal();

    // Active statuses: OPEN and PARTIAL
    // If a specific active status is selected, filter to that; otherwise show both
    const activeStatuses: CustodyStatus[] = ['OPEN', 'PARTIAL'];
    const allowedStatuses: CustodyStatus[] =
      status === 'ALL'
        ? activeStatuses
        : activeStatuses.includes(status as CustodyStatus)
          ? [status as CustodyStatus]
          : []; // Selected status is a closed one — show nothing in active tab

    return this.custodies().filter(c =>
      allowedStatuses.includes(c.status) &&
      (personType === 'ALL' || c.given_to_person_type === personType) &&
      (!search ||
        (c.recipient_name ?? '').toLowerCase().includes(search) ||
        (c.description    ?? '').toLowerCase().includes(search))
    );
  });

  filteredHistoryCustodies = computed(() => {
    const { status, personType, search } = this.filtersSignal();

    // History statuses: CLOSED and RECONCILED
    const historyStatuses: CustodyStatus[] = ['CLOSED', 'RECONCILED'];
    const allowedStatuses: CustodyStatus[] =
      status === 'ALL'
        ? historyStatuses
        : historyStatuses.includes(status as CustodyStatus)
          ? [status as CustodyStatus]
          : []; // Selected status is an active one — show nothing in history tab
    console.log("c.recipient_name",this.custodies().at(0)?.recipient_name);

    return this.custodies().filter(c =>
      allowedStatuses.includes(c.status) &&
      (personType === 'ALL' || c.given_to_person_type === personType) &&
      (!search ||
        (c.recipient_name ?? '').toLowerCase().includes(search) ||
        (c.description    ?? '').toLowerCase().includes(search) ||
        (c.payment_method    ?? '').toLowerCase().includes(search) ||
        (c.given_to_person_type    ?? '').toLowerCase().includes(search))
    );
  });

  // ── Derived computed signals ──────────────────────────────────────────────

  activeCustodies  = computed(() => this.custodies().filter(c => c.status === 'OPEN' || c.status === 'PARTIAL'));
  historyCustodies = computed(() => this.custodies().filter(c => c.status === 'CLOSED' || c.status === 'RECONCILED'));

  totalUnaccounted = computed(() => this.summary()?.totals.total_unaccounted ?? 0);
  totalIssued      = computed(() => this.summary()?.totals.total_issued      ?? 0);

  overdueOpenCount = computed(() => {
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    return this.activeCustodies().filter(
      c => now - new Date(c.custody_date).getTime() > sevenDaysMs
    ).length;
  });

  // ── Pagination computed ───────────────────────────────────────────────────

  activeTotalItems  = computed(() => this.filteredActiveCustodies().length);
  historyTotalItems = computed(() => this.filteredHistoryCustodies().length);

  activeTotalPages  = computed(() => Math.max(1, Math.ceil(this.activeTotalItems()  / this.activePageSize())));
  historyTotalPages = computed(() => Math.max(1, Math.ceil(this.historyTotalItems() / this.historyPageSize())));

  activePageItems = computed(() => {
    const data  = this.filteredActiveCustodies();
    const start = (this.activePage() - 1) * this.activePageSize();
    return data.slice(start, start + this.activePageSize());
  });

  historyPageItems = computed(() => {
    const data  = this.filteredHistoryCustodies();
    const start = (this.historyPage() - 1) * this.historyPageSize();
    return data.slice(start, start + this.historyPageSize());
  });

  displayedColumns: string[] = [
    'recipient', 'date', 'amount', 'spent', 'returned', 'unaccounted', 'status', 'actions'
  ];

  // ── Actions ───────────────────────────────────────────────────────────────

  refresh(): void {
    this.custodyService.loadAll().subscribe();
    this.custodyService.loadSummary().subscribe();
  }

  onTabChange(event: any): void {
    this.currentTab.set(event.index);
    // Reset the page for whichever tab was just selected
    if (event.index === 0) {
      this.activePage.set(1);
    } else {
      this.historyPage.set(1);
    }
  }

  goToStatement(id: number): void {
    this.router.navigate(['/custodies', id]);
  }

  isActionAllowed(status: CustodyStatus): boolean {
    return status !== 'CLOSED' && status !== 'RECONCILED';
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(CreateCustodyDialogComponent, {
      width: '550px',
      direction: 'rtl',
      disableClose: false
    });
    dialogRef.afterClosed().subscribe(result => { if (result) this.refresh(); });
  }

  openReturnDialog(id: number, unaccounted: number): void {
    const dialogRef = this.dialog.open(RecordReturnDialogComponent, {
      width: '500px',
      direction: 'rtl',
      data: { custodyId: id, unaccountedAmount: unaccounted }
    });
    dialogRef.afterClosed().subscribe(result => { if (result) this.refresh(); });
  }

  openSpendingDialog(id: number, unaccounted: number): void {
    const dialogRef = this.dialog.open(RecordSpendingDialogComponent, {
      width: '500px',
      direction: 'rtl',
      data: { custodyId: id, unaccountedAmount: unaccounted }
    });
    dialogRef.afterClosed().subscribe(result => { if (result) this.refresh(); });
  }

  openSettleDialog(custody: any): void {
    if (custody.unaccounted_amount > 0) {
      this.snackBar.open('يجب إرجاع أو صرف المبلغ غير المحاسب أولاً', 'OK', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(SettleCustodyDialogComponent, {
      width: '600px',
      direction: 'rtl',
      data: {
        custodyId:        custody.id,
        totalAmount:      custody.amount,
        spentAmount:      custody.spent_amount,
        returnedAmount:   custody.returned_amount,
        unaccountedAmount: custody.unaccounted_amount
      }
    });
    dialogRef.afterClosed().subscribe(result => { if (result) this.refresh(); });
  }

  // ── Pagination methods ────────────────────────────────────────────────────

  previousActivePage(): void {
    if (this.activePage() > 1) this.activePage.update(p => p - 1);
  }

  nextActivePage(): void {
    if (this.activePage() < this.activeTotalPages()) this.activePage.update(p => p + 1);
  }

  previousHistoryPage(): void {
    if (this.historyPage() > 1) this.historyPage.update(p => p - 1);
  }

  nextHistoryPage(): void {
    if (this.historyPage() < this.historyTotalPages()) this.historyPage.update(p => p + 1);
  }

  // ── Formatting helpers ────────────────────────────────────────────────────

  formatCurrency = (amt: number | undefined | null) => this.utils.formatCurrency(amt);
  formatDate     = (date: any) => date ? this.utils.formatDate(date) : '-';

  getPersonTypeLabel(type: PersonType): string {
    return type === 'EMPLOYEE' ? 'موظف' : 'شريك';
  }

  getPersonTypeClass(type: PersonType): string {
    return type === 'EMPLOYEE' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700';
  }
}
