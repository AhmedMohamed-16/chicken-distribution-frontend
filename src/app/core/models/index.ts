// export interface User {
//   id: number;
//   username: string;
//   full_name: string;
//   role: 'ADMIN' | 'USER';
//   is_active: boolean;
//   created_at: string;
// }

// export interface LoginRequest {
//   username: string;
//   password: string;
// }

// export interface LoginResponse {
//   token: string;
//   user: User;
// }

// // export interface Partner {
// //   id: number;
// //   name: string;
// //   phone?: string;
// //   address?: string;
// //   investment_amount: number;
// //   investment_percentage: number;
// //   is_vehicle_partner: boolean;
// //   created_at: string;
// // }
// export interface Partner {
//   id: number;
//   name: string;
//   phone?: string;
//   address?: string;
//   investment_amount: number;
//   investment_percentage: number;
//   created_at: string;

//   // ✅ Per-vehicle partnerships (replaces is_vehicle_partner)
//   vehicle_partnerships?: VehiclePartner[];
// }

// export interface Vehicle {
//   id: number;
//   name: string;
//   purchase_price: number;
//   empty_weight?: number;
//   plate_number?: string;
//   created_at: string;
//   partners?: VehiclePartner[];
//   vehicle_operations?: VehicleOperation[];
// }

// // export interface VehiclePartner {
// //   vehicle_id: number;
// //   partner_id: number;
// //   share_percentage: number;
// //   partner?: Partner;
// // }
// export interface VehiclePartner {
//   vehicle_id: number;
//   partner_id: number;
//   share_percentage: number;
//   vehicle?: Vehicle;
// }

// export interface Farm {
//   id: number;
//   name: string;
//   owner_name?: string;
//   location?: string;
//   phone?: string;
//   total_debt: number;
//   created_at: string;
// }

// export interface Buyer {
//   id: number;
//   name: string;
//   phone?: string;
//   address?: string;
//   total_debt: number;
//   created_at: string;
// }

// export interface ChickenType {
//   id: number;
//   name: string;
//   description?: string;
// }

// export interface CostCategory {
//   id: number;
//   name: string;
//   description?: string;
//   is_vehicle_cost: boolean;
// }
// export interface VehicleOperation {
//   id: number;
//   daily_operation_id: number;
//   vehicle_id: number;
//   vehicle?: Vehicle;
//   sequence_number: number;
//   status: 'ACTIVE' | 'COMPLETED';
//   created_at: string;

//   // Per-vehicle aggregations
//   total_loaded_weight?: number;
//   total_sold_weight?: number;
//   total_losses?: number;
// }

// // export interface DailyOperation {
// //   id: number;
// //   operation_date: string;
// //   vehicle_id: number;
// //   user_id: number;
// //   status: 'OPEN' | 'CLOSED';
// //   notes?: string;
// //   created_at: string;
// //   closed_at?: string;
// //   vehicle?: Vehicle;
// //   user?: User;
// // }

// export interface DailyOperation {
//   id: number;
//   operation_date: string;
//   vehicles?: Vehicle[];  // ✅ Multiple vehicles
//   vehicle_operations?: VehicleOperation[];  // ✅ Per-vehicle tracking
//   user_id: number;
//   status: 'OPEN' | 'CLOSED';
//   notes?: string;
//   created_at: string;
//   closed_at?: string;

//   // Aggregated data (from all vehicles)
//   farm_transactions?: FarmTransaction[];
//   sale_transactions?: SaleTransaction[];
//   transport_losses?: TransportLoss[];
//   daily_costs?: DailyCost[];
//   profit_distribution?: ProfitDistribution;
// }


// export interface FarmTransaction {
//   id: number;
//   daily_operation_id: number;
//   vehicle_id: number;
//   farm_id: number;
//   chicken_type_id: number;
//   sequence_number: number;
//   empty_vehicle_weight: number;
//   loaded_vehicle_weight: number;
//   cage_count: number;
//   cage_weight_per_unit: number;
//   net_chicken_weight: number;
//   price_per_kg: number;
//   total_amount: number;
//   paid_amount: number;
//   remaining_amount: number;
//   transaction_time: string;
//   farm?: Farm;
//   chicken_type?: ChickenType;
// }

// export interface SaleTransaction {
//   id: number;
//   daily_operation_id: number;
//   vehicle_id: number;
//   buyer_id: number;
//   chicken_type_id: number;
//   sequence_number: number;
//   loaded_cages_weight: number;
//   empty_cages_weight: number;
//   cage_count: number;
//   net_chicken_weight: number;
//   price_per_kg: number;
//   total_amount: number;
//   paid_amount: number;
//   remaining_amount: number;
//   old_debt_paid: number;
//   transaction_time: string;
//   buyer?: Buyer;
//   chicken_type?: ChickenType;
// }

// export interface TransportLoss {
//   id: number;
//   daily_operation_id: number;
//   vehicle_id: number;
//   chicken_type_id: number;
//   dead_weight: number;
//   price_per_kg: number;
//   loss_amount: number;
//   location?: string;
//   recorded_at: string;
//   chicken_type?: ChickenType;
// }

// // export interface DailyCost {
// //   id: number;
// //   daily_operation_id: number;
// //   cost_category_id: number;
// //   amount: number;
// //   description?: string;
// //   recorded_at: string;
// //   cost_category?: CostCategory;
// // }
// export interface DailyCost {
//   id: number;
//   daily_operation_id: number;
//   vehicle_id?: number;  // ✅ Required for vehicle costs
//   cost_category_id: number;
//   cost_category?: CostCategory;
//   amount: number;
//   description?: string;
//   recorded_at: string;
// }

// // export interface ProfitDistribution {
// //   id: number;
// //   daily_operation_id: number;
// //   total_revenue: number;
// //   total_purchases: number;
// //   total_losses: number;
// //   total_costs: number;
// //   vehicle_costs: number;
// //   net_profit: number;
// //   calculated_at: string;
// //   partner_profits?: PartnerProfit[];
// // }
// export interface ProfitDistribution {
//   id: number;
//   daily_operation_id: number;

//   // ✅ Per-vehicle summaries
//   vehicle_summaries: VehicleProfitSummary[];

//   // Overall totals
//   total_revenue: number;
//   total_purchases: number;
//   total_losses: number;
//   total_costs: number;
//   total_vehicle_costs: number;
//   net_profit: number;
//   calculated_at: string;

//   // Partner distributions across all vehicles
//   partner_profits: PartnerProfit[];
// }

