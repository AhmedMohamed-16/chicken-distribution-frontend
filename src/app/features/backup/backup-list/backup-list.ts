import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval, Subject } from 'rxjs';
import { takeUntil, startWith, switchMap } from 'rxjs/operators';
import { BackupService } from '../../../core/services/backup.service';
import { Backup } from '../../../core/models';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';
import { ErrorMessage } from '../../../shared/components/error-message/error-message';
import { ReportUtilitiesService } from '../../../core/services/ReportUtilitiesService';

/**
 * Component for displaying list of all backups
 * Features:
 * - Auto-refresh every 30 seconds
 * - Download functionality
 * - Loading and error states
 * - Empty state handling
 */
@Component({
  selector: 'app-backup-list',
  imports: [CommonModule, LoadingSpinner , ErrorMessage ],
  templateUrl: './backup-list.html',
  styleUrl: './backup-list.css'
})
export class BackupList implements OnInit, OnDestroy {
  private backupService = inject(BackupService);
  private utils = inject(ReportUtilitiesService);
  private destroy$ = new Subject<void>();

  // State signals
  backups = signal<Backup[]>([]);
  loading = signal<boolean>(false);
  error = signal<string>('');
  downloadingId = signal<number | null>(null);

  // Computed signals
  hasBackups = computed(() => this.backups().length > 0);
  lastBackup = computed(() => {
    const sorted = [...this.backups()].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    return sorted[0] || null;
  });

  ngOnInit(): void {
    // Load backups immediately and set up auto-refresh
    this.loadBackups();

    // Auto-refresh every 30 seconds
    interval(30000)
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.loadBackups();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load backups from server
   */
  private loadBackups(): void {
    this.loading.set(true);
    this.error.set('');

    this.backupService.listBackups()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.backups.set(data);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err.message);
          this.loading.set(false);
          this.backups.set([]); // Clear backups on error
        }
      });
  }

  /**
   * Refresh backups manually
   */
  refreshBackups(): void {
    this.loadBackups();
  }

  /**
   * Download a backup file
   */
  downloadBackup(backup: Backup): void {
    this.downloadingId.set(backup.id);
    this.error.set('');

    this.backupService.downloadBackup(backup.filename).subscribe({
      next: (blob) => {
        this.backupService.triggerBrowserDownload(blob, backup.filename);
        this.downloadingId.set(null);
      },
      error: (err) => {
        this.error.set(`Download failed: ${err.message}`);
        this.downloadingId.set(null);
      }
    });
  }

  /**
   * Check if a backup is currently being downloaded
   */
  isDownloading(backupId: number): boolean {
    return this.downloadingId() === backupId;
  }

  /**
   * Format date for display
   */
formatDateTime = (date: string | Date | undefined | null) => this.utils.formatDateTime(date);

  /**
   * Get CSS class for backup status
   */
  getStatusClass(status: string): string {
    switch (status) {
      case 'COMPLETED':
        return 'status-completed';
      case 'PENDING':
        return 'status-pending';
      case 'FAILED':
        return 'status-failed';
      default:
        return '';
    }
  }

  /**
   * Dismiss error message
   */
  dismissError(): void {
    this.error.set('');
  }
}
