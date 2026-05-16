import { Component, OnInit, computed, inject, signal } from '@angular/core';

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
import { AdvanceService } from '../../../core/services/advance.service';
import { AuthService } from '../../../core/services/auth.service';
import { PERMISSIONS } from '../../../core/constants/Permissions.constant';
import { EmployeeAdvance } from '../../../core/models';
import { ReportUtilitiesService } from '../../../core/services/ReportUtilitiesService';
import { firstValueFrom } from 'rxjs';
import { AdvanceDialogComponent } from './advance-dialog.component';

@Component({
  selector: 'app-advances',
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
    MatProgressSpinnerModule
],
  templateUrl: './advances.component.html',
  styleUrl: './advances.component.css'
})
export class AdvancesComponent implements OnInit {
  private advanceService = inject(AdvanceService);
  private authService = inject(AuthService);
  private utils = inject(ReportUtilitiesService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  PERMISSIONS = PERMISSIONS;

  advances = signal<EmployeeAdvance[]>([]);
  pendingAdvances = signal<EmployeeAdvance[]>([]);
  isLoading = signal(false);
  hasLoadedAll = signal(false);
  currentTab = signal(0);

  pendingPage = signal(1);
  pendingPageSize = signal(10);
  pendingTotalItems = signal(0);
  historyPage = signal(1);
  historyPageSize = signal(10);
  historyTotalItems = signal(0);

  pendingTotal = computed(() => {
    return this.pendingAdvances().reduce((sum, adv) => sum + (adv.amount - adv.returned_amount), 0);
  });

  pendingTotalPages = computed(() => {
    return Math.max(1, Math.ceil(this.pendingTotalItems() / this.pendingPageSize()));
  });

  historyTotalPages = computed(() => {
    return Math.max(1, Math.ceil(this.historyTotalItems() / this.historyPageSize()));
  });

  pendingPageItems = computed(() => {
    const data = this.pendingAdvances();
    if (this.pendingTotalItems() > data.length) {
      return data;
    }
    const start = (this.pendingPage() - 1) * this.pendingPageSize();
    return data.slice(start, start + this.pendingPageSize());
  });

  historyPageItems = computed(() => {
    const data = this.advances();
    if (this.historyTotalItems() > data.length) {
      return data;
    }
    const start = (this.historyPage() - 1) * this.historyPageSize();
    return data.slice(start, start + this.historyPageSize());
  });

  displayedColumns: string[] = ['employee', 'amount', 'date', 'returned', 'remaining', 'status', 'actions'];

  ngOnInit(): void {
    this.loadPending();
  }

  private extractAdvances(response: any): EmployeeAdvance[] {
    const payload = response?.data ?? response;
    if (Array.isArray(payload)) {
      return payload;
    }
    if (Array.isArray(payload.items)) {
      return payload.items;
    }
    return [];
  }

  private setPagination(response: any, target: 'pending' | 'history'): void {
    const pagination = response?.data?.pagination;
    if (pagination) {
      if (target === 'pending') {
        this.pendingTotalItems.set(pagination.total ?? 0);
        this.pendingPage.set(pagination.page ?? this.pendingPage());
        this.pendingPageSize.set(pagination.limit ?? this.pendingPageSize());
      } else {
        this.historyTotalItems.set(pagination.total ?? 0);
        this.historyPage.set(pagination.page ?? this.historyPage());
        this.historyPageSize.set(pagination.limit ?? this.historyPageSize());
      }
      return;
    }

    const payload = response?.data ?? response;
    const items = Array.isArray(payload.items) ? payload.items : Array.isArray(payload) ? payload : [];
    if (target === 'pending') {
      this.pendingTotalItems.set(items.length);
    } else {
      this.historyTotalItems.set(items.length);
    }
  }

  async loadPending() {
    this.pendingPage.set(1);
    this.isLoading.set(true);
    try {
      const params = {
        page: this.pendingPage(),
        limit: this.pendingPageSize()
      };
      const res = await firstValueFrom(this.advanceService.getPending(params));
      this.pendingAdvances.set(this.extractAdvances(res));
      this.setPagination(res, 'pending');
    } catch (e) {
      this.snackBar.open('فشل تحميل السلف النشطة', 'حسناً', { duration: 3000 });
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadAll() {
    this.historyPage.set(1);
    this.isLoading.set(true);
    try {
      const params = {
        page: this.historyPage(),
        limit: this.historyPageSize()
      };
      const res = await firstValueFrom(this.advanceService.getAll(params));
      this.advances.set(this.extractAdvances(res));
      this.setPagination(res, 'history');
      this.hasLoadedAll.set(true);
    } catch (e) {
      this.snackBar.open('فشل تحميل سجل السلف', 'حسناً', { duration: 3000 });
    } finally {
      this.isLoading.set(false);
    }
  }

  onTabChange(event: any) {
    this.currentTab.set(event.index);
    if (event.index === 1) {
      this.loadAll();
    } else {
      this.loadPending();
    }
  }

  previousPendingPage(): void {
    if (this.pendingPage() > 1) {
      this.pendingPage.update(page => page - 1);
    }
  }

  nextPendingPage(): void {
    if (this.pendingPage() < this.pendingTotalPages()) {
      this.pendingPage.update(page => page + 1);
    }
  }

  previousHistoryPage(): void {
    if (this.historyPage() > 1) {
      this.historyPage.update(page => page - 1);
    }
  }

  nextHistoryPage(): void {
    if (this.historyPage() < this.historyTotalPages()) {
      this.historyPage.update(page => page + 1);
    }
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(AdvanceDialogComponent, {
      width: '550px',
      data: { mode: 'CREATE' },
      direction: 'rtl'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refreshData();
      }
    });
  }

  openReturnDialog(advance: EmployeeAdvance) {
    const dialogRef = this.dialog.open(AdvanceDialogComponent, {
      width: '500px',
      data: { mode: 'RETURN', advance },
      direction: 'rtl'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refreshData();
      }
    });
  }

  openDetailsDialog(advance: EmployeeAdvance) {
    this.dialog.open(AdvanceDialogComponent, {
      width: '600px',
      data: { mode: 'VIEW', advance },
      direction: 'rtl'
    });
  }

  refreshData() {
    this.loadPending();
    if (this.hasLoadedAll()) {
      this.hasLoadedAll.set(false);
      this.loadAll();
    }
  }

  // Permissions
  canManage() {
    return this.authService.hasPermission(PERMISSIONS.ADVANCES.MANAGE_ADVANCES);
  }

  // Formatting helpers
  formatCurrency = (amt: number | undefined | null) => this.utils.formatCurrency(amt);
  formatDate = (date: any) => date ? this.utils.formatDate(date) : '-';
}