// export interface VehicleProfitSummary {
//   vehicle_id: number;
//   vehicle?: Vehicle;
//   revenue: number;
//   purchases: number;
//   losses: number;
//   vehicle_costs: number;
//   other_costs_share: number;
//   net_profit: number;
// }
// // export interface PartnerProfit {
// //   id: number;
// //   profit_distribution_id: number;
// //   partner_id: number;
// //   base_profit_share: number;
// //   vehicle_cost_share: number;
// //   final_profit: number;
// //   partner?: Partner;
// // }
// export interface PartnerProfit {
//   id: number;
//   profit_distribution_id: number;
//   partner_id: number;
//   partner?: Partner;
//   vehicle_id?: number;  // ✅ Optional: per-vehicle breakdown
//   base_profit_share: number;
//   vehicle_cost_share: number;
//   final_profit: number;
// }

// export interface FarmLoadingRequest {
//   farm_id: number;
//   chicken_type_id: number;
//   empty_vehicle_weight: number;
//   loaded_vehicle_weight: number;
//   cage_count: number;
//   cage_weight_per_unit: number;
//   price_per_kg: number;
//   paid_amount: number;
// }

// export interface SaleRequest {
//   buyer_id: number;
//   chicken_type_id: number;
//   loaded_cages_weight: number;
//   empty_cages_weight: number;
//   cage_count: number;
//   price_per_kg: number;
//   paid_amount: number;
//   old_debt_paid?: number;
// }

// export interface TransportLossRequest {
//   chicken_type_id: number;
//   dead_weight: number;
//   price_per_kg: number;
//   location?: string;
// }

// export interface DailyCostRequest {
//       vehicle_id?: number;  // ✅ Required for vehicle costs
//   cost_category_id: number;
//   amount: number;
//   description?: string;
// }






// export interface DailyReport {
//   operation_id: string;
//   summary: {
//     total_purchases: number;
//     total_sales: number;
//     total_costs: number;
//     total_losses: number;
//     net_profit: number;
//   };
//   farm_transactions: FarmTransaction[];
//   sales: SaleTransaction[];
//   costs: DailyCost[];
//   losses: TransportLoss[];
//   vehicle_count:number;
//   vehicles:Vehicle[];
//   vehicle_breakdown:any[];
// status: 'OPEN' | 'CLOSED';
// }

// export interface PeriodReport {
//   from: string;
//   to: string;
//   total_revenue: number;
//   total_purchases: number;
//   total_costs: number;
//   total_losses: number;
//   net_profit: number;
//   daily_operations: DailyOperation[];
// }
// src/app/core/models/index.ts

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// Updated Partner interface to match backend response
export interface Partner {
  id: number;
  name: string;
  phone?: string;
  address?: string;
  investment_amount: number;
  investment_percentage: number;
  is_vehicle_partner: boolean;
  created_at: string;

  // Backend includes vehicles array with join data
  vehicles?: Vehicle[];

  // Computed fields (added by frontend or backend)
  total_vehicle_investment?: number;
  vehicle_count?: number;


  // Join table data (from vehicle_partner_info alias)
  vehicle_partner_info?: {
    share_percentage: number;
  };

}

export interface Vehicle {
  id: number;
  name: string;
  purchase_price: number;
  empty_weight?: number;
  plate_number?: string;
  created_at: string;

  // Backend includes partners array
  partners?: Partner[];

  // Join table data (comes from backend through Sequelize)
  VehiclePartner?: {
    share_percentage: number;
  };

  // Alternative format (through 'as' alias)
  vehicle_share?: {
    share_percentage: number;
  };

  vehicle_operations?: VehicleOperation[];

}
// export interface VehicleOperation {
//   id: number;
//   daily_operation_id: number;
//   vehicle_id: number;
//   status: 'ACTIVE' | 'COMPLETED';
//   assigned_at: string;
//   completed_at?: string;

//   // Relationships
//   vehicle?: Vehicle;
//   daily_operation?: DailyOperation;
//   farm_transactions?: FarmTransaction[];
//   sale_transactions?: SaleTransaction[];
// }

// VehiclePartner join table
export interface VehiclePartner {
  vehicle_id: number;
  partner_id: number;
  share_percentage: number;
  vehicle?: Vehicle;
  partner?: Partner;
}

// Request payload for creating/updating partners
export interface PartnerPayload {
  name: string;
  phone?: string;
  address?: string;
  investment_amount: number;
  investment_percentage: number;
  vehicle_shares?: {
    vehicle_id: number;
    share_percentage: number;
  }[];
}

export interface Farm {
  id: number;
  name: string;
  owner_name?: string;
  location?: string;
  phone?: string;
  created_at: string;
    current_balance: number; // Positive = Farm owes us, Negative = We owe farm, Zero = Settled
   balance_type?: 'RECEIVABLE' | 'PAYABLE' | 'SETTLED';
  isDebtor?: boolean;
  isCreditor?: boolean;
  absoluteBalance?: number;
  balance_display?: string;

  // ✅ Backward compatibility (optional, will be removed eventually)
  total_debt?: number; // Alias for current_balance (deprecated)

  absolute_balance?: number;
}
export interface FarmDebtPayment {
  payment_id: number;
  farm_id: number;
  daily_operation_id?: number;
  amount: number; // Always positive

  // ✅ NEW: Payment direction
  payment_direction: 'FROM_FARM' | 'TO_FARM';
  // FROM_FARM = Farm pays us (reduces their debt)
  // TO_FARM = We pay farm (increases their debt or reduces our debt)

  payment_date: string;
  notes?: string;

  // Relationships
  farm?: Farm;
  operation?: DailyOperation;

  // ✅ Computed properties
  signedAmount?: number; // Positive for FROM_FARM, negative for TO_FARM
  balanceImpact?: number; // How this affects farm's balance
  displayDescription?: string;


  operation_id?: number;


  payment_details: {
    amount: number;
    direction: string;
    direction_arabic: string;
    explanation: string;
    balance_impact: number;
  };

  is_standalone?: boolean;

}



export interface Buyer {
  id: number;
  name: string;
  phone?: string;
  address?: string;
  total_debt: number;
  created_at: string;
  debt_status: string;
debt_display?: string;

}

// ============================================
// BUYER DEBT PAYMENT
// ============================================
export interface BuyerDebtPayment {
   payment_id: number;
  buyer_id: number;
  daily_operation_id?: number;
  amount: number; // Always positive

  // ✅ Payment direction (always FROM_BUYER for buyers)
  payment_direction: 'FROM_BUYER';

  payment_date: string;
  notes?: string;

  // Relationships
  buyer?: Buyer;
  operation?: DailyOperation;




  operation_id: number;


  payment_details: {
    amount: number;
    explanation: string;
    balance_impact: number;
  };

