import { DailyOperation, PartnerProfit, ProfitDistribution, VehicleBreakdown } from "./index";
import { PaymentMethod } from "./safe.model";

export type TransactionType =
  | 'SALE'
  | 'PURCHASE'
  | 'COST'
  | 'LOSS'
  | 'ADVANCE'
  | 'ADVANCE_RETURN'
  | 'SALARY'
  | 'CUSTODY'
  | 'CUSTODY_RETURN'
  | 'SAFE_TRANSFER'
  | 'PARTNER_WITHDRAWAL'
  | 'OTHER';

export interface FinancialTransaction {
  id: number;
  transaction_type: TransactionType;
  direction: 'IN' | 'OUT';
  amount: number;
  safe_id?: number;
  reference_type: string;
  reference_id: number;
  payment_method: PaymentMethod;
  transaction_date: string;
  notes?: string;
}

export interface FormattedOperation {
  operation: DailyOperation;
  profitDistribution: ProfitDistribution | null;
  partnerDistributions: PartnerProfit[];
  vehicleBreakdown: VehicleBreakdown[];
}

// ============================================
// AGGREGATED SUMMARY
// Returned by GET /api/financial-transactions/summary
// ============================================

export interface AggregatedSummaryTotals {
  total_revenue: number;
  total_purchases: number;
  total_losses: number;
  total_costs: number;
  vehicle_costs: number;
  net_profit: number;
}

export interface AggregatedSummaryDiscounts {
  total_sales_discount: number;
  total_purchase_discount: number;
  total: number;
}

export interface AggregatedSummaryDebts {
  from_sales: number;
  from_purchases: number;
  from_costs: number;
  total: number;
}

export interface AggregatedSummaryLosses {
  sale_losses: number;
  transport_losses: number;
  lossesWithFarm: number;
  lossesWithoutFarm: number;
}

export interface AggregatedSummary {
  total_operations_count: number;
  closed_operations_count: number;
  open_operations_count: number;
  totals: AggregatedSummaryTotals;
  discounts: AggregatedSummaryDiscounts;
  debts_paid: AggregatedSummaryDebts;
  debts_received: AggregatedSummaryDebts;
  losses: AggregatedSummaryLosses;
}

/** Full response shape from GET /api/financial-transactions/summary?date=... */
export interface FinancialSummaryResponse {
  success: boolean;
  data: FormattedOperation[];
  aggregatedSummary: AggregatedSummary;
}
