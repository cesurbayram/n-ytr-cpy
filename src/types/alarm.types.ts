// src/types/alarm.types.ts
export interface AlarmValue {
  code: string;
  alarm?: string;
  type?: string;
  text?: string;
  name?: string;
  origin_date: string;
  mode?: string;
  is_active: boolean;
}

export interface AlarmMessage {
  type: string;
  ip_address: string;
  values: AlarmValue[];
}
