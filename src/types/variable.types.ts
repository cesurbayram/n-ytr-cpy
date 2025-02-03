// src/types/variable.types.ts
export interface Value {
  name: string;
  no: number;
  value: number;
}

export interface Message {
  type: string;
  ip_address: string;
  values: Value[];
}
