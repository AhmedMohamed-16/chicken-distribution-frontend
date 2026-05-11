import { PersonType } from "./person.model";
import { PaymentMethod } from "./safe.model";

export interface PaymentMetadata {
  payment_method: PaymentMethod;
  safe_id?: number;
  paid_by_person_type?: PersonType;
  paid_by_person_id?: number;
  received_by_person_type?: PersonType;
  received_by_person_id?: number;
}
