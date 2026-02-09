import { Component, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BackupService } from '../../../core/services/backup.service';
import { CreateBackupResponse } from '../../../core/models';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';
import { ErrorMessage } from '../../../shared/components/error-message/error-message';
import { ConfirmationDialog } from '../../../shared/components/confirmation-dialog/confirmation-dialog/confirmation-dialog';
import { MatDialog } from '@angular/material/dialog';

/**
 * Component for creating new database backups
 * Features:
 * - Create backup button
 * - Loading state during creation
 * - Success message with backup details
 * - Error handling
 */
@Component({
  selector: 'app-backup-create',
  imports: [CommonModule, LoadingSpinner, ErrorMessage],
  templateUrl: './backup-create.html',
  styleUrl: './backup-create.css'
})
export class BackupCreate {
  private backupService = inject(BackupService);

  // State signals
  creating = signal<boolean>(false);
  error = signal<string>('');
  successMessage = signal<string>('');
  lastBackupDetails = signal<CreateBackupResponse['data'] | null>(null);
private dialog = inject(MatDialog);
  // Output event when backup is created successfully
  backupCreated = output<void>();

  /**
   * Create a new backup
   */
  createBackup(): void {
    this.creating.set(true);
    this.error.set('');
    this.successMessage.set('');
    this.lastBackupDetails.set(null);

    this.backupService.createBackup().subscribe({
      next: (response) => {
        this.creating.set(false);
        this.successMessage.set(response.message);
        this.lastBackupDetails.set(response.data);

        // Emit event to parent to refresh backup list
        this.backupCreated.emit();

        // Auto-dismiss success message after 5 seconds
        setTimeout(() => {
          this.successMessage.set('');
        }, 5000);

        // Prompt user to download the newly created backup
        this.promptDownloadNewBackup(response.data.filename);
      },
      error: (err) => {
        this.creating.set(false);
        this.error.set(err.message);
      }
    });
  }

  /**
   * Prompt user to download the newly created backup
   * Uses native confirm dialog - simple and effective
   */
  /**
 * Prompt user to download the newly created backup
 * Uses Material Dialog for consistent UI
 */
private promptDownloadNewBackup(filename: string): void {
  // Small delay to let success message show first
  setTimeout(() => {
    const dialogRef = this.dialog.open(ConfirmationDialog, {
      data: {
        title: 'تحميل النسخة الاحتياطية',
        message: 'تم إنشاء النسخة الاحتياطية بنجاح!\n\nهل ترغب في تحميلها الآن؟',
        confirmText: 'تحميل',
        cancelText: 'لاحقاً',
        type: 'success' // أو 'primary' حسب تصميم الـ dialog
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.downloadNewBackup(filename);
      }
    });
  }, 500);
}


  /**
   * Download the newly created backup
   */
  private downloadNewBackup(filename: string): void {
    this.backupService.downloadBackup(filename).subscribe({
      next: (blob) => {
        this.backupService.triggerBrowserDownload(blob, filename);
      },
      error: (err) => {
        this.error.set(`Download failed: ${err.message}`);
      }
    });
  }

  /**
   * Dismiss error message
   */
  dismissError(): void {
    this.error.set('');
  }

  /**
   * Dismiss success message
   */
  dismissSuccess(): void {
    this.successMessage.set('');
    this.lastBackupDetails.set(null);
  }
}
