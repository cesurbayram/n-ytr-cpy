export interface AbsodataValue {
  S: number;
  L: number;
  U: number;
  R: number;
  B: number;
  T: number;
}

export interface AbsodataMessage {
  ip_address: string;
  values: AbsodataValue[];
}
