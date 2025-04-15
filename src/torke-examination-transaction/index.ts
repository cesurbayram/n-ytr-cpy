import dbPool from "../utils/db-util";
import ControllerIdCache from "../utils/services/controller-cache";
import { v4 as uuidv4 } from "uuid";
import { TorkExamMessage } from "../types/tork-examination.types";

const torkExaminationTransaction = async (message: any): Promise<void> => {
  try {
    console.log("Received torkExam message:", JSON.stringify(message, null, 2));

    if (!message) {
      console.error("Message is null or undefined");
      return;
    }

    if (!message.type || !message.ip_address) {
      console.error("Message type or IP address is missing");
      return;
    }

    const ipAddress = message.ip_address;
    const controllerId = await ControllerIdCache.getInstance().getControllerId(
      ipAddress,
      dbPool
    );

    if (!controllerId) {
      console.error(
        "Controller not found for IP: tork-examination-trans",
        ipAddress
      );
      return;
    }

    switch (message.type) {
      case "ioBit":
        await processSignals(message.values, controllerId, ipAddress);
        break;
      case "tork":
        await processTorkData(message.values, controllerId, ipAddress);
        break;
      case "job":
        await processJobData(message.values, controllerId, ipAddress);
        break;
      case "jobList":
        await processJobList(message.values, controllerId, ipAddress);
        break;
      case "Init":
        await processInit(message.values, controllerId, ipAddress);
        break;
      case "JobSelect":
        await processJobSelect(message.values, controllerId, ipAddress);
        break;
      default:
        console.error("Unknown tork examination data type:", message.type);
    }
  } catch (err) {
    console.error(
      "An error occurred while processing tork examination data:",
      err
    );
  }
};

const processSignals = async (
  values: any[],
  controllerId: string,
  ipAddress: string
): Promise<void> => {
  try {
    const updateQuery = `
      UPDATE tork_examination_signals 
      SET signal_state = $3, updated_at = CURRENT_TIMESTAMP, ip_address = $4
      WHERE controller_id = $1 AND signal_number = $2
    `;

    for (const value of values) {
      try {
        const signalNumber = value.bitNumber.toString();
        await dbPool.query(updateQuery, [
          controllerId,
          signalNumber,
          value.isActive,
          ipAddress,
        ]);
      } catch (error) {
        console.error(
          `Error updating signal data for controller ${controllerId}:`,
          error
        );
      }
    }
  } catch (error) {
    console.error("Error processing tork examination signals:", error);
  }
};

