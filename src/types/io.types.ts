// src/types/io.types.ts
export interface IOValue {
  byteNumber: number;
  bits: boolean[];
}

export interface IOMessage {
  ip_address: string;
  values: IOValue[];
}