  is_standalone: boolean;

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
  category_type: string;

}

export interface VehicleOperation {
  id: number;
  daily_operation_id: number;
  vehicle_id: number;
  vehicle?: Vehicle;
  sequence_number: number;
  status: 'ACTIVE' | 'COMPLETED';
  created_at: string;
  total_loaded_weight?: number;
  total_sold_weight?: number;
  total_losses?: number;


  assigned_at?: string;
  completed_at?: string;

  daily_operation?: DailyOperation;
  farm_transactions?: FarmTransaction[];
  sale_transactions?: SaleTransaction[];
}

export interface DailyOperation {
  id: number;
  operation_date: string;
  vehicles?: Vehicle[];
  vehicle_operations?: VehicleOperation[];
  user_id: number;
  status: 'OPEN' | 'CLOSED';
  notes?: string;
  created_at: string;
  closed_at?: string;
  farm_transactions?: FarmTransaction[];
  sale_transactions?: SaleTransaction[];
  transport_losses?: TransportLoss[];
  daily_costs?: DailyCost[];
  profit_distribution?: ProfitDistribution;


  user?: User;
  vehicle?: Vehicle; // Primary vehicle (deprecated)

}
export interface BalanceInfo {
  farm_id: number;
  farm_name: string;
  previous_balance: number;
  new_balance: number;
  change_amount: number;
  direction_changed: boolean;
  previous_type: 'RECEIVABLE' | 'PAYABLE' | 'SETTLED';
  new_type: 'RECEIVABLE' | 'PAYABLE' | 'SETTLED';
  absolute_balance: number;
  display_balance: string;
  alert?: string; // Present if direction changed

  // ✅ NEW: Detailed breakdown
  changes?: {
    old_balance_paid: number;
    old_balance_direction: 'FROM_FARM' | 'TO_FARM' | null;
    new_transaction_debt: number;
    net_change: number;
  };
}

export interface FarmTransaction {
  id: number;
  daily_operation_id: number;
  vehicle_id: number;
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
  vehicle_operation_id: number; // ✅ NEW: Links to specific vehicle operation
  vehicle?: Vehicle; // ✅ NEW
  vehicle_operation?: VehicleOperation; // ✅ NEW
 transaction_id: number;

  weighing: {
    empty_vehicle_weight: number;
    loaded_vehicle_weight: number;
    cage_count: number;
    cage_weight_per_unit: number;
    total_cage_weight: number;
    net_chicken_weight: number;

  };
  pricing: {
    price_per_kg: number;
    total_amount: number;
    paid_amount: number;
    remaining_amount: number;
    used_credit: number;
    total_paid_with_credit: number;
    payment_percentage: string;
  };
  debt_info: {
    status: string;
    status_details: string[];
    balance_change: number;
    breakdown: {
      cash_paid: number;
      credit_used: number;
      new_debt_created: number;
      net_balance_impact: number;
    };
    is_full_payment: boolean;
    has_remaining_debt: boolean;
    used_existing_credit: boolean;
    interpretation: string;

  };

  notes?: string;


  operation_id?: number;

}

export interface SaleTransaction {
  id: number;
  daily_operation_id: number;
  vehicle_id: number;
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

  vehicle_operation_id: number;
  // Relationships
    buyer?: Buyer;
  chicken_type?: ChickenType;
  vehicle?: Vehicle;
  vehicle_operation?: VehicleOperation;

  transaction_id: number;

  weighing: {
    loaded_cages_weight: number;
    empty_cages_weight: number;
    cage_count: number;
    net_chicken_weight: number;
  };
  pricing: {
    price_per_kg: number;
    total_amount: number;
    paid_amount: number;
    remaining_amount: number;
    old_debt_paid: number;
    payment_percentage: string;
  };
  debt_info: {
    status: string;
    buyer_debt_change: number;
    is_full_payment: boolean;
    has_remaining_debt: boolean;
    paid_old_debt: boolean;
    net_debt_impact: string;
  };
  notes?: string;


  operation_id?: number;


}
// ============================================
// BUYER BALANCE INFO
// ============================================
export interface BuyerBalanceInfo {
  buyer_id: number;
  buyer_name: string;
  previous_balance: number;
  new_balance: number;
  is_settled: boolean;

  // ✅ Detailed breakdown
  changes?: {
    old_debt_paid: number;
    new_transaction_debt: number;
    net_change: number;
  };
}

// ============================================
// SALE RESPONSE
// ============================================
export interface SaleResponse {
  success: boolean;
  message: string;
  data: {
    transaction?: SaleTransaction; // Optional for debt-only payments
    balance_info: BuyerBalanceInfo;
    debt_payment?: {
      id: number;
      amount: number;
      date: string;
      description: string;
    };
    payment?: {
      id: number;
      amount: number;
      date: string;
    };
  };
}

export interface TransportLoss {
  id: number;
  daily_operation_id: number;
  vehicle_id: number;
  chicken_type_id: number;
  dead_weight: number;
  price_per_kg: number;
  loss_amount: number;
  location?: string;
  recorded_at: string;
  chicken_type?: ChickenType;
  loss_id: number;
  vehicle: Vehicle;
  loss_details: {
    dead_weight: number;
    price_per_kg: number;
    loss_amount: number;
    location: string;
  };
  farm_responsibility: {
    is_farm_responsible: boolean;
    farm?: {
      id: number;
      name: string;
    };
    balance_impact?: {
      amount: number;
      direction: string;
      explanation: string;
      note: string;
    };
    note?: string;
  };
  notes?: string;


  operation_id?: number;

}

export interface DailyCost {
  id: number;
  daily_operation_id: number;
  vehicle_id?: number;
  cost_category_id: number;
  cost_category?: CostCategory;
  amount: number;
  description?: string;
  recorded_at: string;
    cost_id: number;
  category: CostCategory;
  vehicle?: Vehicle;
  cost_details: {
    amount: number;
    description: string;
    allocation: string;
    affects_vehicle_partners: boolean;
  };


   operation_id?: number;

}

export interface ProfitDistribution {
  id: number;
  daily_operation_id?: number;
  vehicle_summaries: VehicleProfitSummary[];
  total_revenue: number;
  total_purchases: number;
  total_losses: number;
  lossesWithFarm?: number;
  lossesWithoutFarm?: number;
  total_costs: number;
  vehicle_costs: number;
  net_profit: number;
  calculated_at: string;
  partner_profits: PartnerProfit[];

  distribution_id: number;
   totals: {
    total_revenue: number;
    total_purchases: number;
    total_losses: number;
    total_costs: number;
    vehicle_costs: number;
    net_profit: number;

  };


}

