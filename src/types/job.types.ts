// src/types/job.types.ts
export interface JobValue {
  job_name: string;
  current_line: number;
  job_content: string;
}

export interface JobMessage {
  type: string;
  ip_address: string;
  values: JobValue[];
}
