import dbPool from "../utils/db-util";

interface Value {
  name: string;
  no: number;
  value: number;
}
interface Message {
  type: string;
  ip_address: string;
  values: Value[];
}

const variableTransaction = async (message: Message): Promise<void> => {
  try {
    let updateQuery = "";
    let controllerId = "";

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