export interface VehicleProfitSummary {
  vehicle_id: number;
  vehicle?: Vehicle;
  revenue: number;
  purchases: number;
  losses: number;
  vehicle_costs: number;
  other_costs_share: number;
  net_profit: number;
}

export interface PartnerProfit {
  id: number;
  profit_distribution_id: number;
  partner_id: number;
  partner?: Partner;
  vehicle_id?: number;
  base_profit_share: number;
  vehicle_cost_share: number;
  final_profit: number;
profit_percentage: string;
  profit_breakdown: {
      base_profit_share: number;
      vehicle_cost_share: number;
      final_profit: number;
      profit_percentage: string;
    };

  operations_count?: number;

}
export interface DebtPaymentInfo {
  id: number;
  amount: number;
  direction: 'FROM_FARM' | 'TO_FARM';
  date: string;
  description: string;
  payment_id: number;
  farm?: Farm;
  buyer?: Buyer;
  payment_details: {
    amount: number;
    direction?: string;
    direction_arabic?: string;
    explanation: string;
    balance_impact: number;
  };
  payment_date: string;
  notes?: string;
  is_standalone: boolean;
}

// ============================================
// REQUEST DTOs
// ============================================


// ✅ UPDATED: Farm Loading Request
export interface FarmLoadingRequest {
  vehicle_id?: number; // Optional for debt-only payments
  farm_id: number;
  chicken_type_id?: number; // Optional for debt-only payments
  empty_vehicle_weight?: number; // Optional for debt-only payments
  loaded_vehicle_weight?: number; // Optional for debt-only payments
  cage_count?: number; // Optional for debt-only payments
  cage_weight_per_unit?: number; // Optional for debt-only payments
  price_per_kg?: number; // Optional for debt-only payments
  paid_amount?: number; // Optional for debt-only payments
  old_balance_paid?: number; // Payment toward old balance
  is_debt_payment_only?: boolean; // ✅ NEW: Flag for debt-only transactions
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
  vehicle_id?: number;
  is_debt_payment_only?: boolean; // ✅ NEW: Flag for debt-only transactions
}

export interface TransportLossRequest {
  chicken_type_id: number;
  dead_weight: number;
  price_per_kg: number;
  location?: string;
  vehicle_id?: number;
}

export interface DailyCostRequest {
  vehicle_id?: number;
  cost_category_id: number;
  amount: number;
  description?: string;
}

export interface DailyReport {
  operation_id: string;
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
  vehicle_count: number;
  vehicles: Vehicle[];
  vehicle_breakdown: any[];
  status: 'OPEN' | 'CLOSED';
  profit_distribution: ProfitDistribution; // ✅ أضف هذا

}
export interface ReportResponse{
operation_date:string;
operations:DailyReport[];
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


export interface FarmPaymentRequest {
  farm_id: number;
  amount: number;
  payment_direction: 'FROM_FARM' | 'TO_FARM';
  payment_date: string;
  daily_operation_id?: number;
  notes?: string;
}

export interface StartDayRequest {
  operation_date: string;
  vehicle_ids: number[]; // ✅ Multiple vehicles
}

// / ============================================
// API RESPONSE WRAPPERS
// ============================================
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  error?: string;

}

export interface FarmLoadingResponse {
  success: boolean;
  message: string;
  data: {
    transaction?: FarmTransaction; // Optional for debt-only payments
    balance_info: BalanceInfo;
    debt_payment?: DebtPaymentInfo; // Present if old_balance_paid > 0
    payment?: DebtPaymentInfo; // Present for debt-only transactions
  };
}

export interface FarmPaymentResponse {
  success: boolean;
  message: string;
  data: {
    payment: FarmDebtPayment;
    balance_info: BalanceInfo;
  };
}

export interface PaymentHistoryResponse {
  success: boolean;
  data: {
    summary: {
      total_received: number;
      total_paid: number;
      net_received: number;
      received_count: number;
      paid_count: number;
      total_transactions: number;
    };
    payments: FarmDebtPayment[];
    pagination: {
      limit: number;
      offset: number;
      total: number;
    };
  };
}


export interface VehicleBreakdown {
  vehicle_id: number;
  vehicle_name: string;
  purchases: number;
  revenue: number;
  losses: number;
 lossesWithFarm: number;
    lossesWithoutFarm: number;

  vehicle_costs: number;
  other_costs: number;
  net_profit: number;
}

export interface OperationSummary {
  operation_info: {
    operation_id?: number[];
    operations_count?: number;
    operation_date: string;
    status: string;

    users?:User[];
    vehicles_count: number;
    vehicles: Vehicle[];
    created_at: string;
    closed_at?: string;

  };
  financial_summary: {
    total_purchases: number;
    total_revenue: number;
    total_losses: number;
    lossesWithFarm: number;
    lossesWithoutFarm: number;
    total_costs: number;
    vehicle_costs: number;
    other_costs: number;
    net_profit: number;
    profit_margin_percentage: string;
  };
  transactions_summary: {
    farm_transactions: {
      count: number;
      total_weight: number;
      total_amount: number;
      total_paid: number;
      total_remaining: number;

    };
    sale_transactions: {
      count: number;
      total_weight: number;
      total_amount: number;
      total_paid: number;
      total_remaining: number;
      total_old_debt_collected: number;
    };
    losses: {
      count: number;
      total_weight: number;
      total_amount: number;

    };
    costs: {
      count: number;
      total_amount: number;
      vehicle_costs_total: number;
      other_costs_total: number;

    };

  };
  vehicle_breakdown: VehicleBreakdown[];

}

export interface EnhancedDailyReport {
  summary: OperationSummary;
  detailed_transactions: {
    farm_loading: {
      transactions: FarmTransaction[];
      summary: {
        count: number;
        total_weight: number;
        total_amount: number;
        total_paid: number;
        total_remaining: number;
      };
    };
    sales: {
      transactions: SaleTransaction[];
      summary: {
        count: number;
        total_weight: number;
        total_amount: number;
        total_paid: number;
        total_remaining: number;
        total_old_debt_collected: number;
      };
    };
    losses: {
      records: TransportLoss[];
      summary: {
        count: number;
        total_weight: number;
        total_amount: number;
      };
    };
    costs: {
      records: DailyCost[];
      by_category: Record<string, CostByCategory>;
      summary: {
        count: number;
        total_amount: number;
        vehicle_costs_total: number;
        other_costs_total: number;
      };
    };
  };
  debt_movements: {
    farm_payments: DebtPayment[];
    buyer_payments: DebtPayment[];
  };
  profit_distribution?: ProfitDistribution;


}
interface DebtPayment {
  payment_id: number;
  farm?: Farm;
  buyer?: Buyer;
  payment_details: {
    amount: number;
    direction?: string;
    direction_arabic?: string;
    explanation: string;
    balance_impact: number;
  };
  payment_date: string;
  notes?: string;
  is_standalone: boolean;

}

