// src/types/backup.types.ts

export interface BackupStatusValue {
  c_backup?: boolean;
}

export interface BackupFileValue {
  FileName: string;
  Status: boolean;
}

export interface BackupStatusMessage {
  ip_address: string;
  values: BackupStatusValue;
}

export interface BackupFileMessage {
  ip_address: string;
  values: BackupFileValue;
}

export type BackupMessage = BackupStatusMessage | BackupFileMessage;
