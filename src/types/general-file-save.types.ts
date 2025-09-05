// General File Save Types
export interface GeneralFileSaveData {
  ip_address: string;
  values: {
    FileName: string;
    Status: boolean;
  };
}

export interface GeneralFileSaveResult {
  success: boolean;
  message?: string;
  data?: {
    id: string;
    controller_id: string;
    ip_address: string;
    fileName: string;
    status: boolean;
    timestamp: string;
  };
  error?: string;
}
