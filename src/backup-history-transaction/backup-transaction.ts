import dbPool from "../utils/db-util";
import ControllerIdCache from "../utils/services/controller-cache";
import {
  BackupMessage,
  BackupStatusMessage,
  BackupFileMessage,
} from "../types/backup.types";

const activeBackupSessions = new Map<string, string>();

const backupTransaction = async (data: BackupMessage) => {
  try {
    console.log("Backup transaction received:", data);

    if ("c_backup" in data.values) {
      await handleBackupStatus(data as BackupStatusMessage);
    } else if ("FileName" in data.values && "Status" in data.values) {
      await handleBackupFileData(data as BackupFileMessage);
    }
  } catch (error) {
    console.error("Error in backup transaction:", error);
  }
};

const handleBackupStatus = async (data: BackupStatusMessage) => {
  try {
    const ipAddress = data.ip_address;
    const isBackupActive = data.values.c_backup;

    if (isBackupActive === true) {
      await startBackupSession(ipAddress);
    } else if (isBackupActive === false) {
      await endBackupSession(ipAddress);
    }
  } catch (error) {
    console.error("Error handling backup status:", error);
  }
};

const handleBackupFileData = async (data: BackupFileMessage) => {
  try {
    const ipAddress = data.ip_address;
    const fileName = data.values.FileName;
    const status = data.values.Status;

    const sessionId = activeBackupSessions.get(ipAddress);
    if (!sessionId) {
      console.warn(`No active backup session for IP: ${ipAddress}`);
      return;
    }

    await recordBackupFile(sessionId, fileName, status);
  } catch (error) {
    console.error("Error handling backup file data:", error);
  }
};

const startBackupSession = async (ipAddress: string) => {
  try {
    const controllerId = await ControllerIdCache.getInstance().getControllerId(
      ipAddress,
      dbPool
    );

    if (!controllerId) {
      console.warn(`Controller not found for IP: backup-trans ${ipAddress}`);
      return;
    }

    const sessionResult = await dbPool.query(
      `
      INSERT INTO backup_sessions 
      (id, controller_id, controller_ip, session_start_time, status) 
      VALUES (gen_random_uuid(), $1, $2, NOW(), 'in_progress') 
      RETURNING id
    `,
      [controllerId, ipAddress]
    );

    const sessionId = sessionResult.rows[0].id;
    activeBackupSessions.set(ipAddress, sessionId);

    console.log(
      `CMOS Backup session started: ${sessionId} for controller: ${controllerId}`
    );
  } catch (error) {
    console.error("Error starting backup session:", error);
  }
};

const endBackupSession = async (ipAddress: string) => {
  try {
    const sessionId = activeBackupSessions.get(ipAddress);
    if (!sessionId) {
      console.warn(`No active backup session to end for IP: ${ipAddress}`);
      return;
    }

    const statsResult = await dbPool.query(
      `
      SELECT 
        COUNT(*) as total_files,
        COUNT(*) FILTER (WHERE backup_status = true) as successful_files,
        COUNT(*) FILTER (WHERE backup_status = false) as failed_files
      FROM backup_file_details 
      WHERE session_id = $1
    `,
      [sessionId]
    );

    const stats = statsResult.rows[0];

    await dbPool.query(
      `
      UPDATE backup_sessions 
      SET 
        session_end_time = NOW(),
        total_files = $1,
        successful_files = $2,
        failed_files = $3,
        status = 'completed'
      WHERE id = $4
    `,
      [stats.total_files, stats.successful_files, stats.failed_files, sessionId]
    );

    activeBackupSessions.delete(ipAddress);

    console.log(
      `CMOS Backup session completed: ${sessionId} - ${stats.successful_files}/${stats.total_files} files successful`
    );
  } catch (error) {
    console.error("Error ending backup session:", error);
  }
};

const recordBackupFile = async (
  sessionId: string,
  fileName: string,
  status: boolean
) => {
  try {
    const fileType = fileName.includes(".")
      ? fileName.split(".").pop()?.toLowerCase()
      : "unknown";

    await dbPool.query(
      `
      INSERT INTO backup_file_details 
      (id, session_id, file_name, file_type, backup_status, backup_time) 
      VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW())
    `,
      [sessionId, fileName, fileType, status]
    );

    console.log(
      `CMOS Backup file recorded: ${fileName} - ${
        status ? "SUCCESS" : "FAILED"
      }`
    );
  } catch (error) {
    console.error("Error recording backup file:", error);
  }
};

export default backupTransaction;
