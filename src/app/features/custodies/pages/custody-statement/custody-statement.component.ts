import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
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
import { CustodyService } from '../../../../core/services/custody.service';
import { ReportUtilitiesService } from '../../../../core/services/ReportUtilitiesService';
import { CustodyStatusBadgeComponent } from '../../components/custody-status-badge/custody-status-badge.component';
import { CustodyProgressBarComponent } from '../../components/custody-progress-bar/custody-progress-bar.component';
import { RecordSpendingDialogComponent } from '../../components/record-spending-dialog/record-spending-dialog.component';
import { RecordReturnDialogComponent } from '../../components/record-return-dialog/record-return-dialog.component';
import { SettleCustodyDialogComponent } from '../../components/settle-custody-dialog/settle-custody-dialog.component';
import type { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-custody-statement',
  standalone: true,
  imports: [
    CommonModule,
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
    CustodyStatusBadgeComponent,
    CustodyProgressBarComponent,

  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
 <div class="statement-container">
  @if (custodyService.loading()) {
    <div class="loading-card mat-elevation-z3">
      <div class="loading-shade">
        <mat-spinner diameter="40"></mat-spinner>
      </div>
    </div>
  }

  @if (statement()) {
    <!-- Header Card -->
    <mat-card class="header-card mat-elevation-z3">
      <mat-card-content>
        <div class="header-content">
          <div class="header-info">
            <span class="person-type-badge" [class]="statement()!.custody.recipient_type === 'EMPLOYEE' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'">
              {{ statement()!.custody.recipient_type === 'EMPLOYEE' ? 'موظف' : 'شريك' }}
            </span>
            <h2 class="recipient-name">{{ statement()!.custody.recipient_name }}</h2>
            <p class="subtitle">من خزينة: {{ statement()!.custody.safe_name }}</p>
          </div>
          <div class="header-actions">
            <app-custody-status-badge [status]="statement()!.custody.status" />
            <p class="date-info">تاريخ الإصدار: {{ statement()!.custody.date | date:'dd/MM/yyyy':'':'ar' }}</p>
          </div>
        </div>
        <div class="total-amount">
          <span class="label">إجمالي العهدة</span>
          <span class="value">{{ formatCurrency(statement()!.custody.amount) }}</span>
        </div>
      </mat-card-content>
    </mat-card>

    <!-- Progress Bar & Summary -->
    <div class="summary-row">
      <mat-card class="progress-card mat-elevation-z3">
        <mat-card-content>
          <app-custody-progress-bar
            [total]="statement()!.summary.total_issued"
            [spent]="statement()!.summary.total_spent"
            [returned]="statement()!.summary.total_returned" />
        </mat-card-content>
      </mat-card>

      <mat-card class="stats-card mat-elevation-z3">
        <mat-card-content>
          <div class="stat-item spent">
            <mat-icon>payments</mat-icon>
            <div class="stat-details">
              <span class="stat-label">المصروف</span>
              <span class="stat-value">{{ formatCurrency(statement()!.summary.total_spent) }}</span>
            </div>
          </div>
          <div class="stat-item returned">
            <mat-icon>reply</mat-icon>
            <div class="stat-details">
              <span class="stat-label">المُرجَع</span>
              <span class="stat-value">{{ formatCurrency(statement()!.summary.total_returned) }}</span>
            </div>
          </div>
          <div class="stat-item unaccounted" [class.positive]="statement()!.summary.unaccounted <= 0">
            <mat-icon>warning</mat-icon>
            <div class="stat-details">
              <span class="stat-label">غير محاسَب</span>
              <span class="stat-value">{{ formatCurrency(statement()!.summary.unaccounted) }}</span>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>

    <!-- Action Buttons -->
    @if (isOpenOrPartial()) {
      <div class="action-bar">
        <button mat-raised-button color="accent" (click)="showSpending.set(true)">
          <mat-icon>payments</mat-icon>
          تسجيل مصروف
        </button>
        <button mat-raised-button color="primary" (click)="showReturn.set(true)">
          <mat-icon>reply</mat-icon>
          إرجاع مبلغ
        </button>
        <button mat-raised-button color="warn" (click)="showSettle.set(true)" [disabled]="hasUnaccounted()">
          <mat-icon>check_circle</mat-icon>
          تسوية وإغلاق
        </button>
        <button mat-button (click)="back()">
          <mat-icon>arrow_back</mat-icon>
          رجوع
        </button>
      </div>
    } @else {
      <div class="action-bar">
        <button mat-button (click)="back()">
          <mat-icon>arrow_back</mat-icon>
          رجوع
        </button>
      </div>
    }

    <!-- Timeline -->
    <mat-card class="timeline-card mat-elevation-z3">
      <mat-card-header>
        <mat-card-title>التسلسل الزمني</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div class="timeline">
          @for (event of timelineEvents(); track $index) {
            <div class="timeline-item">
              <div class="timeline-icon" [class]="event.circleClass">
                {{ event.icon }}
              </div>
              <div class="timeline-content">
                <h4>{{ event.title }}</h4>
                <p>{{ event.details }}</p>
                @if (event.sub) {
                  <p class="sub-info">{{ event.sub }}</p>
                }
                <span class="timeline-date">{{ event.date | date:'dd/MM/yyyy':'':'ar' }}</span>
              </div>
            </div>
          }
        </div>
      </mat-card-content>
    </mat-card>

    <!-- Summary Table -->
    <mat-card class="summary-table-card mat-elevation-z3">
      <mat-card-header>
        <mat-card-title>ملخص العهدة</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div class="table-responsive-wrapper">
          <table class="summary-table">
            <tr>
              <td>إجمالي العهدة</td>
              <td class="value">{{ formatCurrency(statement()!.summary.total_issued) }}</td>
            </tr>
            <tr>
              <td>إجمالي المصروف</td>
              <td class="value spent">{{ formatCurrency(statement()!.summary.total_spent) }}</td>
            </tr>
            <tr>
              <td>إجمالي المُرجَع</td>
              <td class="value returned">{{ formatCurrency(statement()!.summary.total_returned) }}</td>
            </tr>
            <tr class="total-row">
              <td>غير محاسَب</td>
              <td class="value" [class.negative]="statement()!.summary.unaccounted > 0" [class.positive]="statement()!.summary.unaccounted <= 0">
                {{ formatCurrency(statement()!.summary.unaccounted) }}
              </td>
            </tr>
          </table>
        </div>
      </mat-card-content>
    </mat-card>
  }
</div>

  `,
  styleUrl: './custody-statement.component.css'
})
export class CustodyStatementComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  custodyService = inject(CustodyService);
  private utils = inject(ReportUtilitiesService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  id = signal(Number(this.route.snapshot.paramMap.get('id')));
  showSpending = signal(false);
  showReturn = signal(false);
showSettle = signal(false);

  statement = computed(() => this.custodyService.selectedStatement());

  hasUnaccounted = computed(() => !!this.statement()?.summary.unaccounted && this.statement()!.summary.unaccounted > 0);

  isOpenOrPartial = computed(() => ['OPEN', 'PARTIAL'].includes(this.statement()?.custody.status || ''));

  constructor() {
    effect(() => {
      if (this.showSpending()) {
        const st = this.statement();
        if (st) {
          const dialogRef: MatDialogRef<RecordSpendingDialogComponent> = this.dialog.open(RecordSpendingDialogComponent, {
            data: { custodyId: this.id(), unaccountedAmount: st.summary.unaccounted } as any,
            width: '500px',
            direction: 'rtl'
          });
          dialogRef.afterClosed().subscribe((result: boolean | undefined) => {
            this.closeAndReload(!!result, 'spending');
          });
        }
      }
    });

    effect(() => {
      if (this.showReturn()) {
        const st = this.statement();
        if (st) {
          const dialogRef: MatDialogRef<RecordReturnDialogComponent> = this.dialog.open(RecordReturnDialogComponent, {
            data: { custodyId: this.id(), unaccountedAmount: st.summary.unaccounted } as any,
            width: '500px',
            direction: 'rtl'
          });
          dialogRef.afterClosed().subscribe((result: boolean | undefined) => {
            this.closeAndReload(!!result, 'return');
          });
        }
      }
    });

    effect(() => {
      if (this.showSettle()) {
        const st = this.statement();
        if (st) {
          if (this.hasUnaccounted()) {
            const unacc = st.summary.unaccounted;
            this.snackBar.open(
              `يوجد مبلغ غير محاسب (${this.utils.formatCurrency(unacc)} جنيه). يجب إرجاعه أو تسجيله كمصروف أولاً`,
              'حسناً',
              { duration: 6000, direction: 'rtl' }
            );
            this.showSettle.set(false);
            return;
          }

          // Simple confirm dialog using native confirm for clean settlement
          if (confirm('هل أنت متأكد من تسوية العهدة؟')) {
            this.custodyService.settle(this.id(), {}).subscribe({
              next: () => {
                this.snackBar.open('تم تسوية العهدة بنجاح', 'حسناً', { duration: 3000 });
                this.closeAndReload(true, 'settle');
              },
              error: (err) => {
                console.error('Settle failed:', err);
                this.snackBar.open('فشل في تسوية العهدة', 'خطأ', { duration: 3000 });
              }
            });
          }
          this.showSettle.set(false);
        }
      }
    });

    this.custodyService.loadStatement(this.id()).subscribe();
  }

  timelineEvents = computed(() => {
    const st = this.statement();
    if (!st) return [];
    const events: Array<{ icon: string; title: string; details: string; sub?: string; date: string; circleClass: string }> = [
      {
        icon: '💰',
        title: 'تم صرف العهدة',
        details: `${this.formatCurrency(st.summary.total_issued)} من خزينة ${st.custody.safe_name}`,
        date: st.custody.date,
        circleClass: 'bg-green-100'
      }
    ];

    for (const spending of st.spending) {
      const typeMap: Record<string, string> = { FarmTransaction: 'معاملة مزرعة', DailyCost: 'تكلفة يومية', ManualExpense: 'مصروف يدوي' };
      events.push({
        icon: '📤',
        title: 'مصروف من العهدة',
        details: `${spending.description} — ${this.formatCurrency(spending.amount)}`,
        sub: `نوع المرجع: ${typeMap[spending.reference_type]}${spending.reference_id ? ' 🔗' : ''}`,
        date: spending.spending_date,
        circleClass: 'bg-orange-100'
      });
    }
    for (const returned of st.returns) {
      events.push({
        icon: '📥',
        title: 'تم إرجاع مبلغ',
        details: `${this.formatCurrency(returned.amount)} إلى خزينة ${returned.safe?.name || 'غير محدد'}`,
        date: returned.return_date,
        circleClass: 'bg-blue-100'
      });
    }
    if (st.custody.status === 'CLOSED') {
      events.push({
        icon: '✅',
        title: 'تم إغلاق العهدة',
        details: 'تم الإغلاق بعد التسوية',
        date: st.custody.date,
        circleClass: 'bg-slate-200'
      });
    }
    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  });



  closeAndReload(success: boolean, type: 'spending' | 'return' | 'settle'): void {
    // Signals auto-reset in effects
    if (success) {
      this.custodyService.loadStatement(this.id()).subscribe();
      this.custodyService.loadSummary().subscribe();
      this.custodyService.loadAll().subscribe();
    }
  }

  back(): void {
    this.router.navigate(['/custodies']);
  }

  formatCurrency = (amt: number | undefined | null) => this.utils.formatCurrency(amt);
}
