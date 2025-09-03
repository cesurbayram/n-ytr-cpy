// src/util-transaction/index.ts
import dbPool from "../utils/db-util";
import ControllerIdCache from "../utils/services/controller-cache";
import { v4 as uuidv4 } from "uuid";
import { UtilizationMessage } from "../types/utilization.types";

const utilTransaction = async (message: UtilizationMessage): Promise<void> => {
  try {
    const controllerId = await ControllerIdCache.getInstance().getControllerId(
      message.ip_address,
      dbPool
    );

    if (!controllerId) {
      console.error(
        "Controller not found for IP: util-trans",
        message.ip_address
      );
      return;
    }

    const insertQuery = `
      INSERT INTO utilization_data (
        id, 
        controller_id, 
        control_power_time, 
        servo_power_time, 
        playback_time, 
        moving_time,
        operating_time,
        ip_address
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;

    for (const value of message.values) {
      try {
        const {
          control_power_time,
          servo_power_time,
          playback_time,
          moving_time,
          operating_time = 0,
        } = value;

        const generatedId = uuidv4();
        await dbPool.query(insertQuery, [
          generatedId,
          controllerId,
          control_power_time,
          servo_power_time,
          playback_time,
          moving_time,
          operating_time,
          message.ip_address,
        ]);
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
