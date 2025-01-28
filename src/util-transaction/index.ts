import dbPool from "../utils/db-util";
import { v4 as uuidv4 } from "uuid";

interface UtilizationValue {
  control_power_time: number;
  servo_power_time: number;
  playback_time: number;
  moving_time: number;
}

interface UtilizationMessage {
  ip_address: string;
  values: UtilizationValue[];
}

const utilTransaction = async (message: UtilizationMessage): Promise<void> => {
  try {
    let controllerId = "";

    const controllerDbRes = await dbPool.query(
      `SELECT id FROM controller WHERE ip_address = $1`,
      [message.ip_address]
    );

    if (controllerDbRes.rowCount && controllerDbRes.rowCount > 0) {
      controllerId = controllerDbRes.rows[0]?.id;
    } else {
      console.error("Controller not found for IP:", message.ip_address);
      return;
    }

    const insertQuery = `
      INSERT INTO utilization_data (
        id, 
        controller_id, 
        control_power_time, 
        servo_power_time, 
        playback_time, 
        moving_time
      )
      VALUES ($1, $2, $3, $4, $5, $6)
    `;

    for (const value of message.values) {
      try {
        const {
          control_power_time,
          servo_power_time,
          playback_time,
          moving_time,
        } = value;

        const generatedId = uuidv4();
        await dbPool.query(insertQuery, [
          generatedId,
          controllerId,
          control_power_time,
          servo_power_time,
          playback_time,
          moving_time,
        ]);

        console.log(
          `Utilization data inserted successfully for controller ${controllerId}`
        );
      } catch (error) {
        console.error(
          `Error inserting utilization data for controller ${controllerId}:`,
          error
        );
      }
    }
  } catch (err) {
    console.error("An error occurred while processing utilization data:", err);
  }
};

export default utilTransaction;