const processTorkData = async (
  values: any[],
  controllerId: string,
  ipAddress: string
): Promise<void> => {
  try {
    const sessionQuery = `
      SELECT id FROM tork_examination_sessions
      WHERE controller_id = $1
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const sessionResult = await dbPool.query(sessionQuery, [controllerId]);
    let sessionId;

    if (sessionResult.rowCount && sessionResult.rowCount > 0) {
      sessionId = sessionResult.rows[0].id;
    } else {
      const now = new Date();
      const startDate = now.toISOString().split("T")[0];
      const startTime = now.toTimeString().split(" ")[0];

      const newSessionId = uuidv4();
      const createSessionQuery = `
        INSERT INTO tork_examination_sessions 
        (id, start_date, start_time, duration, end_date, end_time, controller_id, ip_address)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `;

      await dbPool.query(createSessionQuery, [
        newSessionId,
        startDate,
        startTime,
        5,
        startDate,
        startTime,
        controllerId,
        ipAddress,
      ]);

      sessionId = newSessionId;
    }

    const insertTorkDataQuery = `
      INSERT INTO tork_examination_data 
      (id, session_id, "S", "L", "U", "R", "B", "T", "B1", "S1", "S2", controller_id, ip_address)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `;

    for (const value of values) {
      try {
        const torkDataId = uuidv4();
        await dbPool.query(insertTorkDataQuery, [
          torkDataId,
          sessionId,
          value.S,
          value.L,
          value.U,
          value.R,
          value.B,
          value.T,
          value.B1,
          value.S1,
          value.S2,
          controllerId,
          ipAddress,
        ]);
      } catch (error) {
        console.error(
          `Error inserting tork data for controller ${controllerId}:`,
          error
        );
      }
    }
  } catch (error) {
    console.error("Error processing tork examination data:", error);
  }
};

const processJobData = async (
  values: any[],
  controllerId: string,
  ipAddress: string
): Promise<void> => {
  try {
    const updateQuery = `
      UPDATE tork_examination_jobs 
      SET job_content = $3, current_line = $4, updated_at = CURRENT_TIMESTAMP, ip_address = $5
      WHERE controller_id = $1 AND name = $2
    `;

    const insertQuery = `
      INSERT INTO tork_examination_jobs 
      (id, name, job_content, current_line, controller_id, updated_at, ip_address)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, $6)
    `;

    const checkQuery = `
      SELECT id FROM tork_examination_jobs
      WHERE controller_id = $1 AND name = $2
    `;

    for (const value of values) {
      try {
        const checkResult = await dbPool.query(checkQuery, [
          controllerId,
          value.job_name,
        ]);

        const currentLine =
          value.current_line !== undefined ? value.current_line : 0;

        if (checkResult.rowCount && checkResult.rowCount > 0) {
          await dbPool.query(updateQuery, [
            controllerId,
            value.job_name,
            value.job_content,
            currentLine,
            ipAddress,
          ]);
        } else {
          const jobId = uuidv4();
          await dbPool.query(insertQuery, [
            jobId,
            value.job_name,
            value.job_content,
            currentLine,
            controllerId,
            ipAddress,
          ]);
        }
      } catch (error) {
        console.error(
          `Error updating job data for controller ${controllerId}:`,
          error
        );
      }
    }
  } catch (error) {
    console.error("Error processing tork examination jobs:", error);
  }
};

const processJobList = async (
  values: any[],
  controllerId: string,
  ipAddress: string
): Promise<void> => {
  try {
    const clearQuery = `
      DELETE FROM job_list
      WHERE controller_id = $1
    `;
    await dbPool.query(clearQuery, [controllerId]);

    const insertQuery = `
      INSERT INTO job_list (id, job_name, controller_id, ip_address)
      VALUES ($1, $2, $3, $4)
    `;

    for (const value of values) {
      try {
        for (const jobName of value.jobList) {
          const jobId = uuidv4();
          await dbPool.query(insertQuery, [
            jobId,
            jobName,
            controllerId,
            ipAddress,
          ]);
        }
      } catch (error) {
        console.error(
          `Error inserting job list data for controller ${controllerId}:`,
          error
        );
      }
    }
  } catch (error) {
    console.error("Error processing tork examination job list:", error);
  }
};

const processInit = async (
  values: any[],
  controllerId: string,
  ipAddress: string
): Promise<void> => {
  try {
    for (const value of values) {
      try {
        const now = new Date();
        const startDate = now.toISOString().split("T")[0];
        const startTime = now.toTimeString().split(" ")[0];

        const duration = value.duration || 5;

        let jobId = null;
        if (value.jobName) {
          const jobQuery = `
            SELECT id FROM tork_examination_jobs
            WHERE controller_id = $1 AND name = $2
            LIMIT 1
          `;
          const jobResult = await dbPool.query(jobQuery, [
            controllerId,
            value.jobName,
          ]);
          if (jobResult.rowCount && jobResult.rowCount > 0) {
            jobId = jobResult.rows[0].id;
          }
        }

        const sessionId = uuidv4();
        const createSessionQuery = `
          INSERT INTO tork_examination_sessions 
          (id, start_date, start_time, duration, end_date, end_time, job_id, controller_id, ip_address)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `;

        await dbPool.query(createSessionQuery, [
          sessionId,
          startDate,
          startTime,
          duration,
          startDate,
          startTime,
          jobId,
          controllerId,
          ipAddress,
        ]);

        console.log(`New tork examination session created: ${sessionId}`);
      } catch (error) {
        console.error(
          `Error initializing tork examination session for controller ${controllerId}:`,
          error
        );
      }
    }
  } catch (error) {
    console.error("Error processing tork examination initialization:", error);
  }
};

const processJobSelect = async (
  values: any[],
  controllerId: string,
  ipAddress: string
): Promise<void> => {
  try {
    const resetQuery = `
      UPDATE job_list
      SET selected = false
      WHERE controller_id = $1
    `;
    await dbPool.query(resetQuery, [controllerId]);

    const updateQuery = `
      UPDATE job_list
      SET selected = true, updated_at = CURRENT_TIMESTAMP, ip_address = $3
      WHERE controller_id = $1 AND job_name = $2
    `;

    for (const value of values) {
      try {
        const jobName = value.JobName;
        if (jobName) {
          await dbPool.query(updateQuery, [controllerId, jobName, ipAddress]);
          console.log(`Job ${jobName} selected for controller ${controllerId}`);
        }
      } catch (error) {
        console.error(
          `Error selecting job for controller ${controllerId}:`,
          error
        );
      }
    }
  } catch (error) {
    console.error("Error processing job selection:", error);
  }
};

export default torkExaminationTransaction;
