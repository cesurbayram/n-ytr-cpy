// src/status-transaction/index.ts
import dbPool from "../utils/db-util";
import ControllerIdCache from "../utils/services/controller-cache";
import { StatusMessage } from "../types/status.types";

const statusTransaction = async (message: StatusMessage): Promise<void> => {
  try {
    const controllerId = await ControllerIdCache.getInstance().getControllerId(
      message.ip_address,
      dbPool
    );

    if (!controllerId) {
      console.error(
        "Controller not found for IP: status-trans",
        message.ip_address
      );
      return;
    }

    // Status güncelle
    const result = await dbPool.query(
      `
      UPDATE controller_status
      SET
        teach = $3,
        servo = $4,
        operating = $5,
        cycle = $6,
        hold = $7,
        alarm = $8,
        error = $9,
        stop = $10,
        door_opened = $11
      WHERE ip_address = $1 AND controller_id = $2;
    `,
      [
        message.ip_address,
        controllerId,
        message.values.teach,
        message.values.servo,
        message.values.operating,
        message.values.cycle,
        message.values.hold,
        message.values.alarm,
        message.values.error,
        message.values.stop,
        message.values.door_opened,
      ]
    );

    if (result.rowCount === 0) {
      console.error(
        "No rows updated. Ensure the ip_address and controller_id exist."
      );
    }
  } catch (err) {
    console.error("An error occurred while updating the database:", err);
  }
};

export default statusTransaction;
