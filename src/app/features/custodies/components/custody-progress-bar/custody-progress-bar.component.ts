import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-custody-progress-bar',
  imports: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
<div class="progress-bar-container">
  <!-- Progress Bar Track -->
  <div class="progress-track" dir="ltr" role="progressbar"
       [attr.aria-valuemin]="0"
       [attr.aria-valuemax]="total()"
       [attr.aria-valuenow]="spent() + returned()"
       aria-label="تقدم العهدة">

    <div class="progress-segments">
      <!-- Spent Segment (Orange) -->
      <div class="progress-segment spent-segment"
           [style.width.%]="spentPct()"
           [class.has-value]="spentPct() > 0">
      </div>

      <!-- Returned Segment (Blue) -->
      <div class="progress-segment returned-segment"
           [style.width.%]="returnedPct()"
           [class.has-value]="returnedPct() > 0">
      </div>

      <!-- Unaccounted Segment (Red/Gray) -->
      <div class="progress-segment unaccounted-segment"
           [style.width.%]="unaccPct()"
           [class.has-value]="unaccPct() > 0"
           [class.negative]="unaccPct() > 0">
      </div>
    </div>
  </div>

  <!-- Legend / Statistics -->
  <div class="progress-legend">
    <div class="legend-item spent-item">
      <span class="legend-dot spent-dot"></span>
      <span class="legend-label">المصروف:</span>
      <span class="legend-value">{{ spent() | number:'1.2-2' }} جنيه</span>
    </div>

    <div class="legend-item returned-item">
      <span class="legend-dot returned-dot"></span>
      <span class="legend-label">المُرجَع:</span>
      <span class="legend-value">{{ returned() | number:'1.2-2' }} جنيه</span>
    </div>

    <div class="legend-item unaccounted-item" [class.has-unaccounted]="unaccountedAmount() > 0">
      <span class="legend-dot" [class.unaccounted-dot]="unaccountedAmount() > 0" [class.zero-dot]="unaccountedAmount() <= 0"></span>
      <span class="legend-label">غير محاسَب:</span>
      <span class="legend-value" [class.negative-value]="unaccountedAmount() > 0" [class.zero-value]="unaccountedAmount() <= 0">
        {{ unaccountedAmount() | number:'1.2-2' }} جنيه
      </span>
    </div>
  </div>
</div>
  `,
  styles: `
/* -------------------------------------------------------------------
   Custody Progress Bar Component - Modern ERP Responsive Styles
   Mobile-First | RTL-Friendly | Accessible | Clean Architecture
-------------------------------------------------------------------- */

/* ---------------------------- Variables ---------------------------- */
.progress-bar-container {
  --c-progress-height: 8px;
  --c-progress-radius: 9999px;
  --c-spent-color: #f97316;
  --c-spent-dark: #ea580c;
  --c-returned-color: #3b82f6;
  --c-returned-dark: #2563eb;
  --c-unaccounted-color: #ef4444;
  --c-unaccounted-dark: #dc2626;
  --c-zero-color: #d1d5db;
  --c-text-primary: #1f2937;
  --c-text-secondary: #4b5563;
  --c-transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --c-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);

  width: 100%;
  direction: rtl;
}

/* ---------------------------- Progress Track ------------------------- */
.progress-track {
  width: 100%;
  overflow: hidden;
  border-radius: var(--c-progress-radius);
  background-color: #f3f4f6;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
}

.progress-segments {
  display: flex;
  height: var(--c-progress-height);
  width: 100%;
  transition: var(--c-transition);
}

.progress-segment {
  height: 100%;
  transition: var(--c-transition);
  position: relative;
  overflow: hidden;
}

/* Shimmer effect for segments with value */
.progress-segment.has-value::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* Individual Segment Colors */
.spent-segment {
  background-color: var(--c-spent-color);
  background-image: linear-gradient(135deg, var(--c-spent-color) 0%, var(--c-spent-dark) 100%);
}

.returned-segment {
  background-color: var(--c-returned-color);
  background-image: linear-gradient(135deg, var(--c-returned-color) 0%, var(--c-returned-dark) 100%);
}

.unaccounted-segment {
  background-color: var(--c-zero-color);
  transition: var(--c-transition);
}

.unaccounted-segment.negative {
  background-color: var(--c-unaccounted-color);
  background-image: linear-gradient(135deg, var(--c-unaccounted-color) 0%, var(--c-unaccounted-dark) 100%);
}

/* ---------------------------- Legend (Mobile-First) ------------------ */
.progress-legend {
  display: flex;
  flex-wrap: wrap;
  gap: clamp(8px, 3vw, 16px);
  margin-top: clamp(8px, 2.5vw, 12px);
  justify-content: space-between;
  align-items: center;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: clamp(0.7rem, 2.5vw, 0.75rem);
  line-height: 1.4;
  flex: 1;
  min-width: fit-content;
}

/* Legend Dots */
.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  transition: var(--c-transition);
}

.spent-dot {
  background-color: var(--c-spent-color);
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.2);
}

.returned-dot {
  background-color: var(--c-returned-color);
  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.2);
}

.unaccounted-dot {
  background-color: var(--c-unaccounted-color);
  box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.2);
  animation: pulse-warning 2s ease-in-out infinite;
}

