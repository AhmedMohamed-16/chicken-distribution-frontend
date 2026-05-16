import { Component, inject, signal, computed, OnInit } from '@angular/core';

import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { DebtReportService } from '../../../../core/services/DebtReport.service';

import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { BuyerStatementSummary, DateRange, FarmStatementSummary, StatementDialogData, StatementTransaction } from '../../../../core/models';
import { Observable } from 'rxjs';
import { MatChipsModule } from '@angular/material/chips';
import { ReportUtilitiesService } from '../../../../core/services/ReportUtilitiesService';
import { BalanceDirectionPipe } from '../../../../shared/pipes/balance-direction.pipe';
import { AccountStatementComponent } from '../../../../shared/components/account-statement/account-statement.component';

@Component({
  selector: 'app-statement-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    AccountStatementComponent
],
  template: `
    <div class="dialog-header d-flex justify-content-between align-items-center p-3">
      <h2 mat-dialog-title class="m-0">كشف حساب تفصيلي</h2>
      <button mat-icon-button (click)="close()" class="close-btn">
        <mat-icon>close</mat-icon>
      </button>
    </div>
    
    <mat-dialog-content class="mat-typography p-0">
      <app-account-statement 
        [entityType]="data.entityType.toUpperCase()" 
        [entityId]="data.entityId"
        [entityName]="data.entityName">
      </app-account-statement>
    </mat-dialog-content>
    
    <mat-dialog-actions align="end" class="p-2 no-print">
      <button mat-button (click)="close()">إغلاق</button>
    </mat-dialog-actions>
  `,
  styles: [`
    :host {
      display: block;
      direction: rtl;
    }
    .dialog-header {
      border-bottom: 1px solid #eee;
    }
    mat-dialog-content {
      max-height: 80vh;
      overflow-y: auto;
    }
    @media print {
      .no-print {
        display: none !important;
      }
      mat-dialog-content {
        max-height: none !important;
        overflow: visible !important;
      }
    }
  `]
})
export class StatementDialog {
  private dialogRef = inject(MatDialogRef<StatementDialog>);
  public data = inject<StatementDialogData>(MAT_DIALOG_DATA);

  close(): void {
    this.dialogRef.close();
  }
}
