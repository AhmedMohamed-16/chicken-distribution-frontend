export type SafeType = 'CASH' | 'BANK' | 'VODAFONE_CASH' | 'INSTAPAY';
export type PaymentMethod = 'CASH' | 'INSTAPAY' | 'BANK' | 'VODAFONE_CASH';

export interface Safe {
  id: number;
  name: string;
  type: SafeType;
  current_balance: number;
  is_active: boolean;
}

export interface SafeDashboard extends Safe {
  total_in_today: number;
  total_out_today: number;
  total_in_alltime: number;
  total_out_alltime: number;
}

export interface SafeLedgerEntry {
  date: string;
  type: string;
  direction: 'IN' | 'OUT';
  amount: number;
  running_balance: number;
  reference: string;
}

export interface SafeLedgerResponse {
  safe: Safe;
  period: { from: string; to: string };
  opening_balance: number;
  closing_balance: number;
  recorded_balance: number;
  discrepancy: number;
  transactions: SafeLedgerEntry[];
  warning?: string;
}

export interface SafeTransfer {
  id: number;
  from_safe_id: number;
  to_safe_id: number;
  amount: number;
  transfer_date: string;
  notes?: string;
}
