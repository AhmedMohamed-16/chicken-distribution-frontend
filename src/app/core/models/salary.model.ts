import { PaymentMethod } from "./safe.model";

export interface SalaryPayment {
  id: number;
  employee_id: number;
  amount: number;
  payment_date: string;
  period_month: number;
  period_year: number;
  payment_method: PaymentMethod;
  safe_id?: number;
  notes?: string;
  created_by?: string;
}
