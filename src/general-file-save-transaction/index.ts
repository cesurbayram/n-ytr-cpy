// General File Save Transaction for handling C# responses
import dbPool from "../utils/db-util";
import { v4 as uuidv4 } from "uuid";
import {
  GeneralFileSaveData,
  GeneralFileSaveResult,
} from "../types/general-file-save.types";

export const handleGeneralFileSave = async (
  data: GeneralFileSaveData
): Promise<GeneralFileSaveResult> => {
  try {
    console.log("Processing GeneralFileSave response:", data);

    const { ip_address, values } = data;
    const { FileName, Status } = values;

    const controllerResult = await dbPool.query(
      `SELECT id FROM controller WHERE ip_address = $1`,
      [ip_address]
    );

    if (controllerResult.rows.length === 0) {
      console.error(`Controller not found for IP: ${ip_address}`);
      return {
        success: false,
        error: `Controller not found for IP: ${ip_address}`,
      };
    }

    const controllerId = controllerResult.rows[0].id;

    const logId = uuidv4();
    await dbPool.query(
      `INSERT INTO general_file_save_log 
       (id, controller_id, ip_address, file_name, status) 
       VALUES ($1, $2, $3, $4, $5)`,
      [logId, controllerId, ip_address, FileName, Status]
    );

    if (Status) {
      console.log(`File ${FileName} successfully saved for IP: ${ip_address}`);
    } else {
      console.log(`File ${FileName} save failed for IP: ${ip_address}`);
    }

    console.log(`Status logged to database with ID: ${logId}`);

    return {
      success: true,
      message: `GeneralFileSave ${
        Status ? "successful" : "failed"
      } for ${FileName}`,
      data: {
        id: logId,
        controller_id: controllerId,
        ip_address,
        fileName: FileName,
        status: Status,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error("Error handling GeneralFileSave:", error);
    return {
      success: false,
      error: `Failed to process GeneralFileSave: ${error}`,
    };
  }
};
