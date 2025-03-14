// src/types/tork.types.ts
export interface TorkValue {
  S: number;
  L: number;
  U: number;
  R: number;
  B: number;
  T: number;
}

export interface TorkMessage {
  ip_address: string;
  values: TorkValue[];
}
