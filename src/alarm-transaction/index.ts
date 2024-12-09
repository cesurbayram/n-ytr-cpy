import dbPool from "../utils/db-util";
import { v4 as uuidv4 } from "uuid";

interface AlarmValue {
  code: string;
  alarm: string;
  text: string;
  origin_date: string;
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
      console.error("Controller not found for IP:", message.ip_address);
      return;
    }

    switch (message.type) {
      case "alarm":
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
        break;
      case "almhist":
        insertQuery = `
          INSERT INTO almhist (id, controller_id, code, alarm, text, origin_date)
          VALUES ($1, $2, $3, $4, $5, $6)
        `;
        selectQuery = `
          SELECT 1 FROM almhist
          WHERE controller_id = $1
            AND code = $2
            AND alarm = $3
            AND text = $4
            AND origin_date = $5
          LIMIT 1
        `;
        break;

      default:
        console.error("Unknown alarm type:", message.type);
        return;
    }

    for (const { code, alarm, text, origin_date } of message.values) {
      try {
        // Aynı verinin zaten var olup olmadığını kontrol et
        const existingDataRes = await dbPool.query(selectQuery, [
          controllerId,
          code,
          alarm,
          text,
          origin_date,
        ]);

        // Eğer veri zaten varsa, atla
        if (existingDataRes.rowCount && existingDataRes.rowCount > 0) {
          console.log(
            `Duplicate data found in ${message.type}. Skipping insertion.`
          );
          continue;
        }

        // Yeni bir UUID oluştur ve veriyi ekle
        const generatedId = uuidv4();
        await dbPool.query(insertQuery, [
          generatedId,
          controllerId,
          code,
          alarm,
          text,
          origin_date,
        ]);
      } catch (error) {
        console.error(
          `Error inserting data for controller ${controllerId} in ${message.type}:`,
          error
        );
      }
    }
  } catch (err) {
    console.error("An error occurred while processing alarms:", err);
  }
};

export default alarmTransaction;
