import dbPool from "../utils/db-util";

interface IOValue {
  byteNumber: number;
  bits: boolean[];
}

interface IOMessage {
  ip_address: string;
  values: IOValue[];
}

const ioTransaction = async (message: IOMessage): Promise<void> => {
  try {
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

    for (const { byteNumber, bits } of message.values) {
      try {
        const groupAndSignalRes = await dbPool.query(
          `SELECT io_signal.id as signal_id, io_group.name as group_name, io_group.short_name as short_name, io_group.bit_type as bit_type 
           FROM io_signal 
           JOIN io_group ON io_signal.group_id = io_group.id 
           WHERE io_group.controller_id = $1 
           AND io_signal.byte_number = $2`,
          [controllerId, byteNumber]
        );

        if (groupAndSignalRes.rowCount === 0) {
          console.log(`No signal configuration found for byte: ${byteNumber}`);
          continue;
        }

        const { signal_id, group_name, short_name, bit_type } =
          groupAndSignalRes.rows[0];

        for (let bitIndex = 0; bitIndex < bits.length; bitIndex++) {
          const isActive = bits[bitIndex];
          const formattedBitNumber = `#${byteNumber}${bitIndex} (${short_name} ${bit_type}${
            bitIndex + 1
          })`;

          await dbPool.query(
            `UPDATE io_bit 
             SET is_active = $1 
             WHERE signal_id = $2 AND bit_number = $3`,
            [isActive, signal_id, formattedBitNumber]
          );
        }

        console.log(`Updated bits for byte ${byteNumber} in ${group_name}`);
      } catch (error) {
        console.error(`Error processing byte ${byteNumber}:`, error);
      }
    }

    console.log("I/O data updated successfully");
  } catch (err) {
    console.error("An error occurred while processing I/O data:", err);
  }
};

export default ioTransaction;
