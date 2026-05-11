import { Component, inject, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CustodyService } from '../../../core/services/custody.service';
import { CustodyStatusBadgeComponent } from '../../../shared/components/custody-status-badge/custody-status-badge.component';
import { CustodyProgressBarComponent } from '../../../shared/components/custody-progress-bar/custody-progress-bar.component';

@Component({
  selector: 'app-custody-dashboard-widget',
  standalone: true,
  imports: [
    CommonModule,
    CustodyStatusBadgeComponent,
    CustodyProgressBarComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="custody-widget" dir="rtl">
  <!-- Header -->
  <div class="widget-header">
    <div class="header-content">
      <h3 class="widget-title">العهد النشطة</h3>

      <div class="header-meta">
        <span class="active-count">
          {{ activeCustodies().length }}
          عهدة
        </span>

        <button
          type="button"
          class="view-all-btn"
          (click)="viewAll()"
        >
          <span>عرض الكل</span>
          <span class="arrow-icon">←</span>
        </button>
      </div>
    </div>
  </div>

  <!-- Empty State -->
  @if (activeCustodies().length === 0) {
    <div class="empty-state">
      <div class="empty-icon">💰</div>

      <div class="empty-content">
        <h4 class="empty-title">لا توجد عهد نشطة</h4>
        <p class="empty-description">
          لا توجد أي عهد حالياً تحتاج إلى متابعة
        </p>
      </div>
    </div>
  }

  <!-- Content -->
  @else {
    <div class="custodies-list">

      @for (custody of activeCustodies().slice(0, 5); track custody.id) {

        <div
          class="custody-card"
          (click)="viewCustody(custody.id)"
        >

          <!-- Top Section -->
          <div class="custody-card-header">

            <!-- Recipient -->
            <div class="recipient-section">
              <div class="recipient-info">
                <h4 class="recipient-name">
                  {{ custody.recipient_name }}
                </h4>

                <span class="recipient-type">
                  {{
                    custody.given_to_person_type === 'EMPLOYEE'
                      ? 'موظف'
                      : 'شريك'
                  }}
                </span>
              </div>

              <app-custody-status-badge
                [status]="custody.status"
              />
            </div>

            <!-- Amount -->
            <div class="amount-section">
              <span class="amount-value">
                {{ custody.amount | number:'1.0-0' }}
              </span>

              <span class="amount-currency">
                جنيه
              </span>

              <span class="amount-label">
                قيمة العهدة
              </span>
            </div>
          </div>

          <!-- Progress -->
          <div class="progress-section">
            <app-custody-progress-bar
              [total]="custody.amount"
              [spent]="custody.spent_amount"
              [returned]="custody.returned_amount"
            />
          </div>

          <!-- Footer -->
          <div class="custody-card-footer">

            @if (custody.unaccounted_amount > 0) {
              <div class="warning-badge">
                <span class="warning-icon">⚠️</span>

                <span class="warning-text">
                  غير محاسَب:
                  {{ custody.unaccounted_amount | number:'1.0-0' }}
                  جنيه
                </span>
              </div>
            }

          </div>
        </div>
      }

      <!-- Overdue Alert -->
      @if (hasOverdueCustodies()) {
        <div class="overdue-alert">

          <div class="alert-icon">
            ⚠️
          </div>

          <div class="alert-content">
            <div class="alert-title">
              توجد عهد تحتاج إلى مراجعة
            </div>

            <div class="alert-description">
              يوجد {{ overdueCount() }} عهدة متأخرة منذ أكثر من 7 أيام
            </div>
          </div>

        </div>
      }

    </div>
  }
</div>
  `,
  styles: `/* =========================================================
   ROOT
========================================================= */

:host {
  display: block;
  width: 100%;
  min-width: 0;
}

/* =========================================================
   WIDGET CONTAINER
========================================================= */

.custody-widget {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  background: #ffffff;
  border-radius: 1.25rem;

  padding: 1rem;

  box-shadow:
    0 2px 10px rgba(15, 23, 42, 0.05),
    0 1px 3px rgba(15, 23, 42, 0.08);

  overflow: hidden;
  min-width: 0;
}

/* =========================================================
   HEADER
========================================================= */

.widget-header {
  border-bottom: 1px solid #eef2f7;
  padding-bottom: 0.875rem;
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.widget-title {
  margin: 0;

  font-size: clamp(1rem, 2vw, 1.25rem);
  font-weight: 700;
  color: #111827;

  line-height: 1.4;
}

.header-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.active-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  min-height: 2rem;

  padding-inline: 0.875rem;

  border-radius: 999px;

  background: #eff6ff;
  color: #1d4ed8;

  font-size: 0.8125rem;
  font-weight: 600;
}

.view-all-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;

  border: none;
  background: transparent;

  padding: 0.5rem 0.75rem;
  border-radius: 0.75rem;

  color: #2563eb;

  font-size: 0.875rem;
  font-weight: 600;

  cursor: pointer;

  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}

.view-all-btn:hover {
  background: #eff6ff;
  color: #1d4ed8;
}

.view-all-btn:active {
  transform: scale(0.98);
}

.arrow-icon {
  font-size: 0.875rem;
}

/* =========================================================
   EMPTY STATE
========================================================= */

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  text-align: center;

  padding: 2.5rem 1rem;
}

.empty-icon {
  font-size: clamp(2.5rem, 6vw, 4rem);
  line-height: 1;

  margin-bottom: 1rem;
}

.empty-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.empty-title {
  margin: 0;

  color: #111827;

  font-size: 1rem;
  font-weight: 700;
}

.empty-description {
  margin: 0;

  color: #6b7280;

  font-size: 0.875rem;
  line-height: 1.7;
}

/* =========================================================
   LIST
========================================================= */

.custodies-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* =========================================================
   CARD
========================================================= */

.custody-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  padding: 1rem;

  border: 1px solid #e5e7eb;
  border-radius: 1rem;

  background: #ffffff;

  cursor: pointer;

  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;
}