@keyframes pulse-warning {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

.zero-dot {
  background-color: var(--c-zero-color);
}

/* Legend Labels & Values */
.legend-label {
  color: var(--c-text-secondary);
  font-weight: 500;
}

.legend-value {
  font-weight: 600;
  color: var(--c-text-primary);
  direction: ltr;
  display: inline-block;
}

/* Negative value styling (when there's unaccounted amount) */
.negative-value {
  color: var(--c-unaccounted-color);
  font-weight: 700;
}

.zero-value {
  color: var(--c-text-secondary);
  font-weight: 500;
}

/* Responsive Legend Layout */
@media (max-width: 640px) {
  .progress-legend {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .legend-item {
    width: 100%;
    justify-content: space-between;
    padding: 4px 0;
    border-bottom: 1px solid #f3f4f6;
  }

  .legend-item:last-child {
    border-bottom: none;
  }

  .legend-dot {
    width: 12px;
    height: 12px;
  }

  .legend-label {
    font-size: 0.8rem;
  }

  .legend-value {
    font-size: 0.85rem;
  }
}

/* Tablet and Desktop Layout */
@media (min-width: 641px) and (max-width: 1023px) {
  .progress-legend {
    gap: 12px;
  }

  .legend-item {
    flex: 1;
    justify-content: flex-start;
    gap: 8px;
  }

  .legend-value {
    font-size: 0.8rem;
  }
}

@media (min-width: 1024px) {
  .progress-legend {
    gap: 20px;
  }

  .legend-item {
    gap: 10px;
  }

  .legend-label {
    font-size: 0.85rem;
  }

  .legend-value {
    font-size: 0.9rem;
  }
}

/* ---------------------------- Accessibility & Interactions ----------- */

/* Focus visible for progress bar (when interactive) */
.progress-track:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Hover effects for legend items (desktop only) */
@media (hover: hover) {
  .legend-item:hover .legend-dot {
    transform: scale(1.2);
  }

  .legend-item:hover .legend-value {
    filter: brightness(0.9);
  }

  .progress-segment.has-value:hover {
    filter: brightness(0.95);
    cursor: pointer;
  }
}

/* Touch-friendly tap targets */
@media (hover: none) and (pointer: coarse) {
  .legend-item {
    padding: 6px 0;
  }

  .legend-dot {
    width: 14px;
    height: 14px;
  }
}

/* ---------------------------- RTL Support ---------------------------- */
[dir="rtl"] .progress-legend {
  direction: rtl;
}

[dir="rtl"] .legend-item {
  flex-direction: row;
}

[dir="rtl"] .legend-value {
  direction: ltr;
  text-align: left;
}

/* Ensure proper segment ordering in RTL */
[dir="rtl"] .progress-segments {
  flex-direction: row-reverse;
}

/* ---------------------------- Reduced Motion ------------------------- */
@media (prefers-reduced-motion: reduce) {
  .progress-segment,
  .legend-dot,
  .legend-item:hover .legend-dot,
  .progress-segment.has-value::after {
    animation: none;
    transition: none;
  }

  .progress-segment.has-value::after {
    display: none;
  }

  @keyframes pulse-warning {
    from, to { transform: scale(1); }
  }
}

/* ---------------------------- High Contrast Mode --------------------- */
@media (prefers-contrast: high) {
  .spent-segment {
    background-color: #d9480f;
  }

  .returned-segment {
    background-color: #1e40af;
  }

  .unaccounted-segment.negative {
    background-color: #b91c1c;
  }

  .legend-dot {
    border: 1px solid currentColor;
  }

  .legend-value {
    font-weight: 700;
  }
}

/* ---------------------------- Tooltip / Additional Info ------------- */
/* Optional: Add tooltip on hover for percentage info */
.progress-segment {
  position: relative;
}

.progress-segment.has-value:hover::before {
  content: attr(data-percent);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: #1f2937;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  white-space: nowrap;
  z-index: 10;
  pointer-events: none;
  margin-bottom: 4px;
}

/* Ensure segments display properly with zero width */
.progress-segment[style*="width: 0%"] {
  display: none;
}

/* Loading state (if needed) */
.progress-bar-container.loading {
  opacity: 0.6;
  pointer-events: none;
}

.progress-bar-container.loading .progress-segment::after {
  animation: none;
}

/* ---------------------------- Utility Classes ------------------------ */
.text-orange-700 { color: #c2410c; }
.text-blue-700 { color: #1d4ed8; }
.text-red-700 { color: #b91c1c; }
.text-gray-500 { color: #6b7280; }
`
})
export class CustodyProgressBarComponent {
  total = input.required<number>();
  spent = input.required<number>();
  returned = input.required<number>();

  spentPct = computed(() => (this.total() > 0 ? (this.spent() / this.total()) * 100 : 0));
  returnedPct = computed(() => (this.total() > 0 ? (this.returned() / this.total()) * 100 : 0));
  unaccPct = computed(() => Math.max(0, 100 - this.spentPct() - this.returnedPct()));

  unaccountedAmount = computed(() => Math.max(0, this.total() - this.spent() - this.returned()));
}
