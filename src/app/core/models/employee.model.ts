export interface Employee {
  id: number;
  name: string;
  phone?: string;
  national_id?: string;
  role?: string;
  is_active: boolean;
  created_at: string;
}

export interface CreateEmployeeDto {
  name: string;
  phone?: string;
  national_id?: string;
  role?: string;
}
