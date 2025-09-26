// General Data Types 
export interface GeneralValue {
  generalNo: string;
  value: string | number | boolean;
}

export interface GeneralMessage {
  type: string;
  ip_address: string;
  values: GeneralValue[];
}