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

    if (
      Object.keys(message.values).length === 1 &&
      message.values.c_backup !== undefined
    ) {
      const result = await dbPool.query(
        `
        UPDATE controller_status
        SET c_backup = $2
        WHERE controller_id = $1;
      `,
        [controllerId, message.values.c_backup]
      );

      if (result.rowCount === 0) {
        console.error(
          "No rows updated for c_backup. Ensure the ip_address and controller_id exist."
        );
      }
      return;
    }
    if (
      Object.keys(message.values).length === 1 &&
      message.values.connection !== undefined
    ) {
      const result = await dbPool.query(
        `
        UPDATE controller_status
        SET connection = $2
        WHERE controller_id = $1;
      `,
        [controllerId, message.values.connection]
      );

      if (result.rowCount === 0) {
        console.error(
          "No rows updated for connection. Ensure the ip_address and controller_id exist."
        );
      }
      return;
    }

    const result = await dbPool.query(
      `
      UPDATE controller_status
      SET
        teach = $2,
        servo = $3,
        operating = $4,
        cycle = $5,
        hold = $6,
        alarm = $7,
        error = $8,
        stop = $9,
        door_opened = $10
      WHERE controller_id = $1;
    `,
      [
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
        "No rows updated for status values. Ensure the ip_address and controller_id exist."
      );
    }
  } catch (err) {
    console.error("An error occurred while updating the database:", err);
  }
};

export default statusTransaction;
