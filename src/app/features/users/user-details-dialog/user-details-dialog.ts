 import { Component, inject } from '@angular/core';

import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { UserDetails } from '../user-details/user-details';

@Component({
  selector: 'app-user-details-dialog',
  imports: [MatDialogModule, UserDetails],
  templateUrl: './user-details-dialog.html',
  styleUrl: './user-details-dialog.css',
})
export class UserDetailsDialog {
dialogRef = inject(MatDialogRef<UserDetailsDialog>);
  data = inject(MAT_DIALOG_DATA);

  close(): void {
    this.dialogRef.close();
  }

}
