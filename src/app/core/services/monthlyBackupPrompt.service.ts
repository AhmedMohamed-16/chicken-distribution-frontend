import { Injectable, inject, signal } from '@angular/core';
import { BackupService } from './backup.service';
import { Backup } from '../models';

@Injectable({
  providedIn: 'root'
})
export class MonthlyBackupPromptService {

  private backupService = inject(BackupService);

  private readonly STORAGE_KEY = 'last_monthly_backup_prompt';

  readonly isProcessing = signal<boolean>(false);

  /**
   * Check if we should show the monthly prompt
   */
  shouldShowPrompt(): boolean {
    const now = new Date();

    // نجيب اليوم بتوقيت القاهرة
    const cairoDay = this.getCairoDayOfMonth(now);

    // يظهر فقط يوم 1
    if (cairoDay !== 1 && cairoDay !== 2) {
    return false;
    }

    const lastPrompt = localStorage.getItem(this.STORAGE_KEY);

    if (lastPrompt) {
      const lastDate = new Date(Number(lastPrompt));

      const isSameMonth = this.isSameCairoMonth(lastDate, now);

      if (isSameMonth) {
        return false;
      }
    }

    return true;
  }

  /**
   * Find today's completed backup (Cairo date)
   */
  findTodaysBackup(backups: Backup[]): Backup | null {

    const now = new Date();

    const todaysBackups = backups.filter(backup => {
      if (!backup?.date) return false;

      const backupDate = new Date(backup.date);

      if (isNaN(backupDate.getTime())) return false;

      return (
        this.isSameCairoDay(backupDate, now) &&
        backup.status === 'COMPLETED'
      );
    });

    if (!todaysBackups.length) return null;

    // الأحدث أولاً
    return todaysBackups.sort(
      (a, b) =>
        new Date(b.date).getTime() -
        new Date(a.date).getTime()
    )[0];
  }

  /**
   * Mark prompt as shown
   */
  markPromptAsShown(): void {
    localStorage.setItem(this.STORAGE_KEY, String(Date.now()));
  }

  /**
   * Download backup
   */
  downloadBackup(backup: Backup): void {
    this.isProcessing.set(true);

    this.backupService.downloadBackup(backup.filename).subscribe({
      next: (blob) => {
        this.backupService.triggerBrowserDownload(blob, backup.filename);
        this.isProcessing.set(false);
      },
      error: (err) => {
        console.error('Monthly backup download failed:', err);
        this.isProcessing.set(false);
      }
    });
  }

  // ================================
  // 🔥 Cairo-safe date utilities
  // ================================

  private getCairoDayOfMonth(date: Date): number {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Africa/Cairo',
      day: '2-digit'
    });

    return Number(formatter.format(date));
  }

  private isSameCairoMonth(d1: Date, d2: Date): boolean {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Africa/Cairo',
      year: 'numeric',
      month: '2-digit'
    });

    return formatter.format(d1) === formatter.format(d2);
  }

  private isSameCairoDay(d1: Date, d2: Date): boolean {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Africa/Cairo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });

    return formatter.format(d1) === formatter.format(d2);
  }
}
