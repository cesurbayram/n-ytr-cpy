// src/types/utilization.types.ts
export interface UtilizationValue {
  control_power_time: number;
  servo_power_time: number;
  playback_time: number;
  moving_time: number;
  operating_time?: number;
}

export interface UtilizationMessage {
  ip_address: string;
  values: UtilizationValue[];
}