export interface ApiResponseReprt {
  success: boolean;
  data: {
    report_date: string;
    operations_count: number;
    report_generated_at: string;
    operation: EnhancedDailyReport;

  };
  message?: string;
}


export interface CostByCategory {
  category_info: {
    id: number;
    name: string;
    description?: string;
    is_vehicle_cost: boolean;
    category_type: string;
  };
  costs: DailyCost[];
  total_amount: number;
  count: number;

}

// =========================
// Period Report API Interfaces
// Strictly typed based on backend response
// =========================

export interface PeriodReportResponse {
  success: boolean;
  report_type: 'PERIOD_SUMMARY';
  generated_at: string;
  period: PeriodInfo;
  executive_summary: ExecutiveSummary;
  revenue_breakdown: RevenueBreakdown;
  cost_breakdown: CostBreakdown;
  vehicle_performance: VehiclePerformance;
  debt_position: DebtPosition;
  operational_metrics: OperationalMetrics;
  highlights_and_alerts: HighlightsAndAlerts;
  period_comparison: PeriodComparison;
  drill_down_links: DrillDownLinks;
}

// =========================
// PERIOD INFO
// =========================
export interface PeriodInfo {
  start_date: string;
  end_date: string;
  duration_days: number;
  operating_days: number;
  total_operations: number;
  vehicles_used: number;
  period_label: string;

}

// =========================
// EXECUTIVE SUMMARY
// =========================
export interface ExecutiveSummary {
  financial: FinancialSummary;
  operational: OperationalSummary;
}

export interface FinancialSummary {
  total_revenue: number;
  total_costs: number;
  net_profit: number;
  profit_margin_percentage: number;
   lossesWithFarm: number;
    lossesWithoutFarm: number;
  avg_daily_profit: number;
  trend_vs_previous: TrendComparison;
}

export interface OperationalSummary {
  total_operations: number;
  vehicles_used: number;
  total_volume_kg: number;
  avg_price_per_kg: number;
  loss_percentage: number;
  total_transactions: number;
}

export interface TrendComparison {
  has_comparison: boolean;
  revenue_change?: number;
  revenue_change_pct?: number;
  profit_change?: number;
  profit_change_pct?: number;
  direction?: 'IMPROVING' | 'DECLINING' | 'STABLE';
  previous_period_revenue?: number;
  previous_period_profit?: number;
  message?: string;
  error?: string;
}

// =========================
// REVENUE BREAKDOWN
// =========================
export interface RevenueBreakdown {
  total_sales: number;
  total_volume_kg: number;
  avg_sale_price_per_kg: number;
  buyers_served: number;
  by_chicken_type: ChickenTypeRevenue[];
}

export interface ChickenTypeRevenue {
  chicken_type_id: number;
  chicken_type_name: string;
  total_revenue: number;
  total_volume_kg: number;
  percentage_of_revenue: number;
  transaction_count: number;
}

// =========================
// COST BREAKDOWN
// =========================
export interface CostBreakdown {
  total_costs: number;
  components: CostComponents;
  cost_per_kg: number;
  top_cost_categories: CostCategory[];
}

export interface CostComponents {
  purchases: number;
  vehicle_costs: number;
  operating_costs: number;
  losses: number;
}

export interface CostCategory {
  category_id?: number;
  category_name: string;
  amount: number;
  percentage: number;
  is_vehicle_cost: boolean;
}

// =========================
// VEHICLE PERFORMANCE
// =========================
export interface VehiclePerformance {
  summary: VehiclePerformanceSummary;
  vehicles: VehicleMetrics[];
}

export interface VehiclePerformanceSummary {
  total_vehicles: number;
  most_profitable_vehicle_id: number | null;
  least_profitable_vehicle_id: number | null;
  profit_variance_high_to_low: number;
}

export interface VehicleMetrics {
  vehicle_id: number;
  vehicle_name: string;
  plate_number: string;
  days_operated: number;
  total_revenue: number;
  total_purchases: number;
  total_costs: number;
  total_losses: number;
  vehicle_costs: number;
  net_profit: number;
  profit_margin_pct: number;
  avg_daily_profit: number;
  performance_rating: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'NEEDS_IMPROVEMENT';
  rank: number;
}

// =========================
// DEBT POSITION
// =========================
export interface DebtPosition {
  farms: FarmDebtPosition;
  buyers: BuyerDebtPosition;
  summary: DebtSummary;
}

export interface FarmDebtPosition {
  total_receivables: number;
  total_payables: number;
  net_position: number;
  position_type: 'NET_RECEIVABLE' | 'NET_PAYABLE' | 'BALANCED';
  farms_with_balance: number;
  largest_debtor: LargestDebtor | null;
}

export interface BuyerDebtPosition {
  total_outstanding: number;
  buyers_with_debt: number;
  largest_debtor: LargestDebtor | null;
}

export interface LargestDebtor {
  farm_id?: number;
  farm_name?: string;
  buyer_id?: number;
  buyer_name?: string;
  amount_owed: number;
}

export interface DebtSummary {
  total_receivables: number;
  total_payables: number;
  net_working_capital: number;
}

// =========================
// OPERATIONAL METRICS
// =========================
export interface OperationalMetrics {
  volume_metrics: VolumeMetrics;
  pricing_metrics: PricingMetrics;
  efficiency_metrics: EfficiencyMetrics;
}

export interface VolumeMetrics {
  total_purchased_kg: number;
  total_sold_kg: number;
  total_lost_kg: number;
  loss_percentage: number;
}

export interface PricingMetrics {
  avg_purchase_price_per_kg: number;
  avg_sale_price_per_kg: number;
  gross_margin_per_kg: number;
  gross_margin_percentage: number;
}

export interface EfficiencyMetrics {
  farms_engaged: number;
  buyers_engaged: number;
  avg_transaction_size_kg: number;
}

// =========================
// HIGHLIGHTS & ALERTS
// =========================
export interface HighlightsAndAlerts {
  top_performers: TopPerformers;
  concerns: Concerns;
  alerts: Alert[];
}

export interface TopPerformers {
  best_profit_day: BestDay | null;
  best_margin_day: BestDay | null;
}

export interface BestDay {
  date: string;
  net_profit: number;
  operations?: number;
}

