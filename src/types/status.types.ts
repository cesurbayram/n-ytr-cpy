// src/types/status.types.ts
export interface StatusValue {
  teach?: "TEACH" | "PLAY" | "REMOTE";
  servo?: boolean;
  operating?: boolean;
  cycle?: "CYCLE" | "STEP" | "AUTO";
  hold?: boolean;
  alarm?: boolean;
  error?: boolean;
  stop?: boolean;
  door_opened?: boolean;
  c_backup?: boolean;
}

export interface StatusMessage {
  ip_address: string;
  values: StatusValue;
}
