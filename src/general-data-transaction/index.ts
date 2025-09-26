// src/general-data-transaction/index.ts
import dbPool from "../utils/db-util";
import ControllerIdCache from "../utils/services/controller-cache";
import { v4 as uuidv4 } from "uuid";

import { GeneralMessage } from "../types/general-data.types";

const generalDataTransaction = async (message: GeneralMessage): Promise<void> => {
  try {
    const controllerId = await ControllerIdCache.getInstance().getControllerId(
      message.ip_address,
      dbPool
    );

    if (!controllerId) {
      console.error(
        "Controller not found for IP: general-data-trans",
        message.ip_address
      );
      return;
    }

    let updateQuery = "";

    switch (message.type) {
      case "GeneralRegister":
        updateQuery = `UPDATE general_register_data SET value = $2 WHERE controller_id = $1 AND general_no = $3`;
        break;
      case "GeneralSignal":
        updateQuery = `UPDATE general_signal_data SET value = $2 WHERE controller_id = $1 AND general_no = $3`;
        break;
      case "GeneralByte":
        updateQuery = `UPDATE general_byte_data SET value = $2 WHERE controller_id = $1 AND general_no = $3`;
        break;
      case "GeneralInt":
        updateQuery = `UPDATE general_int_data SET value = $2 WHERE controller_id = $1 AND general_no = $3`;
        break;
      case "GeneralReal":
        updateQuery = `UPDATE general_real_data SET value = $2 WHERE controller_id = $1 AND general_no = $3`;
        break;
      case "GeneralDouble":
        updateQuery = `UPDATE general_double_data SET value = $2 WHERE controller_id = $1 AND general_no = $3`;
        break;
      case "GeneralString":
        updateQuery = `UPDATE general_string_data SET value = $2 WHERE controller_id = $1 AND general_no = $3`;
        break;
      default:
        console.error(`Error: Unsupported general data type: ${message.type}`);
        return;
    }

    for (const { generalNo, value } of message.values) {
      await dbPool.query(updateQuery, [controllerId, value, generalNo]);
    }

    console.log(`${message.type} data updated for controller: ${controllerId}`);
  } catch (err) {
    console.error("An error occurred while processing general data:", err);
  }
};

export default generalDataTransaction;

