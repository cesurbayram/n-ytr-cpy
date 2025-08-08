// src/register-transaction/index.ts
import dbPool from "../utils/db-util";
import ControllerIdCache from "../utils/services/controller-cache";

import { RegisterMessage } from "../types/register.types";

const registerTransaction = async (message: RegisterMessage): Promise<void> => {
  try {
    const controllerId = await ControllerIdCache.getInstance().getControllerId(
      message.ip_address,
      dbPool
    );

    if (!controllerId) {
      console.error(
        "Controller not found for IP: register-trans",
        message.ip_address
      );
      return;
    }

    const updateQuery = `UPDATE register SET register_value = $2, ip_address = $3 WHERE controller_id = $1 AND register_no = $4`;

    for (const { no, value } of message.values) {
      await dbPool.query(updateQuery, [
        controllerId,
        value,
        message.ip_address,
        no,
      ]);
    }
  } catch (err) {
    console.error("An error occurred while processing register data:", err);
  }
};

export default registerTransaction;