export interface Concerns {
  worst_profit_day: WorstDay | null;
  highest_loss_event: HighestLossEvent | null;
}

export interface WorstDay {
  date: string;
  net_profit: number;
}

export interface HighestLossEvent {
  date: string;
  loss_amount: number;
  dead_weight_kg: number;
}

export interface Alert {
  type: 'LOSS_RATE_HIGH' | 'FARM_PAYABLE_HIGH' | 'BUYER_DEBT_HIGH';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  message: string;
  action_required: string;
  vehicle_id?: number;
  farm_id?: number;
  buyer_id?: number;
  loss_rate?: number;
  amount?: number;
}

// =========================
// PERIOD COMPARISON
// =========================
export interface PeriodComparison {
  has_comparison: boolean;
  previous_period?: PreviousPeriod;
  changes?: PeriodChanges;
  message?: string;
  error?: string;
}

export interface PreviousPeriod {
  start_date: string;
  end_date: string;
  revenue: number;
  profit: number;
  operating_days: number;
}

export interface PeriodChanges {
  revenue_change: number;
  revenue_change_pct: number;
  profit_change: number;
  profit_change_pct: number;
  margin_change_pct: number;
  overall_trend: 'IMPROVING' | 'DECLINING' | 'STABLE';
}

// =========================
// DRILL DOWN LINKS
// =========================
export interface DrillDownLinks {
  daily_operations: string;
  vehicle_details: string;
  farm_balances: string;
  buyer_balances: string;
  partner_profits: string;
}

// =========================
// HELPER TYPES
// =========================
export interface DateRange {
  from: string;
  to: string;
}

export type PerformanceRating = 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'NEEDS_IMPROVEMENT';
export type AlertSeverity = 'HIGH' | 'MEDIUM' | 'LOW';
export type TrendDirection = 'IMPROVING' | 'DECLINING' | 'STABLE';
//  سضضضضضضضضضضضضضضضضضضضضضضضضضضضضضضضضضضضضض


// ============================================
// SECTION 1: PROFIT COMPOSITION
// ============================================
export interface ProfitComponent {
  amount: number;
  percentage: number;
  description: string;
  calculation: string;
}

export interface VolatilityAnalysis {
  most_volatile_component: string;
  volatility_score: number;
  explanation: string;
  stability_ranking: string[];
}

export interface ProfitComposition {
  description: string;
  total_net_profit: number;
  components: {
    trading_margin_profit: ProfitComponent;
    volume_leverage_profit: ProfitComponent;
    loss_erosion: ProfitComponent;
    cost_efficiency_impact: ProfitComponent;
  };
  volatility_analysis: VolatilityAnalysis;
  key_insight: string;
}

// ============================================
// SECTION 2: PROFIT PER KG
// ============================================
export interface ProfitPerKgCurrent {
  net_profit_per_sold_kg: number;
  net_profit_per_purchased_kg: number;
  gross_margin_per_kg: number;
  loss_erosion_per_kg: number;
  cost_burden_per_kg: number;
}

export interface PreviousPeriodComparison {
  previous_profit_per_kg: number;
  net_profit_per_sold_kg_change: number;
  net_profit_per_sold_kg_change_pct: number;
  trend: 'IMPROVING' | 'DECLINING' | 'STABLE' | 'NO_COMPARISON';
  explanation: string;
}

export interface BreakdownPerKg {
  sale_price_per_kg: number;
  purchase_price_per_kg: number;
  raw_margin_per_kg: number;
  loss_deduction_per_kg: number;
  cost_deduction_per_kg: number;
  final_profit_per_kg: number;
}

export interface TargetVsActual {
  target_profit_per_kg: number;
  actual_profit_per_kg: number;
  gap: number;
  gap_percentage: number;
  required_improvement: string;
}

export interface ScenarioAnalysis {
  new_profit_per_kg: number;
  profit_increase_pct: number;
}

export interface SensitivityAnalysis {
  if_purchase_price_drops_1_egp: ScenarioAnalysis;
  if_sale_price_increases_1_egp: ScenarioAnalysis;
  if_losses_reduce_50_percent: ScenarioAnalysis;
}

export interface ProfitPerKgAnalysis {
  description: string;
  current_period: ProfitPerKgCurrent;
  previous_period_comparison: PreviousPeriodComparison;
  breakdown_per_kg: BreakdownPerKg;
  target_vs_actual: TargetVsActual;
  sensitivity_analysis: SensitivityAnalysis;
  key_insight: string;
}

// ============================================
// SECTION 3: PROFIT LEAKAGE
// ============================================
export interface AffectedFarm {
  farm_id: number;
  farm_name: string;
  purchases_volume_kg: number;
  purchase_price_avg: number;
  market_avg_price: number;
  excess_paid_per_kg: number;
  total_leakage: number;
  explanation: string;
}

export interface AffectedBuyer {
  buyer_id: number;
  buyer_name: string;
  sales_volume_kg: number;
  sale_price_avg: number;
  market_avg_price: number;
  shortfall_per_kg: number;
  total_leakage: number;
  explanation: string;
}

export interface HighLossDay {
  operation_id: number;
  date: string;
  loss_rate: number;
  excess_loss: number;
}

export interface LeakageSource {
  source: 'HIGH_LOSS_DAYS' | 'LOW_MARGIN_FARMS' | 'WEAK_SALE_PRICES' | 'UNPAID_AMOUNTS_COSTING_OPPORTUNITY';
  leakage_amount: number;
  affected_days?: number;
  average_loss_on_these_days_pct?: number;
  normal_loss_rate_pct?: number;
  affected_vehicles?: number[];
  affected_farms?: AffectedFarm[];
  affected_buyers?: AffectedBuyer[];
  total_receivables?: number;
  opportunity_cost_rate?: number;
  explanation: string;
  action: string;
}

