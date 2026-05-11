import { PaymentMethod } from "./safe.model";

export type LossSource = 'TRANSPORT' | 'SALE' | 'GENERAL';

export interface Loss {
  id: number;
  chicken_type_id: number;
  dead_weight: number;
  price_per_kg: number;
  loss_amount: number;
  source: LossSource;
  notes?: string;
  safe_id?: number;
  payment_method?: PaymentMethod;
  recorded_at: string;
}

export interface CreateLossDto {
  chicken_type_id: number;
  dead_weight: number;
  price_per_kg: number;
  reason?: string;
  safe_id?: number;
  payment_method?: PaymentMethod;
  notes?: string;
  daily_operation_id?: number;
}
