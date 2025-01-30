import dbPool from "../utils/db-util";
import { v4 as uuidv4 } from "uuid";

interface AlarmValue {
  code: string;
  alarm?: string;
  type?: string;
  text?: string;
  name?: string;
  origin_date: string;
  mode?: string;
}

interface AlarmMessage {
  type: string;
  ip_address: string;
  values: AlarmValue[];
}

const alarmTransaction = async (message: AlarmMessage): Promise<void> => {
  try {
    let controllerId = "";
    let insertQuery = "";
    let selectQuery = "";

    const controllerDbRes = await dbPool.query(
      `SELECT id FROM controller WHERE ip_address = $1`,
      [message.ip_address]
    );

    if (controllerDbRes.rowCount && controllerDbRes.rowCount > 0) {
      controllerId = controllerDbRes.rows[0]?.id;
    } else {
      console.error(
        "Controller not found for IP: alarm-trans",
        message.ip_address
      );
      return;
    }

    if (message.type === "alarm") {
      insertQuery = `
        INSERT INTO alarm (id, controller_id, code, alarm, text, origin_date)
        VALUES ($1, $2, $3, $4, $5, $6)
      `;
      selectQuery = `
        SELECT 1 FROM alarm
        WHERE controller_id = $1
          AND code = $2
          AND alarm = $3
          AND text = $4
          AND origin_date = $5
        LIMIT 1
      `;
    } else if (message.type === "almhist") {
      insertQuery = `
        INSERT INTO almhist (id, controller_id, code, type, name, origin_date, mode)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;
      selectQuery = `
        SELECT 1 FROM almhist
        WHERE controller_id = $1
          AND code = $2
          AND type = $3
          AND name = $4
          AND origin_date = $5
          AND mode = $6
        LIMIT 1
      `;
    } else {
      console.error("Unknown alarm type:", message.type);
      return;
    }

    for (const value of message.values) {
      try {
        if (message.type === "alarm") {
          const { code, alarm, text, origin_date } = value;

          const existingDataRes = await dbPool.query(selectQuery, [
            controllerId,
            code,
            alarm,
            text,
            origin_date,
          ]);

          if (existingDataRes.rowCount && existingDataRes.rowCount > 0) {
            continue;
          }

          const generatedId = uuidv4();
          await dbPool.query(insertQuery, [
            generatedId,
            controllerId,
            code,
            alarm,
            text,
            origin_date,
          ]);
        } else if (message.type === "almhist") {
          const { code, type, name, origin_date, mode } = value;

          const existingDataRes = await dbPool.query(selectQuery, [
            controllerId,
            code,
            type,
            name,
            origin_date,
            mode,
          ]);

          if (existingDataRes.rowCount && existingDataRes.rowCount > 0) {
            continue;
          }

          const generatedId = uuidv4();
          await dbPool.query(insertQuery, [
            generatedId,
            controllerId,
            code,
            type,
            name,
            origin_date,
            mode,
          ]);
        }
      } catch (error) {
        console.error(
          `Error inserting ${message.type} data for controller ${controllerId}:`,
          error
        );
      }
    }
  } catch (err) {
    console.error("An error occurred while processing alarms:", err);
  }
};

export default alarmTransaction;