export interface QuickWin {
  action: string;
  estimated_monthly_savings: number;
  difficulty: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface ProfitLeakageDetection {
  description: string;
  total_identified_leakage: number;
  leakage_as_percent_of_potential_profit: number;
  leakage_sources: LeakageSource[];
  quick_wins: QuickWin[];
}

// ============================================
// SECTION 4: STABILITY & RISK
// ============================================
export interface DailyProfitVolatility {
  mean_daily_profit: number;
  standard_deviation: number;
  coefficient_of_variation: number;
  interpretation: string;
  volatility_rating: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface ProfitBand {
  count: number;
  percentage: number;
  avg_profit: number;
}

export interface ProfitDistributionBands {
  excellent_days_gt_7000: ProfitBand;
  good_days_5000_to_7000: ProfitBand;
  weak_days_3000_to_5000: ProfitBand;
  poor_days_lt_3000: ProfitBand;
}

export interface ConcentrationRisk {
  top_vehicle_profit_share_pct?: number;
  top_2_vehicles_profit_share_pct?: number;
  top_buyer_revenue_share_pct?: number;
  top_3_buyers_revenue_share_pct?: number;
  top_farm_purchase_share_pct?: number;
  top_3_farms_purchase_share_pct?: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  explanation?: string;
}

export interface DependencyRisks {
  vehicle_concentration: ConcentrationRisk;
  buyer_concentration: ConcentrationRisk;
  farm_concentration: ConcentrationRisk;
}

export interface LossScenario {
  loss_rate_pct: number;
  profit_impact: number;
  new_net_profit: number;
}

export interface LossSensitivity {
  current_loss_rate_pct: number;
  profit_impact_per_1pct_loss_increase: number;
  example_scenarios: LossScenario[];
  key_insight: string;
}

export interface ProfitStabilityAndRisk {
  description: string;
  daily_profit_volatility: DailyProfitVolatility;
  profit_distribution_bands: ProfitDistributionBands;
  dependency_risks: DependencyRisks;
  loss_sensitivity: LossSensitivity;
}

// ============================================
// SECTION 5: EFFICIENCY INDICATORS
// ============================================
export interface OperationPerformance {
  operation_id: number;
  date: string;
  profit: number;
}

export interface ProfitPerOperation {
  average: number;
  best_operation: OperationPerformance | null;
  worst_operation: OperationPerformance | null;
  efficiency_gap: number;
  explanation: string;
}

export interface VehiclePerformance {
  vehicle_id: number;
  vehicle_name: string;
  avg_profit_per_day: number;
}

export interface ProfitPerVehicleDay {
  average: number;
  top_vehicle: VehiclePerformance | null;
  lowest_vehicle: VehiclePerformance | null;
  efficiency_gap_pct: number;
  explanation: string;
}

export interface TransactionEfficiency {
  count: number;
  avg_profit_contribution?: number;
  avg_profit_realized?: number;
}

export interface ProfitPerTransaction {
  farm_transactions: TransactionEfficiency;
  sale_transactions: TransactionEfficiency;
  efficiency_ratio: number;
  explanation: string;
}

export interface TopEntity {
  farm_id?: number;
  farm_name?: string;
  buyer_id?: number;
  buyer_name?: string;
  volume_kg?: number;
  revenue?: number;
}

export interface ProfitPerEngagedFarm {
  unique_farms: number;
  total_profit: number;
  profit_per_farm: number;
  top_profit_farm: TopEntity | null;
  explanation: string;
}

export interface ProfitPerBuyer {
  unique_buyers: number;
  profit_per_buyer: number;
  top_profit_buyer: TopEntity | null;
}

export interface ReturnOnCosts {
  total_costs: number;
  net_profit: number;
  roi_percentage: number;
  explanation: string;
}

export interface ProfitEfficiencyIndicators {
  description: string;
  profit_per_operation: ProfitPerOperation;
  profit_per_vehicle_day: ProfitPerVehicleDay;
  profit_per_transaction: ProfitPerTransaction;
  profit_per_engaged_farm: ProfitPerEngagedFarm;
  profit_per_buyer: ProfitPerBuyer;
  return_on_costs: ReturnOnCosts;
}

// ============================================
// SECTION 6: RECOMMENDATIONS
// ============================================
export interface ProfitRecommendation {
  id: number;
  category: 'PRICING' | 'LOSS_REDUCTION' | 'WORKING_CAPITAL' | 'OPERATIONAL' | 'VOLUME' | 'EFFICIENCY';
  problem: string;
  profit_impact_monthly: number;
  action: string;
  implementation_difficulty: 'LOW' | 'MEDIUM' | 'HIGH';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  expected_result: string;
}

export interface RecommendationsSummary {
  total_potential_monthly_profit_increase: number;
  total_potential_annual_profit_increase: number;
  high_priority_count: number;
  medium_priority_count: number;
  low_priority_count: number;
  quick_wins_under_30_days: number;
}

export interface ActionableProfitRecommendations {
  description: string;
  recommendations: ProfitRecommendation[];
  summary: RecommendationsSummary;
}

// ============================================
// EXECUTIVE SUMMARY
// ============================================
export interface ExecutiveSummaryProfit {
  current_profit_health: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  key_strengths: string[];
  key_weaknesses: string[];
  top_3_actions: string[];
  potential_profit_increase: string;
}

// ============================================
// FULL PROFIT ANALYSIS REPORT
// ============================================
export interface ProfitAnalysisReport {
  report_type: 'PROFIT_ANALYSIS';
  generated_at: string;
  period: PeriodInfo;
  '1_profit_composition_analysis': ProfitComposition;
  '2_profit_per_kg_analysis': ProfitPerKgAnalysis;
  '3_profit_leakage_detection': ProfitLeakageDetection;
  '4_profit_stability_and_risk': ProfitStabilityAndRisk;
  '5_profit_efficiency_indicators': ProfitEfficiencyIndicators;
  '6_actionable_profit_recommendations': ActionableProfitRecommendations;
  executive_summary: ExecutiveSummaryProfit;
}

// ============================================
// PROFIT SUMMARY (LIGHTWEIGHT)
// ============================================
export interface ProfitSummaryReport {
  period: PeriodInfo;
  executive_summary: ExecutiveSummaryProfit;
  profit_health: number;
  profit_per_kg: number;
  total_leakage: number;
  top_recommendations: ProfitRecommendation[];
}

// ============================================
// PROFIT LEAKAGE ONLY
// ============================================
export interface ProfitLeakageReport {
  period: PeriodInfo;
  leakage_analysis: ProfitLeakageDetection;
}

// ============================================
// TYPE ALIASES FOR CONVENIENCE
// ============================================
export type ProfitAnalysisResponse = ApiResponse<ProfitAnalysisReport>;
export type ProfitSummaryResponse = ApiResponse<ProfitSummaryReport>;
export type ProfitLeakageResponse = ApiResponse<ProfitLeakageReport>;

export interface ProfitDistributionResponse {
  success: boolean;
  data?: any;
  message?: string;
}

export interface PartnerProfitSummary {
  partner_id: number;
  partner_name: string;
  investment_amount: number;
  investment_percentage: number;
  total_base_profit_share: number;
  total_vehicle_cost_deduction: number;
  total_final_profit: number;
  days_as_vehicle_partner: number;
  days_as_non_vehicle_partner: number;
  total_days: number;
  vehicles_owned: number[];
  vehicles_owned_count: number;
  avg_daily_profit: number;
  avg_vehicle_cost_deduction: number;
  vehicle_participation_rate: number;
  profit_vs_investment_ratio: number;
  performance_rating: string;
  daily_breakdown: DailyProfitDetail[];
  details?: IndividualPartnerProfit;

}

export interface DailyProfitDetail {
  date: string;
  operation_id: number;
  base_share: number;
  vehicle_cost_deduction: number;
  final_profit: number;
  is_vehicle_partner: boolean;
  owned_vehicles: VehicleInfo[];
  operation_net_profit: number;

}

export interface VehicleInfo {
  vehicle_id: number;
  vehicle_name: string;
  share_percentage?: number;
}

export interface IndividualPartnerProfit {
  partner_info: {
    id: number;
    name: string;
    investment_amount: number;
    investment_percentage: number;
    vehicles_owned: VehicleInfo[];
  };
  period: {
    start_date: string;
    end_date: string;
    total_operations: number;
  };
  summary: {
    total_base_profit_share: number;
    total_vehicle_cost_deduction: number;
    total_final_profit: number;
    avg_daily_profit: number;
    days_as_vehicle_partner: number;
    days_as_non_vehicle_partner: number;
    vehicle_participation_rate: number;
    vehicles_participated: number;
    roi: number;
  };
  daily_details: DailyProfitDetail[];
  insights: Insight[];
}

export interface Insight {
  type: string;
  message: string;
}

export interface DistributionSummary {
  period: {
    start_date: string;
    end_date: string;
    total_operations: number;
  };
  overview: {
    total_partners: number;
    total_profit_distributed: number;
    total_operations: number;
  };
  top_earners: TopEarner[];
  vehicle_vs_non_vehicle: {
    partners_with_vehicles: number;
    partners_without_vehicles: number;
    avg_profit_vehicle_partners: number;
    avg_profit_non_vehicle_partners: number;
  };
  roi_analysis: {
    highest_roi: {
      partner_name: string;
      roi: number;
    };
    average_roi: number;
  };
}

export interface TopEarner {
  partner_name: string;
  total_profit: number;
  percentage_of_total: number;
}
export interface FarmDebtSummary {
  total_receivables: number;
  total_payables: number;
  net_position: number;
  receivables_count: number;
  payables_count: number;
}


export interface FarmBalancesResponse {
  success: boolean;
  data: {
    summary: FarmDebtSummary;
    receivables: {
      farms: Farm[];
    };
    payables: {
      farms: Farm[];
    };
  };
}



export interface BuyerDebtsResponse {
  success: boolean;
  data: {
    total_debt: number;
    buyers_count: number;
    buyers: Buyer[];
  };
}

export interface StatementTransaction {
  date: string;
  type: 'PURCHASE' | 'SALE' | 'PAYMENT' | 'RECEIPT';
  description: string;
  amount: number;
  paid_now: number;
  balance_change: number;
  running_balance: number;
}

export interface FarmStatementSummary {
  opening_balance: number;
  total_purchases: number;
  total_payments: number;
  closing_balance: number;
   total_sales: number;
}

export interface FarmStatementResponse {
  success: boolean;
  data: {
    farm: Farm;
    summary: FarmStatementSummary;
    statement: StatementTransaction[];
  };
}

export interface BuyerStatementSummary {
  opening_balance: number;
  total_sales: number;
  total_payments: number;
  closing_balance: number;
  total_purchases: number;

}

export interface BuyerStatementResponse {
  success: boolean;
  data: {
    buyer: Buyer;
    summary: BuyerStatementSummary;
    statement: StatementTransaction[];
  };
}



export interface StatementDialogData {
  entityType: 'farm' | 'buyer';
  entityId: number;
  entityName: string;
  currentBalance: number;
}




export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      total_pages: number;
    };
  };
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  is_active?: boolean;
  has_debt?: string;
  type_cost?: string;
}




