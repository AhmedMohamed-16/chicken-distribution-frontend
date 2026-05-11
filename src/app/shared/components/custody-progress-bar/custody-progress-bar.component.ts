import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-custody-progress-bar',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
   <div class="progress-wrapper">

  <!-- Progress Bar -->
  <div
    class="progress-track"
    dir="ltr"
    role="progressbar"
    [attr.aria-valuenow]="spent() + returned()"
    [attr.aria-valuemin]="0"
    [attr.aria-valuemax]="total()"
    [attr.aria-label]="'حالة العهدة'"
  >

    <div class="progress-segments">

      <!-- Spent -->
      <div
        class="segment spent-segment"
        [style.width.%]="spentPercent()"
      >
      </div>

      <!-- Returned -->
      <div
        class="segment returned-segment"
        [style.width.%]="returnedPercent()"
      >
      </div>

      <!-- Unaccounted -->
      <div
        class="segment"
        [class.unaccounted-danger]="unaccounted() > 0"
        [class.unaccounted-safe]="unaccounted() <= 0"
        [style.width.%]="unaccountedPercent()"
      >
      </div>

    </div>
  </div>

  <!-- Statistics -->
  <div class="progress-stats" dir="rtl">

    <!-- Spent -->
    <div class="stat-card spent-card">

      <div class="stat-indicator spent-indicator"></div>

      <div class="stat-content">
        <span class="stat-label">
          مصروف
        </span>

        <span class="stat-value">
          {{ spent() | number:'1.0-0' }}
          <small>جنيه</small>
        </span>
      </div>

    </div>

    <!-- Returned -->
    <div class="stat-card returned-card">

      <div class="stat-indicator returned-indicator"></div>

      <div class="stat-content">
        <span class="stat-label">
          مُرجَع
        </span>

        <span class="stat-value">
          {{ returned() | number:'1.0-0' }}
          <small>جنيه</small>
        </span>
      </div>

    </div>

    <!-- Unaccounted -->
    <div
      class="stat-card"
      [class.unaccounted-card]="unaccounted() > 0"
      [class.settled-card]="unaccounted() <= 0"
    >

      <div
        class="stat-indicator"
        [class.unaccounted-indicator]="unaccounted() > 0"
        [class.settled-indicator]="unaccounted() <= 0"
      >
      </div>

      <div class="stat-content">

        <span class="stat-label">
          غير محاسَب
        </span>

        <span
          class="stat-value"
          [class.unaccounted-text]="unaccounted() > 0"
          [class.settled-text]="unaccounted() <= 0"
        >
          {{ unaccounted() | number:'1.0-0' }}
          <small>جنيه</small>
        </span>

      </div>

    </div>

  </div>
</div>
  `,
  styles: `/* =========================================================
   HOST
========================================================= */

:host {
  display: block;
  width: 100%;
  min-width: 0;
}

/* =========================================================
   WRAPPER
========================================================= */

.progress-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;

  width: 100%;
  min-width: 0;
}

/* =========================================================
   PROGRESS BAR
========================================================= */

.progress-track {
  position: relative;

  width: 100%;
  height: 1rem;

  overflow: hidden;

  border-radius: 999px;

  background: #e5e7eb;
}

.progress-segments {
  display: flex;

  width: 100%;
  height: 100%;
}

.segment {
  height: 100%;

  transition:
    width 0.35s ease,
    background-color 0.25s ease;
}

/* =========================================================
   SEGMENTS
========================================================= */

.spent-segment {
  background:
    linear-gradient(
      135deg,
      #fb923c 0%,
      #ea580c 100%
    );
}

.returned-segment {
  background:
    linear-gradient(
      135deg,
      #60a5fa 0%,
      #2563eb 100%
    );
}

.unaccounted-danger {
  background:
    linear-gradient(
      135deg,
      #f87171 0%,
      #dc2626 100%
    );
}

.unaccounted-safe {
  background:
    linear-gradient(
      135deg,
      #9ca3af 0%,
      #6b7280 100%
    );
}

/* =========================================================
   STATS
========================================================= */

.progress-stats {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}

/* =========================================================
   STAT CARD
========================================================= */

.stat-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;

  min-width: 0;

  padding: 0.75rem 0.875rem;

  border-radius: 1rem;

  border: 1px solid #e5e7eb;

  background: #ffffff;

  transition:
    border-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.stat-card:hover {
  box-shadow:
    0 4px 10px rgba(15, 23, 42, 0.05),
    0 1px 3px rgba(15, 23, 42, 0.04);
}

/* =========================================================
   CARD VARIANTS
========================================================= */

.spent-card {
  background: #fff7ed;
  border-color: #fed7aa;
}

.returned-card {
  background: #eff6ff;
  border-color: #bfdbfe;
}

.unaccounted-card {
  background: #fef2f2;
  border-color: #fecaca;
}

.settled-card {
  background: #f9fafb;
  border-color: #d1d5db;
}

/* =========================================================
   INDICATORS
========================================================= */

.stat-indicator {
  flex-shrink: 0;

  width: 0.875rem;
  height: 0.875rem;

  border-radius: 999px;
}

.spent-indicator {
  background: #ea580c;
}

.returned-indicator {
  background: #2563eb;
}

.unaccounted-indicator {
  background: #dc2626;
}

.settled-indicator {
  background: #6b7280;
}

/* =========================================================
   CONTENT
========================================================= */

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;

  min-width: 0;
}

.stat-label {
  color: #6b7280;

  font-size: 0.75rem;
  font-weight: 600;

  line-height: 1.4;
}

.stat-value {
  color: #111827;

  font-size: 0.9rem;
  font-weight: 700;

  line-height: 1.5;

  word-break: break-word;
}

.stat-value small {
  font-size: 0.72rem;
  font-weight: 600;
}

.unaccounted-text {
  color: #b91c1c;
}

.settled-text {
  color: #4b5563;
}

/* =========================================================
   TABLET
========================================================= */

@media (min-width: 768px) {

  .progress-stats {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .stat-card {
    min-height: 5rem;
  }

  .stat-content {
    gap: 0.3rem;
  }

  .stat-value {
    font-size: 1rem;
  }
}

/* =========================================================
   DESKTOP
========================================================= */

@media (min-width: 1024px) {

  .progress-wrapper {
    gap: 1rem;
  }

  .progress-track {
    height: 1.1rem;
  }

  .stat-card {
    padding: 0.9rem 1rem;
  }

  .stat-card:hover {
    transform: translateY(-1px);
  }

  .stat-label {
    font-size: 0.8rem;
  }

  .stat-value {
    font-size: 1.05rem;
  }
}`
})
export class CustodyProgressBarComponent {
  total = input.required<number>();
  spent = input.required<number>();
  returned = input.required<number>();

  spentPercent = computed(() => (this.spent() / this.total()) * 100);
  returnedPercent = computed(() => (this.returned() / this.total()) * 100);
  unaccountedPercent = computed(() => 100 - this.spentPercent() - this.returnedPercent());
  unaccounted = computed(() => this.total() - this.spent() - this.returned());

  unaccountedClasses = computed(() => {
    const unaccounted = this.unaccounted();
    return unaccounted > 0 ? 'bg-red-500' : 'bg-gray-400';
  });

  unaccountedTextClasses = computed(() => {
    const unaccounted = this.unaccounted();
    return unaccounted > 0 ? 'text-red-600' : 'text-gray-600';
  });
}
