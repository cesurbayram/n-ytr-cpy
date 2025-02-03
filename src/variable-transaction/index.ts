// src/variable-transaction/index.ts
import dbPool from "../utils/db-util";
import ControllerIdCache from "../utils/services/controller-cache";
import { Message } from "../types/variable.types";

const variableTransaction = async (message: Message): Promise<void> => {
  try {
    const controllerId = await ControllerIdCache.getInstance().getControllerId(
      message.ip_address,
      dbPool
    );

    if (!controllerId) {
      console.error(
        "Controller not found for IP: var-trans",
        message.ip_address
      );
      return;
    }

    let updateQuery = "";

    switch (message.type) {
      case "d_read":
        updateQuery = `UPDATE d_read SET value = $2, name = $3 WHERE controller_id = $1 AND no = $4`;
        break;
      case "r_read":
        updateQuery = `UPDATE r_read SET value = $2, name = $3 WHERE controller_id = $1 AND no = $4`;
        break;
      case "s_read":
        updateQuery = `UPDATE s_read SET value = $2, name = $3 WHERE controller_id = $1 AND no = $4`;
        break;
      case "i_read":
        updateQuery = `UPDATE i_read SET value = $2, name = $3 WHERE controller_id = $1 AND no = $4`;
        break;
      case "b_read":
        updateQuery = `UPDATE b_read SET value = $2, name = $3 WHERE controller_id = $1 AND no = $4`;
        break;
      default:
        console.error(`Error: Unsupported variable type: ${message.type}`);
        return;
    }

    for (const { name, no, value } of message.values) {
      await dbPool.query(updateQuery, [controllerId, value, name, no]);
    }
  } catch (err) {
    console.error("An error occurred while saving data to the database:", err);
  }
};

export default variableTransaction;
