import dbPool from "../utils/db-util";
import ControllerIdCache from "../utils/services/controller-cache";
import { v4 as uuidv4 } from "uuid";
import { JobMessage } from "../types/job.types";

const jobTransaction = async (message: JobMessage): Promise<void> => {
  try {
    const controllerId = await ControllerIdCache.getInstance().getControllerId(
      message.ip_address,
      dbPool
    );

    if (!controllerId) {
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
          SELECT id, job_content FROM jobs 
          WHERE controller_id = $1 
          ORDER BY created_at DESC 
          LIMIT 1
        `;

        const existingJobRes = await dbPool.query(existingJobQuery, [
          controllerId,
        ]);

        if (
          existingJobRes?.rowCount &&
          existingJobRes.rowCount > 0 &&
          existingJobRes.rows[0]?.id
        ) {
          if (existingJobRes.rows[0].job_content !== job_content) {
            const updateQuery = `
              UPDATE jobs 
              SET current_line = $1,
                  job_content = $2,
                  job_name = $3
              WHERE id = $4
            `;

            await dbPool.query(updateQuery, [
              current_line,
              job_content,
              job_name,
              existingJobRes.rows[0].id,
            ]);
          } else {
            const updateQuery = `
              UPDATE jobs 
              SET current_line = $1,
                  job_name = $2
              WHERE id = $3
            `;

            await dbPool.query(updateQuery, [
              current_line,
              job_name,
              existingJobRes.rows[0].id,
            ]);
          }
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
