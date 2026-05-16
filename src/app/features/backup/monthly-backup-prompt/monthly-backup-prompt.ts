import { Component, input, output } from '@angular/core';

import { Backup } from '../../../core/models';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-monthly-backup-prompt',
  imports: [LoadingSpinner],

  templateUrl: './monthly-backup-prompt.html',
  styleUrl: './monthly-backup-prompt.css',
})
export class MonthlyBackupPrompt {
  show = input.required<boolean>();
  backup = input.required<Backup | null>();
  formattedDate = input.required<string>();
  downloading = input.required<boolean>();

  // Outputs
  confirm = output<void>();
  dismiss = output<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onDismiss(): void {
    this.dismiss.emit();
  }
}
