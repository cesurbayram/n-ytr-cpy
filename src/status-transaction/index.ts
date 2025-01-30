import dbPool from "../utils/db-util";

interface StatusValue {
  teach?: "TEACH" | "PLAY" | "REMOTE";
  servo?: boolean;
  operating?: boolean;
  cycle?: "CYCLE" | "STEP" | "AUTO";
  hold?: boolean;
  alarm?: boolean;
  error?: boolean;
  stop?: boolean;
  door_opened?: boolean;
}
interface StatusMessage {
  ip_address: string;
  values: StatusValue;
}

const statusTransaction = async (message: StatusMessage): Promise<void> => {
  try {
    let controllerId = "";

    const controllerDbRes = await dbPool.query(
      `SELECT id FROM controller WHERE ip_address = $1`,
      [message.ip_address]
    );

    if (controllerDbRes.rowCount && controllerDbRes.rowCount > 0) {
      controllerId = controllerDbRes.rows[0]?.id;
    } else {
      console.error(
        "Controller not found for IP: status-trans",
        message.ip_address
      );
      return;
    }

    const updateQuery = `
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
    `;

    const result = await dbPool.query(updateQuery, [
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
    ]);

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
