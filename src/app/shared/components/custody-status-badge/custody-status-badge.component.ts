import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { CustodyStatus } from '../../../core/models';

@Component({
  selector: 'app-custody-status-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
<span
  class="status-badge"
  [class.open]="status() === 'OPEN'"
  [class.partial]="status() === 'PARTIAL'"
  [class.reconciled]="status() === 'RECONCILED'"
  [class.closed]="status() === 'CLOSED'"
>
  <!-- Status Dot -->
  <span
    class="status-indicator"
    aria-hidden="true"
  >
  </span>

  <!-- Label -->
  <span class="status-label">
    {{ label() }}
  </span>
</span>
  `,
  styles: [`
   /* =========================================================
   HOST
========================================================= */

:host {
  display: inline-flex;
  max-width: 100%;
}

/* =========================================================
   BASE BADGE
========================================================= */

.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;

  min-height: 2rem;
  max-width: 100%;

  padding-inline: 0.85rem;
  padding-block: 0.4rem;

  border-radius: 999px;
  border: 1px solid transparent;

  font-size: 0.75rem;
  font-weight: 700;
  line-height: 1.2;

  white-space: nowrap;

  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}

/* =========================================================
   INDICATOR
========================================================= */

.status-indicator {
  flex-shrink: 0;

  width: 0.55rem;
  height: 0.55rem;

  border-radius: 999px;

  background: currentColor;
}

/* =========================================================
   LABEL
========================================================= */

.status-label {
  overflow: hidden;
  text-overflow: ellipsis;
}

/* =========================================================
   OPEN
========================================================= */

.status-badge.open {
  background: #fef2f2;
  border-color: #fecaca;
  color: #b91c1c;
}

/* =========================================================
   PARTIAL
========================================================= */

.status-badge.partial {
  background: #fff7ed;
  border-color: #fed7aa;
  color: #c2410c;
}

/* =========================================================
   RECONCILED
========================================================= */

.status-badge.reconciled {
  background: #eff6ff;
  border-color: #bfdbfe;
  color: #1d4ed8;
}

/* =========================================================
   CLOSED
========================================================= */

.status-badge.closed {
  background: #f0fdf4;
  border-color: #bbf7d0;
  color: #15803d;
}

/* =========================================================
   MOBILE IMPROVEMENTS
========================================================= */

@media (max-width: 767px) {

  .status-badge {
    min-height: 1.9rem;

    padding-inline: 0.75rem;
    padding-block: 0.38rem;

    font-size: 0.72rem;
  }
}

/* =========================================================
   TABLET
========================================================= */

@media (min-width: 768px) {

  .status-badge {
    font-size: 0.78rem;
  }
}

/* =========================================================
   DESKTOP
========================================================= */

@media (min-width: 1024px) {

  .status-badge:hover {
    transform: translateY(-1px);
  }
}
  `]
})
export class CustodyStatusBadgeComponent {
  status = input.required<CustodyStatus>();

  label = computed(() => {
    switch (this.status()) {
      case 'OPEN': return 'مفتوحة';
      case 'PARTIAL': return 'جزئية';
      case 'RECONCILED': return 'محاسَبة';
      case 'CLOSED': return 'مغلقة';
      default: return '';
    }
  });

  badgeClass = computed(() => {
    return this.status().toLowerCase();
  });
}
