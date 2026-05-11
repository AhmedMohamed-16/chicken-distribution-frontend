import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SalaryService } from '../../../core/services/salary.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { AuthService } from '../../../core/services/auth.service';
import { PERMISSIONS } from '../../../core/constants/Permissions.constant';
import { SalaryPayment, Employee } from '../../../core/models';
import { ReportUtilitiesService } from '../../../core/services/ReportUtilitiesService';
import { SalaryDialogComponent } from './salary-dialog.component';
import { SalarySummaryDialogComponent } from './salary-summary-dialog.component';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-salaries',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatTableModule, MatCardModule,
    MatButtonModule, MatIconModule, MatSelectModule, MatInputModule,
    MatFormFieldModule, MatDialogModule, MatSnackBarModule, MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './salaries.component.html',
  styleUrl: './salaries.component.css'
})
export class SalariesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private salaryService = inject(SalaryService);
  private employeeService = inject(EmployeeService);
  private authService = inject(AuthService);
  private utils = inject(ReportUtilitiesService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  PERMISSIONS = PERMISSIONS;

  // Data signals
  salaries = signal<SalaryPayment[]>([]);
  employees = signal<Employee[]>([]);
  isLoading = signal(false);

  // Filter form
  filterForm = this.fb.group({
    employee_id: [null as number | null],
    month: [null as number | null],
    year: [new Date().getFullYear()]
  });

  // Summary data
  totalPaidThisMonth = computed(() => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    return this.salaries().filter(s =>
      s.period_month === currentMonth && s.period_year === currentYear
    ).reduce((sum, s) => sum + s.amount, 0);
  });

  // Table columns
  displayedColumns: string[] = ['employee', 'month', 'year', 'amount', 'payment_method', 'date', 'created_by', 'actions'];

  // Arabic month names
  monthNames = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  ngOnInit(): void {
    this.loadEmployees();
    this.loadSalaries();
  }

  async loadEmployees() {
    try {
      const res = await firstValueFrom(this.employeeService.getAll(true));
      this.employees.set(res?.data || []);
    } catch (e) {
      this.snackBar.open('فشل تحميل قائمة الموظفين', 'حسناً', { duration: 3000 });
    }
  }

  async loadSalaries() {
    this.isLoading.set(true);
    try {
      const filters = this.filterForm.value;
      const params: any = {};
      if (filters.employee_id) params.employee_id = filters.employee_id;
      if (filters.month) params.month = filters.month;
      if (filters.year) params.year = filters.year;

      const res = await firstValueFrom(this.salaryService.getAll(params));
      this.salaries.set(res?.data || []);
    } catch (e) {
      this.snackBar.open('فشل تحميل بيانات المرتبات', 'حسناً', { duration: 3000 });
    } finally {
      this.isLoading.set(false);
    }
  }

  onFilterChange() {
    this.loadSalaries();
  }

  openRecordDialog() {
    const dialogRef = this.dialog.open(SalaryDialogComponent, {
      width: '600px',
      data: {},
      direction: 'rtl'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadSalaries();
        this.snackBar.open('تم صرف المرتب بنجاح', 'حسناً', { duration: 3000 });
      }
    });
  }

  openSummaryDialog(salary: SalaryPayment) {
    const dialogRef = this.dialog.open(SalarySummaryDialogComponent, {
      width: '500px',
      data: { employeeId: salary.employee_id, year: salary.period_year },
      direction: 'rtl'
    });
  }

  // Permissions
  canManage() {
    return this.authService.hasPermission(PERMISSIONS.SALARIES.MANAGE_SALARIES);
  }

  // Formatting helpers
  formatCurrency = (amt: number) => this.utils.formatCurrency(amt);
  formatDate = (date: any) => date ? this.utils.formatDate(date) : '-';
  getMonthName = (month: number) => this.monthNames[month - 1] || '';
  getEmployeeName = (employeeId: number) => {
    return this.employees().find(e => e.id === employeeId)?.name || 'غير محدد';
  };
  getPaymentMethodName = (method: string) => {
    const names: any = {
      'CASH': 'نقدي',
      'BANK': 'تحويل بنكي',
      'INSTAPAY': 'انستاباي',
      'VODAFONE_CASH': 'فودافون كاش'
    };
    return names[method] || method;
  };
}
