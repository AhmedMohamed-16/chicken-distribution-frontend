import { PaymentMethod } from "./safe.model";
import { PersonType } from "./person.model";

export type CustodyStatus = 'OPEN' | 'PARTIAL' | 'RECONCILED' | 'CLOSED';

export interface Custody {
  id: number;
  given_to_person_type: PersonType;
  given_to_person_id: number;
  amount: number;
  custody_date: string;
  returned_amount: number;
  status: CustodyStatus;
  description?: string;
  payment_method: PaymentMethod;
  safe_id?: number;
}
