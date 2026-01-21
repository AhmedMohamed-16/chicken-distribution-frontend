export interface User {
  id: number;
  username: string;
  full_name: string;
  role: 'ADMIN' | 'USER';
  is_active: boolean;
  created_at: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface Partner {
  id: number;
  name: string;
  phone?: string;
  address?: string;
  investment_amount: number;
  investment_percentage: number;
  is_vehicle_partner: boolean;
  created_at: string;
}

export interface Vehicle {
  id: number;
  name: string;
  purchase_price: number;
  empty_weight?: number;
  plate_number?: string;
  created_at: string;
  partners?: VehiclePartner[];
}

export interface VehiclePartner {
  vehicle_id: number;
  partner_id: number;
  share_percentage: number;
  partner?: Partner;
}

export interface Farm {
  id: number;
  name: string;
  owner_name?: string;
  location?: string;
  phone?: string;
  total_debt: number;
  created_at: string;
}

export interface Buyer {
  id: number;
  name: string;
  phone?: string;
  address?: string;
  total_debt: number;
  created_at: string;
}

export interface ChickenType {
  id: number;
  name: string;
  description?: string;
}

export interface CostCategory {
  id: number;
  name: string;
  description?: string;
  is_vehicle_cost: boolean;
}

export interface DailyOperation {
  id: number;
  operation_date: string;
  vehicle_id: number;
  user_id: number;
  status: 'OPEN' | 'CLOSED';
  notes?: string;
  created_at: string;
  closed_at?: string;
  vehicle?: Vehicle;
  user?: User;
}

export interface FarmTransaction {
  id: number;
  daily_operation_id: number;
  farm_id: number;
  chicken_type_id: number;
  sequence_number: number;
  empty_vehicle_weight: number;
  loaded_vehicle_weight: number;
  cage_count: number;
  cage_weight_per_unit: number;
  net_chicken_weight: number;
  price_per_kg: number;
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  transaction_time: string;
  farm?: Farm;
  chicken_type?: ChickenType;
}

export interface SaleTransaction {
  id: number;
  daily_operation_id: number;
  buyer_id: number;
  chicken_type_id: number;
  sequence_number: number;
  loaded_cages_weight: number;
  empty_cages_weight: number;
  cage_count: number;
  net_chicken_weight: number;
  price_per_kg: number;
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  old_debt_paid: number;
  transaction_time: string;
  buyer?: Buyer;
  chicken_type?: ChickenType;
}

export interface TransportLoss {
  id: number;
  daily_operation_id: number;
  chicken_type_id: number;
  dead_weight: number;
  price_per_kg: number;
  loss_amount: number;
  location?: string;
  recorded_at: string;
  chicken_type?: ChickenType;
}

export interface DailyCost {
  id: number;
  daily_operation_id: number;
  cost_category_id: number;
  amount: number;
  description?: string;
  recorded_at: string;
  cost_category?: CostCategory;
}

export interface ProfitDistribution {
  id: number;
  daily_operation_id: number;
  total_revenue: number;
  total_purchases: number;
  total_losses: number;
  total_costs: number;
  vehicle_costs: number;
  net_profit: number;
  calculated_at: string;
  partner_profits?: PartnerProfit[];
}

export interface PartnerProfit {
  id: number;
  profit_distribution_id: number;
  partner_id: number;
  base_profit_share: number;
  vehicle_cost_share: number;
  final_profit: number;
  partner?: Partner;
}

export interface FarmLoadingRequest {
  farm_id: number;
  chicken_type_id: number;
  empty_vehicle_weight: number;
  loaded_vehicle_weight: number;
  cage_count: number;
  cage_weight_per_unit: number;
  price_per_kg: number;
  paid_amount: number;
}

export interface SaleRequest {
  buyer_id: number;
  chicken_type_id: number;
  loaded_cages_weight: number;
  empty_cages_weight: number;
  cage_count: number;
  price_per_kg: number;
  paid_amount: number;
  old_debt_paid?: number;
}

export interface TransportLossRequest {
  chicken_type_id: number;
  dead_weight: number;
  price_per_kg: number;
  location?: string;
}

export interface DailyCostRequest {
  cost_category_id: number;
  amount: number;
  description?: string;
}

export interface DailyReport {
  operation_date: string;
  summary: {
    total_purchases: number;
    total_sales: number;
    total_costs: number;
    total_losses: number;
    net_profit: number;
  };
  farm_transactions: FarmTransaction[];
  sales: SaleTransaction[];
  costs: DailyCost[];
  losses: TransportLoss[];
}

export interface PeriodReport {
  from: string;
  to: string;
  total_revenue: number;
  total_purchases: number;
  total_costs: number;
  total_losses: number;
  net_profit: number;
  daily_operations: DailyOperation[];
}
