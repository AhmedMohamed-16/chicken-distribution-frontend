import { PaymentMethod } from "./safe.model";
import { PersonType } from "./person.model";

export type AdvanceStatus = 'PENDING' | 'PARTIAL' | 'RETURNED';

export interface EmployeeAdvance {
  id: number;
  employee_id: number;
  person_id?: number;
  person_type?: PersonType;
  amount: number;
  advance_date: string;
  expected_return_date?: string;
  returned_amount: number;
  status: AdvanceStatus;
  description?: string;
  payment_method: PaymentMethod;
  safe_id?: number;
  // populated from backend
  employee?: { full_name: string };
  person_name?: string;
}

export interface AdvanceReturn {
  id: number;
  advance_id: number;
  amount: number;
  return_date: string;
  payment_method: PaymentMethod;
  notes?: string;
}
