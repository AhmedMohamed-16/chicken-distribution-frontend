import { Component, Input, OnInit, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

export interface StatementTransaction {
  date: string;
  type: string;
  amount: number;
  balanceImpact: number;
  reference: string;
  entity_id: number;
  balance_after: number;
  direction_change?: boolean;
}

export interface StatementResponse {
  entityType: string;
  entityId: number;
  opening_balance: number;
  closing_balance: number;
  transactions: StatementTransaction[];
}

@Component({
  selector: 'app-account-statement',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatInputModule,
   MatProgressSpinner
  ],
  templateUrl: './account-statement.component.html',
  styleUrls: ['./account-statement.component.css']
})
export class AccountStatementComponent implements OnInit, OnChanges {
  @Input() entityType!: string;
  @Input() entityId!: number;
  @Input() entityName: string = '';

  startDate: Date | null = null;
  endDate: Date | null = null;

  isLoading = false;
  statementData: StatementResponse | null = null;

  dataSource = new MatTableDataSource<StatementTransaction>([]);
  displayedColumns: string[] = ['date', 'reference', 'type', 'amount', 'balanceImpact', 'balance_after'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void {
    if (this.entityType && this.entityId) {
      this.loadStatement();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['entityId'] && !changes['entityId'].firstChange) ||
        (changes['entityType'] && !changes['entityType'].firstChange)) {
      this.loadStatement();
    }
  }

  loadStatement(): void {
    if (!this.entityType || !this.entityId) return;

    this.isLoading = true;
    let url = `${environment.apiUrl}/statements/${this.entityType}/${this.entityId}`;

    const token = this.authService.token();
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : undefined;

    const params: string[] = [];
    if (this.startDate) params.push(`startDate=${this.startDate.toISOString()}`);
    if (this.endDate) params.push(`endDate=${this.endDate.toISOString()}`);

    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    this.http.get<{ success: boolean, data: StatementResponse }>(url, { headers }).subscribe({
      next: (res) => {
        this.statementData = res.data;
        this.dataSource.data = res.data.transactions;
        setTimeout(() => {
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        });
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load statement', err);
        this.isLoading = false;
      }
    });
  }

  formatMoney(value: number | null | undefined): string {
    const v = value ?? 0;
    const formatted = new Intl.NumberFormat('ar-EG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(v);

    // Ensure digits are Arabic even if they come already localized.
    return formatted.replace(/\d/g, d => (['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'] as const)[Number(d)]);
  }

  getTypeLabel(type: string): string {
    const types: Record<string, string> = {
      'SALE': 'مبيعات',
      'PAYMENT_RECEIVED': 'دفعة مستلمة',
      'PAYMENT_SENT': 'دفعة منصرفة',
      'PURCHASE': 'مشتريات',
      'COST': 'مصروف',
      'PROFIT': 'أرباح موزعة',
      'INVESTMENT': 'استثمار',
      'REINVESTMENT': 'إعادة استثمار',
      'WITHDRAWAL': 'مسحوبات',
      'ADVANCE': 'سلفة',
      'ADVANCE_RETURN': 'سداد سلفة',
      'SALARY_PAYMENT': 'صرف راتب',
      'SALARY_SETTLEMENT': 'خصم سلفة من الراتب',
      'IN': 'إيداع نقدي',
      'OUT': 'سحب نقدي'
    };
    return types[type] || type;
  }

  printStatement(): void {
    window.print();
  }
}

