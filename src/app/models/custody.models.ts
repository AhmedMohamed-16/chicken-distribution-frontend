export type CustodyStatus = 'OPEN' | 'PARTIAL' | 'RECONCILED' | 'CLOSED';
export type PersonType = 'EMPLOYEE' | 'PARTNER';
export type SpendingReferenceType = 'FarmTransaction' | 'DailyCost' | 'ManualExpense';
export type PaymentMethod = 'CASH' | 'INSTAPAY' | 'BANK' | 'VODAFONE_CASH';
export type PaymentSourceType = 'SAFE' | 'CUSTODY';

export interface Custody {
  id: number;
  given_to_person_type: PersonType;
  given_to_person_id: number;
  amount: number;
  returned_amount: number;
  spent_amount: number;
  reconciled_amount: number; // virtual from backend
  unaccounted_amount: number; // virtual from backend
  status: CustodyStatus;
  custody_date: string;
  safe_id: number | null;
  payment_method: PaymentMethod;
  description: string;
  created_at: string;
  updated_at: string;
  recipient_name?: string; // enriched by backend on list/detail
  safe?: { name: string };
}

export interface CustodySpending {
  id: number;
  custody_id: number;
  reference_type: SpendingReferenceType;
  reference_id: number | null;
  amount: number;
  description: string;
  spending_date: string;
  recorded_by_user_id: number;
  recorder?: { full_name: string };
}

export interface CustodyReturn {
  id: number;
  custody_id: number;
  amount: number;
  return_date: string;
  safe_id: number | null;
  payment_method: PaymentMethod;
  notes: string;
  created_at: string;
  safe?: { name: string };
}

export interface CustodyStatement {
  custody: {
    id: number;
    amount: number;
    status: CustodyStatus;
    date: string;
    recipient_type: PersonType;
    recipient_name: string;
    safe_name: string;
  };
  spending: CustodySpending[];
  returns: CustodyReturn[];
  summary: {
    total_issued: number;
    total_spent: number;
    total_returned: number;
    unaccounted: number;
  };
}

export interface CreateCustodyRequest {
  given_to_person_type: PersonType;
  given_to_person_id: number;
  amount: number;
  custody_date: string;
  safe_id: number | null;
  payment_method: PaymentMethod;
  description: string;
}

export interface RecordReturnRequest {
  amount: number;
  return_date: string;
  safe_id: number | null;
  payment_method: PaymentMethod;
  notes: string;
}

export interface RecordSpendingRequest {
  amount: number;
  reference_type: SpendingReferenceType;
  reference_id: number | null;
  description: string;
  spending_date: string;
}

export interface SettleCustodyRequest {
  daily_operation_id?: number;
  cost_category_id?: number;
  notes?: string;
}

export interface PaymentSourceSelection {
  payment_source_type: PaymentSourceType;
  payment_source_id: number;
}

export interface CustodySummaryResponse {
  custodies: (Custody & { unaccounted: number })[];
  totals: {
    total_unaccounted: number;
    total_issued: number;
    count: number;
  };
}
