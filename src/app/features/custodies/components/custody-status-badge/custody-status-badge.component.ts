import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CustodyStatus } from '../../../../models/custody.models';

@Component({
  selector: 'app-custody-status-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
<div class="status-badge-container">
  @switch (status()) {
    @case ('OPEN') {
      <span class="status-badge status-open" role="status" aria-label="حالة العهدة: مفتوحة">
        <span class="status-dot open-dot"></span>
        <span class="status-text">مفتوحة</span>
      </span>
    }
    @case ('PARTIAL') {
      <span class="status-badge status-partial" role="status" aria-label="حالة العهدة: جزئية">
        <span class="status-dot partial-dot"></span>
        <span class="status-text">جزئية</span>
      </span>
    }
    @case ('RECONCILED') {
      <span class="status-badge status-reconciled" role="status" aria-label="حالة العهدة: محاسَبة">
        <span class="status-dot reconciled-dot"></span>
        <span class="status-text">محاسَبة</span>
      </span>
    }
    @case ('CLOSED') {
      <span class="status-badge status-closed" role="status" aria-label="حالة العهدة: مغلقة">
        <span class="status-dot closed-dot"></span>
        <span class="status-text">مغلقة</span>
      </span>
    }
  }
</div>
  `,
  styles: `
/* -------------------------------------------------------------------
   Custody Status Badge Component - Modern ERP Responsive Styles
   Mobile-First | RTL-Friendly | Accessible | Clean Architecture
-------------------------------------------------------------------- */

/* ---------------------------- Variables ---------------------------- */
.status-badge-container {
  --c-status-open-bg: #fef3c7;
  --c-status-open-text: #92400e;
  --c-status-open-dot: #f59e0b;

  --c-status-partial-bg: #ffedd5;
  --c-status-partial-text: #9a3412;
  --c-status-partial-dot: #f97316;

  --c-status-reconciled-bg: #dbeafe;
  --c-status-reconciled-text: #1e40af;
  --c-status-reconciled-dot: #3b82f6;

  --c-status-closed-bg: #d1fae5;
  --c-status-closed-text: #065f46;
  --c-status-closed-dot: #10b981;

  --c-transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  --c-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);

  display: inline-flex;
}

/* ---------------------------- Base Badge Styles --------------------- */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: clamp(0.7rem, 3vw, 0.75rem);
  font-weight: 600;
  line-height: 1.5;
  letter-spacing: 0.3px;
  white-space: nowrap;
  transition: var(--c-transition);
  box-shadow: var(--c-shadow-sm);
}

/* Status Dots */
.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  transition: var(--c-transition);
}

/* Open Status */
.status-open {
  background-color: var(--c-status-open-bg);
  color: var(--c-status-open-text);
}

.open-dot {
  background-color: var(--c-status-open-dot);
  box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.2);
}

/* Partial Status */
.status-partial {
  background-color: var(--c-status-partial-bg);
  color: var(--c-status-partial-text);
}

.partial-dot {
  background-color: var(--c-status-partial-dot);
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.2);
}

/* Reconciled Status */
.status-reconciled {
  background-color: var(--c-status-reconciled-bg);
  color: var(--c-status-reconciled-text);
}

.reconciled-dot {
  background-color: var(--c-status-reconciled-dot);
  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.2);
}

/* Closed Status */
.status-closed {
  background-color: var(--c-status-closed-bg);
  color: var(--c-status-closed-text);
}

.closed-dot {
  background-color: var(--c-status-closed-dot);
  box-shadow: 0 0 0 1px rgba(16, 185, 129, 0.2);
}

/* ---------------------------- Status Text --------------------------- */
.status-text {
  font-weight: 600;
  transition: var(--c-transition);
}

/* ---------------------------- Hover Effects ------------------------- */
@media (hover: hover) {
  .status-badge:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .status-badge:hover .status-dot {
    transform: scale(1.2);
  }

  .status-badge:active {
    transform: translateY(0);
  }
}

/* ---------------------------- Touch-Friendly (Mobile) --------------- */
@media (hover: none) and (pointer: coarse) {
  .status-badge {
    padding: 6px 14px;
    font-size: 0.75rem;
  }

  .status-dot {
    width: 10px;
    height: 10px;
  }
}

/* ---------------------------- Responsive Sizing ---------------------- */
@media (max-width: 640px) {
  .status-badge {
    padding: 3px 10px;
    font-size: 0.7rem;
  }

  .status-dot {
    width: 6px;
    height: 6px;
  }
}

@media (min-width: 1024px) {
  .status-badge {
    padding: 5px 14px;
    font-size: 0.8rem;
  }

  .status-dot {
    width: 9px;
    height: 9px;
  }
}

/* ---------------------------- Accessibility -------------------------- */
.status-badge:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* High Contrast Mode Support */
@media (prefers-contrast: high) {
  .status-open {
    border: 1px solid #92400e;
  }

  .status-partial {
    border: 1px solid #9a3412;
  }

  .status-reconciled {
    border: 1px solid #1e40af;
  }

  .status-closed {
    border: 1px solid #065f46;
  }

  .status-dot {
    border: 1px solid currentColor;
  }
}

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
  .status-badge,
  .status-dot,
  .status-text {
    transition: none;
  }

  .status-badge:hover {
    transform: none;
  }

  .status-badge:hover .status-dot {
    transform: none;
  }
}

/* ---------------------------- RTL Support --------------------------- */
[dir="rtl"] .status-badge {
  flex-direction: row;
}

[dir="rtl"] .status-text {
  margin-inline-end: 0;
}

/* ---------------------------- Animation for Status Changes --------- */
@keyframes statusAppear {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.status-badge {
  animation: statusAppear 0.2s ease-out;
}

/* ---------------------------- Loading/Skeleton State (Optional) ----- */
.status-badge.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
  color: transparent;
  pointer-events: none;
}

.status-badge.skeleton .status-dot {
  opacity: 0;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* ---------------------------- Utility Classes ----------------------- */
.status-badge-clickable {
  cursor: pointer;
}

.status-badge-clickable:active {
  transform: scale(0.98);
}

/* Badge with icon support */
.status-badge-with-icon {
  gap: 8px;
}

.status-badge-with-icon mat-icon {
  font-size: 14px;
  width: 14px;
  height: 14px;
}

/* Responsive text handling for very small screens */
@media (max-width: 480px) {
  .status-badge {
    white-space: normal;
    word-break: keep-all;
    text-align: center;
  }
}
`
})
export class CustodyStatusBadgeComponent {
  status = input.required<CustodyStatus>();
}
