import dbPool from "../utils/db-util";
import { v4 as uuidv4 } from "uuid";

interface JobValue {
  job_name: string;
  current_line: number;
  job_content: string;
}

interface JobMessage {
  type: string;
  ip_address: string;
  values: JobValue[];
}

const jobTransaction = async (message: JobMessage): Promise<void> => {
  try {
    let controllerId = "";

    const controllerDbRes = await dbPool.query(
      `SELECT id FROM controller WHERE ip_address = $1`,
      [message.ip_address]
    );

    if (controllerDbRes.rowCount && controllerDbRes.rowCount > 0) {
      controllerId = controllerDbRes.rows[0]?.id;
    } else {
      console.error(
        "Controller not found for IP: job-trans",
        message.ip_address
      );
      return;
    }

    for (const value of message.values) {
      try {
        const { job_name, current_line, job_content } = value;

        const existingJobQuery = `
          SELECT id FROM jobs 
          WHERE controller_id = $1 
          AND job_name = $2 
          ORDER BY created_at DESC 
          LIMIT 1
        `;

        const existingJobRes = await dbPool.query(existingJobQuery, [
          controllerId,
          job_name,
        ]);

        if (
          existingJobRes?.rowCount &&
          existingJobRes.rowCount > 0 &&
          existingJobRes.rows[0]?.id
        ) {
          const updateQuery = `
            UPDATE jobs 
            SET current_line = $1 
            WHERE id = $2
          `;

          await dbPool.query(updateQuery, [
            current_line,
            existingJobRes.rows[0].id,
          ]);
        } else {
          const insertQuery = `
            INSERT INTO jobs (
              id,
              controller_id,
              job_name,
              current_line,
              job_content
            )
            VALUES ($1, $2, $3, $4, $5)
          `;

          const generatedId = uuidv4();
          await dbPool.query(insertQuery, [
            generatedId,
            controllerId,
            job_name,
            current_line,
            job_content,
          ]);
        }
      } catch (error) {
        console.error(
          `Error processing job data for controller ${controllerId}:`,
          error
        );
      }
    }
  } catch (err) {
    console.error("An error occurred while processing job data:", err);
  }
};

export default jobTransaction;
