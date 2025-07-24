import dbPool from "../utils/db-util";
import ControllerIdCache from "../utils/services/controller-cache";
import { v4 as uuidv4 } from "uuid";

interface JobSelectMessage {
  ip_address: string;
  controllerId: string;
  values: {
    id: string;
    name: string;
    filename: string;
    created_at: string;
  }[];
}

const jobSelectTransaction = async (
  message: JobSelectMessage
): Promise<void> => {
  try {
    const controllerId = await ControllerIdCache.getInstance().getControllerId(
      message.ip_address,
      dbPool
    );

    if (!controllerId) {
      console.error(
        "Controller not found for IP: job-select-trans",
        message.ip_address
      );
      return;
    }

    console.log(
      `Processing job-select data for controller ${controllerId}:`,
      message.values
    );

    for (const jobData of message.values) {
      try {
        const existingJobQuery = `
          SELECT id FROM job_select 
          WHERE name = $1
        `;

        const existingJobRes = await dbPool.query(existingJobQuery, [
          jobData.name,
        ]);

        let jobSelectId: string;

        if (existingJobRes.rowCount && existingJobRes.rowCount > 0) {
          jobSelectId = existingJobRes.rows[0].id;
          console.log(
            `Job ${jobData.name} already exists with ID: ${jobSelectId}`
          );

          const updateJobQuery = `
            UPDATE job_select 
            SET updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
          `;

          await dbPool.query(updateJobQuery, [jobSelectId]);
        } else {
          jobSelectId = uuidv4();

          const insertJobQuery = `
            INSERT INTO job_select (
              id,
              name,
              created_at,
              updated_at
            )
            VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          `;

          await dbPool.query(insertJobQuery, [jobSelectId, jobData.name]);

          console.log(
            `New job created: ${jobData.name} with ID: ${jobSelectId}`
          );
        }

        const jobStatusQuery = `
          INSERT INTO job_status (
            id,
            shift_id,
            job_id,
            controller_id,
            current_line,
            product_count,
            content,
            created_at,
            updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          ON CONFLICT (shift_id, job_id) 
          DO UPDATE SET 
            controller_id = EXCLUDED.controller_id,
            updated_at = CURRENT_TIMESTAMP
        `;

        const defaultShiftId = null;
        const jobStatusId = uuidv4();

        await dbPool.query(jobStatusQuery, [
          jobStatusId,
          defaultShiftId,
          jobSelectId,
          controllerId,
          0,
          0,
          `Job file: ${jobData.filename}`,
        ]);
      } catch (error) {
        console.error(`Error processing job data for ${jobData.name}:`, error);
      }
    }

    console.log(
      `Successfully processed ${message.values.length} jobs for controller ${controllerId}`
    );
  } catch (err) {
    console.error("An error occurred while processing job-select data:", err);
  }
};

export default jobSelectTransaction;
