import dbPool from "../utils/db-util";
import ControllerIdCache from "../utils/services/controller-cache";
import { v4 as uuidv4 } from "uuid";
import { AbsodataMessage } from "../types/absodata.types";

const absodataTransaction = async (message: AbsodataMessage): Promise<void> => {
  try {
    const controllerId = await ControllerIdCache.getInstance().getControllerId(
      message.ip_address,
      dbPool
    );

    if (!controllerId) {
      console.error(
        "Controller not found for IP: abso-dat",
        message.ip_address
      );
      return;
    }

    const insertQuery = `
        INSERT INTO abso_data (
            id,
            controller_id,
            "S",
            "L",   
            "U",
            "R",
            "B",
            "T",
            timestamp
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
            `;

    for (const value of message.values) {
      try {
        const { S, L, U, R, B, T } = value;

        const generatedId = uuidv4();
        await dbPool.query(insertQuery, [
          generatedId,
          controllerId,
          S,
          L,
          U,
          R,
          B,
          T,
        ]);
      } catch (error) {
        console.error(
          `Error inserting abso data for controller ${controllerId}:`,
          error
        );
      }
    }
  } catch (err) {
    console.error("An error occurred while processing abso data:", err);
  }
};

export default absodataTransaction;
