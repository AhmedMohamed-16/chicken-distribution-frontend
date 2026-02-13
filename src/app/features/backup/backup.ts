import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { BackupList } from './backup-list/backup-list';
import { BackupCreate } from './backup-create/backup-create';
import { BackupRestore } from './backup-restore/backup-restore';
import { MonthlyBackupPrompt } from './monthly-backup-prompt/monthly-backup-prompt';
import { AuthService } from '../../core/services/auth.service';
import { BackupService } from '../../core/services/backup.service';
import { MonthlyBackupPromptService } from '../../core/services/monthlyBackupPrompt.service';
import { Backup as  BackupModel} from '../../core/models';
import { ReportUtilitiesService } from '../../core/services/ReportUtilitiesService';

@Component({
  selector: 'app-backup',
  imports: [    CommonModule,
    BackupList,
    BackupCreate,
    BackupRestore,
    MonthlyBackupPrompt
],
  templateUrl: './backup.html',
  styleUrl: './backup.css',
})
export class Backup implements OnInit {
  authService = inject(AuthService);
  private backupService = inject(BackupService);
  monthlyPromptService = inject(MonthlyBackupPromptService);

private utils = inject(ReportUtilitiesService);
 formatCurrency = (amount: number | undefined | null) => this.utils.formatCurrency(amount);
formatNumber = (num: number | undefined | null, decimals?: number) => this.utils.formatNumber(num, decimals);
formatPercentage = (value: number | undefined | null|string, decimals?: number) => this.utils.formatPercentage(value, decimals);
formatDateTime = (date: string | Date | undefined | null) => this.utils.formatDateTime(date);


  // Monthly prompt state
  showMonthlyPrompt = signal<boolean>(false);
  monthlyBackup = signal<BackupModel | null>(null);
  monthlyBackupDate = computed(() => {
    const backup = this.monthlyBackup();
    return backup ? this.utils.formatDate(backup.date) : '';
  });

  ngOnInit(): void {

    // Check for monthly backup prompt after auth
    if (this.authService.isAuthenticated()) {
      this.checkMonthlyBackupPrompt();
    }
  }

  /**
   * Check if we should show monthly backup download prompt
   * Only runs once on app init, on the 1st of the month
   */
  private checkMonthlyBackupPrompt(): void {
    // Check if today is the 1st and prompt hasn't been shown
    if (!this.monthlyPromptService.shouldShowPrompt()) {
      return;
    }

    // Fetch backups to find today's backup
    this.backupService.listBackups().subscribe({
      next: (backups) => {
        const todaysBackup = this.monthlyPromptService.findTodaysBackup(backups);

        if (todaysBackup) {
          // Show the prompt - user must confirm
          this.monthlyBackup.set(todaysBackup);
          this.showMonthlyPrompt.set(true);
        } else {
          // No backup today, mark as shown to prevent future checks
          this.monthlyPromptService.markPromptAsShown();
        }
      },
      error: (err) => {
        console.error('Failed to check for monthly backup:', err);
        // Don't show prompt on error
      }
    });
  }

  /**
   * Handle user confirming monthly backup download
   * This is triggered by user interaction, respecting browser security
   */
  handleMonthlyDownload(): void {
    const backup = this.monthlyBackup();
    if (!backup) return;

    // Download the backup (user initiated)
    this.monthlyPromptService.downloadBackup(backup);

    // Mark prompt as shown for this month
    this.monthlyPromptService.markPromptAsShown();

    // Hide the prompt
    this.showMonthlyPrompt.set(false);
  }

  /**
   * Handle user dismissing monthly prompt
   * Marks as shown to prevent re-showing this month
   */
  dismissMonthlyPrompt(): void {
    this.monthlyPromptService.markPromptAsShown();
    this.showMonthlyPrompt.set(false);
  }

  /**
   * Handle backup created event
   */
  onBackupCreated(): void {
    // Refresh backup list when new backup is created
    const backupList = document.querySelector('app-backup-list') as any;
    if (backupList?.refreshBackups) {
      backupList.refreshBackups();
    }
  }

  /**
   * Handle restore completed event
   */
  onRestoreCompleted(): void {
    // Refresh backup list after restore
    const backupList = document.querySelector('app-backup-list') as any;
    if (backupList?.refreshBackups) {
      backupList.refreshBackups();
    }
  }

  /**
   * Logout user
   */
  logout(): void {
    this.authService.logout();
    window.location.href = '/login';
  }
}