export interface User {
  id: number;
  username: string;
  full_name: string;
  email?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
  permissions?: Permission[];

}

export interface CreateUserRequest {
  username: string;
  password: string;
  full_name: string;
  email?: string;
  phone?: string;
  is_active?: boolean;
  permission_ids?: number[];
}

export interface UpdateUserRequest {
  username?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  is_active?: boolean;
}

export interface UpdateProfileRequest {
  full_name?: string;
  email?: string;
  phone?: string;
  current_password?: string;
  new_password?: string;
}



export interface Permission {
  id: number;
  key: string;
  name: string;
  description?: string;
  category: PermissionCategory;
  is_active: boolean;
  created_at?: string;
}

export type PermissionCategory =
  | 'USERS'
  | 'PARTNERS'
  | 'FARMS'
  | 'BUYERS'
  | 'VEHICLES'
  | 'OPERATIONS'
  | 'REPORTS'
  | 'CHICKEN_TYPES'
  | 'COST_CATEGORIES';

export interface CreatePermissionRequest {
  key: string;
  name: string;
  description?: string;
  category: PermissionCategory;
  is_active?: boolean;
}

export interface UpdatePermissionRequest {
  key?: string;
  name?: string;
  description?: string;
  category?: PermissionCategory;
  is_active?: boolean;
}

export interface GroupedPermissions {
  [category: string]: Permission[];
}
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    user: User;
  };
  message?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  permissions: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
}




/**
 * Backup status enum
 */
export type BackupStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

/**
 * Restore strategy enum
 */
export type RestoreStrategy = 'replace' | 'append';

/**
 * Backup entity interface matching backend response
 */
export interface Backup {
  id: number;
  filename: string;
  date: string; // ISO 8601 format
  fileSize: number; // bytes
  fileSizeMB: string;
  status: BackupStatus;
  downloadUrl: string;
}

/**
 * Response from GET /api/backup/list
 */
export interface BackupListResponse {
  success: boolean;
  count: number;
  data: Backup[];
}

/**
 * Response from POST /api/backup (create backup)
 */
export interface CreateBackupResponse {
  success: boolean;
  message: string;
  data: {
    backupId: number;
    filename: string;
    fileSize: number;
    fileSizeMB: string;
    tableCount: number;
    duration: string;
    downloadUrl: string;
  };
}

/**
 * Response from POST /api/backup/restore
 */
export interface RestoreBackupResponse {
  success: boolean;
  message: string;
  data: {
    strategy: string;
    duration: string;
    tablesProcessed: number;
    totalInserted: number;
    totalUpdated: number;
    totalErrors: number;
  };
}

/**
 * API Error response interface
 */
export interface ApiError {
  success: false;
  message: string;
  error?: string;
  statusCode?: number;
}

