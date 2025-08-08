export interface RegisterValue {
  no: number;
  value: number;
}

export interface RegisterMessage {
  type: string;
  ip_address: string;
  values: RegisterValue[];
}
