// src/status-transaction/index.ts
import { v4 as uuidv4 } from "uuid";
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
      // Get current status
      const currentStatus = await dbPool.query(
        `SELECT * FROM controller_status WHERE controller_id = $1`,
        [controllerId]
      );

      if (currentStatus.rows.length === 0) {
        console.error(
          "No status found for controller_id:",
          controllerId
        );
        return;
      }

      const status = currentStatus.rows[0];

      // Only proceed if c_backup value has changed
      if (status.c_backup !== message.values.c_backup) {
        // Update current status
        await dbPool.query(
          `UPDATE controller_status SET c_backup = $2, update_at = now() WHERE controller_id = $1`,
          [controllerId, message.values.c_backup]
        );

        // Insert to history
        const historyId = uuidv4();
        await dbPool.query(
          `INSERT INTO controller_status_history (
            id, controller_id, ip_address, teach, servo, operating, cycle, hold, alarm, error, stop, door_opened, c_backup, connection
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
          [
            historyId,
            controllerId,
            message.ip_address,
            status.teach,
            status.servo,
            status.operating,
            status.cycle,
            status.hold,
            status.alarm,
            status.error,
            status.stop,
            status.door_opened,
            message.values.c_backup,
            status.connection,
          ]
        );
      }
      return;
    }
    if (
      Object.keys(message.values).length === 1 &&
      message.values.connection !== undefined
    ) {
      // Get current status
      const currentStatus = await dbPool.query(
        `SELECT * FROM controller_status WHERE controller_id = $1`,
        [controllerId]
      );

      if (currentStatus.rows.length === 0) {
        console.error(
          "No status found for controller_id:",
          controllerId
        );
        return;
      }

      const status = currentStatus.rows[0];

      // Only proceed if connection value has changed
      if (status.connection !== message.values.connection) {
        // Update current status
        await dbPool.query(
          `UPDATE controller_status SET connection = $2, update_at = now() WHERE controller_id = $1`,
          [controllerId, message.values.connection]
        );

        // Insert to history
        const historyId = uuidv4();
        await dbPool.query(
          `INSERT INTO controller_status_history (
            id, controller_id, ip_address, teach, servo, operating, cycle, hold, alarm, error, stop, door_opened, c_backup, connection
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
          [
            historyId,
            controllerId,
            message.ip_address,
            status.teach,
            status.servo,
            status.operating,
            status.cycle,
            status.hold,
            status.alarm,
            status.error,
            status.stop,
            status.door_opened,
            status.c_backup,
            message.values.connection,
          ]
        );
      }
      return;
    }

    // Get current status for comparison
    const currentStatus = await dbPool.query(
      `SELECT * FROM controller_status WHERE controller_id = $1`,
      [controllerId]
    );

    const status = currentStatus.rows.length > 0 ? currentStatus.rows[0] : { 
      teach: false, servo: false, operating: false, cycle: false, hold: false, 
      alarm: false, error: false, stop: false, door_opened: false, 
      c_backup: false, connection: false 
    };

    // Check if any value has changed
    const hasChanged = (
      status.teach !== message.values.teach ||
      status.servo !== message.values.servo ||
      status.operating !== message.values.operating ||
      status.cycle !== message.values.cycle ||
      status.hold !== message.values.hold ||
      status.alarm !== message.values.alarm ||
      status.error !== message.values.error ||
      status.stop !== message.values.stop ||
      status.door_opened !== message.values.door_opened
    );

    // Only proceed if any value has changed
    if (hasChanged) {
      // Update current status
      await dbPool.query(
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
          door_opened = $10,
          update_at = now()
        WHERE controller_id = $1
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

      // Insert to history
      const historyId = uuidv4();
      await dbPool.query(
        `INSERT INTO controller_status_history (
          id, controller_id, ip_address, teach, servo, operating, cycle, hold, alarm, error, stop, door_opened, c_backup, connection
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          historyId,
          controllerId,
          message.ip_address,
          message.values.teach,
          message.values.servo,
          message.values.operating,
          message.values.cycle,
          message.values.hold,
          message.values.alarm,
          message.values.error,
          message.values.stop,
          message.values.door_opened,
          status.c_backup,
          status.connection,
        ]
      );
    }
  } catch (err) {
    console.error("An error occurred while updating the database:", err);
  }
};

export default statusTransaction;
