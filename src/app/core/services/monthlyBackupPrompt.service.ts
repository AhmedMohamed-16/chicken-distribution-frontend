import { Injectable, inject, signal } from '@angular/core';
import { BackupService } from './backup.service';
import { Backup } from '../models';

/**
 * Service to handle monthly backup download prompts
 *
 * Purpose: Prompt user to download a backup on the 1st day of each month
 * - Checks if today is the 1st day of the month
 * - Checks if prompt was already shown this month (localStorage)
 * - Finds today's backup if it exists
 * - Shows confirmation dialog (user must consent)
 * - Downloads backup only after user confirmation
 */
@Injectable({
  providedIn: 'root'
})
export class MonthlyBackupPromptService {
  private backupService = inject(BackupService);

  // Storage key for tracking shown prompts
  private readonly STORAGE_KEY = 'last_monthly_backup_prompt';

  // Signal to track if prompt is currently being processed
  readonly isProcessing = signal<boolean>(false);

  /**
   * Check if we should show the monthly prompt
   * Returns true only if:
   * 1. Today is the 1st day of the month
   * 2. Prompt hasn't been shown this month yet
   */
  shouldShowPrompt(): boolean {
    const today = new Date(new Date().toLocaleString('en-GB', { timeZone: 'Africa/Cairo' }));
    const dayOfMonth = today.getDate();

    // Only on the 1st day of the month
    if (dayOfMonth !== 1) {
      return false;
    }

    // Check if we already showed prompt this month
    const lastPromptDate = localStorage.getItem(this.STORAGE_KEY);
    if (lastPromptDate) {
      const lastDate = new Date(new Date(lastPromptDate).toLocaleString('en-GB', { timeZone: 'Africa/Cairo' }));
      const isSameMonth =
        lastDate.getFullYear() === today.getFullYear() &&
        lastDate.getMonth() === today.getMonth();

      // Don't show again if already shown this month
      if (isSameMonth) {
        return false;
      }
    }

    return true;
  }

  /**
   * Find today's backup from the list of backups
   * Returns the most recent backup created today, or null
   */
  findTodaysBackup(backups: Backup[]): Backup | null {



     const today = new Date(new Date().toLocaleString('en-GB', { timeZone: 'Africa/Cairo' }));
    today.setHours(0, 0, 0, 0); // Start of day

    const todaysBackups = backups.filter(backup => {
      const backupDate = new Date(new Date(backup.date).toLocaleString('en-GB', { timeZone: 'Africa/Cairo' }));
      backupDate.setHours(0, 0, 0, 0);
      return backupDate.getTime() === today.getTime() && backup.status === 'COMPLETED';
    });

    if (todaysBackups.length === 0) {
      return null;
    }

    // Return the most recent one
    return todaysBackups.sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];
  }

  /**
   * Mark that we showed the prompt this month
   * Stores current date to prevent duplicate prompts
   */
  markPromptAsShown(): void {
   const today = new Date(new Date().toLocaleString('en-GB', { timeZone: 'Africa/Cairo' }));
    localStorage.setItem(this.STORAGE_KEY, String(today.getTime()));
  }

  /**
   * Download a backup after user confirmation
   * This respects browser security - user interaction required
   */
  downloadBackup(backup: Backup): void {
    this.isProcessing.set(true);

    this.backupService.downloadBackup(backup.filename).subscribe({
      next: (blob) => {
        // Trigger browser download
        this.backupService.triggerBrowserDownload(blob, backup.filename);
        this.isProcessing.set(false);
      },
      error: (err) => {
        console.error('Monthly backup download failed:', err);
        this.isProcessing.set(false);
      }
    });
  }

  /**
   * Format date for display in prompt
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