.custody-card:hover {
  border-color: #cbd5e1;

  background: #fafafa;

  box-shadow:
    0 6px 16px rgba(15, 23, 42, 0.06),
    0 2px 4px rgba(15, 23, 42, 0.05);
}

.custody-card:active {
  transform: scale(0.995);
}

/* =========================================================
   CARD HEADER
========================================================= */

.custody-card-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.recipient-section {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.recipient-info {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;

  min-width: 0;
}

.recipient-name {
  margin: 0;

  color: #111827;

  font-size: 0.95rem;
  font-weight: 700;

  line-height: 1.5;

  word-break: break-word;
}

.recipient-type {
  display: inline-flex;
  align-items: center;

  width: fit-content;

  padding: 0.2rem 0.6rem;

  border-radius: 999px;

  background: #f3f4f6;
  color: #4b5563;

  font-size: 0.75rem;
  font-weight: 600;
}

/* =========================================================
   AMOUNT
========================================================= */

.amount-section {
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  padding: 0.875rem;

  border-radius: 0.875rem;

  background:
    linear-gradient(
      135deg,
      #f8fafc 0%,
      #eef2ff 100%
    );

  min-width: 0;
}

.amount-value {
  color: #111827;

  font-size: clamp(1rem, 2vw, 1.25rem);
  font-weight: 800;

  line-height: 1.2;
}

.amount-currency {
  color: #4b5563;

  font-size: 0.8125rem;
  font-weight: 600;
}

.amount-label {
  margin-top: 0.25rem;

  color: #6b7280;

  font-size: 0.75rem;
}

/* =========================================================
   PROGRESS
========================================================= */

.progress-section {
  width: 100%;
  min-width: 0;
}

/* =========================================================
   FOOTER
========================================================= */

.custody-card-footer {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.warning-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;

  width: 100%;

  padding: 0.75rem;

  border-radius: 0.875rem;

  background: #fef2f2;
  border: 1px solid #fecaca;

  color: #b91c1c;
}

.warning-icon {
  flex-shrink: 0;
}

.warning-text {
  font-size: 0.8125rem;
  font-weight: 600;

  line-height: 1.6;
}

/* =========================================================
   OVERDUE ALERT
========================================================= */

.overdue-alert {
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;

  padding: 1rem;

  border-radius: 1rem;

  background: #fffbeb;
  border: 1px solid #fde68a;
}

.alert-icon {
  font-size: 1.25rem;
  line-height: 1;

  flex-shrink: 0;
}

.alert-content {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;

  min-width: 0;
}

.alert-title {
  color: #92400e;

  font-size: 0.9rem;
  font-weight: 700;
}

.alert-description {
  color: #a16207;

  font-size: 0.8125rem;
  line-height: 1.7;
}

/* =========================================================
   TABLET
========================================================= */

@media (min-width: 768px) {

  .custody-widget {
    padding: 1.25rem;
  }

  .header-content {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .custody-card-header {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: flex-start;
  }

  .amount-section {
    align-items: flex-end;
    text-align: left;
    min-width: 10rem;
  }

  .warning-badge {
    width: fit-content;
  }
}

/* =========================================================
   DESKTOP
========================================================= */

@media (min-width: 1024px) {

  .custody-widget {
    padding: 1.5rem;
  }

  .custody-card {
    padding: 1.25rem;
  }

  .custody-card:hover {
    transform: translateY(-2px);
  }

  .widget-title {
    font-size: 1.35rem;
  }

  .amount-value {
    font-size: 1.35rem;
  }
}`
})
export class CustodyDashboardWidgetComponent {
  private router = inject(Router);
  private custodyService = inject(CustodyService);

  activeCustodies = this.custodyService.activeCustodies;

  overdueCount = computed(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return this.activeCustodies().filter(c =>
      new Date(c.custody_date) < sevenDaysAgo
    ).length;
  });

  hasOverdueCustodies = computed(() => this.overdueCount() > 0);

  viewAll() {
    this.router.navigate(['/custodies']);
  }

  viewCustody(id: number) {
    this.router.navigate(['/custodies', id]);
  }
}
