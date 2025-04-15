export interface TorkExamSignalValue {
  bitNumber: number;
  isActive: boolean;
}

export interface TorkExamDataValue {
  S: number;
  L: number;
  U: number;
  R: number;
  B: number;
  T: number;
  B1: number;
  S1: number;
  S2: number;
}

export interface TorkExamJobValue {
  job_name: string;
  current_line: number;
  job_content: string;
}

export interface TorkExamJobListValue {
  jobList: string[];
}

export interface TorkExamInitValue {
  duration: number;
  jobName?: string;
}

export interface TorkExamJobSelectValue {
  JobName: string;
}

export interface TorkExamMessage {
  type: "torkExam";
  data: {
    type: "ioBit" | "tork" | "job" | "jobList" | "Init" | "JobSelect";
    ip_address: string;
    values: any[];
  };
}
