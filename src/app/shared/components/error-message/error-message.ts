import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-error-message',
  imports: [CommonModule],
  templateUrl: './error-message.html',
  styleUrl: './error-message.css',
})
export class ErrorMessage {
  message = input.required<string>();
  type = input<'error' | 'warning' | 'info'>('error');
  dismissible = input<boolean>(true);
  dismiss = output<void>();

  onDismiss(): void {
    this.dismiss.emit();
  }

}
