import { Component, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BackupService } from '../../../core/services/backup.service';

import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';
import { ErrorMessage } from '../../../shared/components/error-message/error-message';
import { RestoreBackupResponse, RestoreStrategy } from '../../../core/models';

/**
 * Component for restoring database from backup file
 * Features:
 * - File upload (ZIP only)
 * - Strategy selection (replace/append)
 * - Confirmation dialogs
 * - Progress indicator
 * - Restore statistics display
 */
@Component({
  selector: 'app-backup-restore',
  imports: [CommonModule, FormsModule, LoadingSpinner, ErrorMessage],
  templateUrl: './backup-restore.html',
  styleUrl: './backup-restore.css'
})
export class BackupRestore{
  private backupService = inject(BackupService);

  // State signals
  selectedFile = signal<File | null>(null);
  strategy = signal<RestoreStrategy>('append');
  restoring = signal<boolean>(false);
  error = signal<string>('');
  showConfirmation = signal<boolean>(false);
  restoreResult = signal<RestoreBackupResponse['data'] | null>(null);
  uploadProgress = signal<number>(0);

  // Output event when restore is completed
  restoreCompleted = output<void>();

  // File size limit (500MB)
  private readonly MAX_FILE_SIZE = 500 * 1024 * 1024;

  /**
   * Handle file selection
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Validate file type
      if (!file.name.toLowerCase().endsWith('.zip')) {
        this.error.set('Please select a ZIP file');
        this.selectedFile.set(null);
        return;
      }

      // Validate file size
      if (file.size > this.MAX_FILE_SIZE) {
        this.error.set(`File size exceeds 500MB limit (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
        this.selectedFile.set(null);
        return;
      }

      this.selectedFile.set(file);
      this.error.set('');
    }
  }

  /**
   * Show confirmation dialog before restore
   */
  initiateRestore(): void {
    if (!this.selectedFile()) {
      this.error.set('Please select a backup file');
      return;
    }

    this.showConfirmation.set(true);
  }

  /**
   * Cancel restore operation
   */
  cancelRestore(): void {
    this.showConfirmation.set(false);
  }

  /**
   * Confirm and execute restore
   */
  confirmRestore(): void {
    const file = this.selectedFile();
    if (!file) {
      this.error.set('No file selected');
      this.showConfirmation.set(false);
      return;
    }

    this.restoring.set(true);
    this.error.set('');
    this.showConfirmation.set(false);
    this.restoreResult.set(null);
    this.uploadProgress.set(0);

    // Simulate upload progress (actual progress tracking would require backend support)
    const progressInterval = setInterval(() => {
      const current = this.uploadProgress();
      if (current < 90) {
        this.uploadProgress.set(current + 10);
      }
    }, 200);

    this.backupService.restoreBackup(file, this.strategy()).subscribe({
      next: (response) => {
        clearInterval(progressInterval);
        this.uploadProgress.set(100);
        this.restoring.set(false);
        this.restoreResult.set(response.data);

        // Emit event to parent
        this.restoreCompleted.emit();

        // Reset form
        setTimeout(() => {
          this.resetForm();
        }, 5000);
      },
      error: (err) => {
        clearInterval(progressInterval);
        this.uploadProgress.set(0);
        this.restoring.set(false);
        this.error.set(err.message);
      }
    });
  }

  /**
   * Reset form to initial state
   */
  resetForm(): void {
    this.selectedFile.set(null);
    this.strategy.set('append');
    this.restoreResult.set(null);
    this.uploadProgress.set(0);

    // Reset file input
    const fileInput = document.getElementById('backupFile') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  /**
   * Get file size in human-readable format
   */
  getFileSize(): string {
    const file = this.selectedFile();
    if (!file) return '';

    const sizeInMB = file.size / 1024 / 1024;
    return `${sizeInMB.toFixed(2)} MB`;
  }

  /**
   * Dismiss error message
   */
  dismissError(): void {
    this.error.set('');
  }

  /**
   * Get warning message based on strategy
   */
 getWarningMessage(): string {
  if (this.strategy() === 'replace') {
    return '⚠️ خطر: سيتم حذف جميع البيانات الحالية نهائيًا واستبدالها ببيانات النسخة الاحتياطية. هذا الإجراء لا يمكن التراجع عنه!';
  }
  return '⚠️ تحذير: سيقوم هذا الإجراء بتعديل قاعدة البيانات الخاصة بك عن طريق إضافة أو تحديث السجلات من النسخة الاحتياطية. قد يتم تعديل السجلات الحالية.';
}

}
