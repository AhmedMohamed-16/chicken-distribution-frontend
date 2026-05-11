import { PaymentMethod } from "./safe.model";

export interface PartnerBalance {
  partner: {
    id: number;
    name: string;
    investment_percentage: number;
  };
  accumulated_profit: number;
  total_withdrawn: number;
  total_reinvested: number;
  current_balance: number;
}

export interface PartnerWithdrawal {
  id: number;
  partner_id: number;
  amount: number;
  withdrawal_date: string;
  payment_method: PaymentMethod;
  safe_id?: number;
  safe?: { id: number; name: string };
  notes?: string;
  processed_by_user_id: number;
}

export interface PartnerReinvestment {
  id: number;
  partner_id: number;
  amount: number;
  reinvest_date: string;
  notes?: string;
  processed_by_user_id: number;
}

export interface PartnerTransaction {
  id: number;
  type: 'WITHDRAWAL' | 'REINVESTMENT';
  amount: number;  // negative for withdrawal, positive for reinvestment
  date: string;
  safe?: { id: number; name: string };
  notes?: string;
  processed_by_user_id: number;
}
