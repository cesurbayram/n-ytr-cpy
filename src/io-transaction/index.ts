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

    if (!controllerDbRes.rowCount || controllerDbRes.rowCount === 0) {
      console.error("Controller not found for IP:", message.ip_address);
      return;
    }

    controllerId = controllerDbRes.rows[0]?.id;

    for (const { byteNumber, bits } of message.values) {
      try {
        const groupAndSignalRes = await dbPool.query(
          `SELECT 
            io_signal.id as signal_id, 
            io_group.name as group_name,
            CASE 
              WHEN io_group.name = 'External Input' THEN 'EI I'
              WHEN io_group.name = 'External Output' THEN 'EO O'
              WHEN io_group.name = 'Universal Input' THEN 'UI I'
              WHEN io_group.name = 'Universal Output' THEN 'UO O'
              WHEN io_group.name = 'Specific Input' THEN 'SI I'
              WHEN io_group.name = 'Specific Output' THEN 'SO O'
              WHEN io_group.name = 'Interface Panel' THEN 'IP P'
              WHEN io_group.name = 'Auxiliary Relay' THEN 'AR R'
              WHEN io_group.name = 'Control Status' THEN 'CS S'
              WHEN io_group.name = 'Pseudo Input' THEN 'PI I'
              WHEN io_group.name = 'Network Input' THEN 'NI I'
              WHEN io_group.name = 'Network Output' THEN 'NO O'
              WHEN io_group.name = 'Registers' THEN 'R R'
            END as type_code
           FROM io_signal 
           JOIN io_group ON io_signal.group_id = io_group.id 
           WHERE io_group.controller_id = $1 
           AND io_signal.byte_number = $2`,
          [controllerId, byteNumber]
        );

        if (!groupAndSignalRes.rowCount || groupAndSignalRes.rowCount === 0) {
          console.error(
            `No signal configuration found for byte: ${byteNumber}`
          );
          continue;
        }

        const { signal_id, type_code } = groupAndSignalRes.rows[0];

        for (let bitIndex = 0; bitIndex < bits.length; bitIndex++) {
          const isActive = bits[bitIndex];

          const [shortName, bitType] = type_code.split(" ");
          const formattedBitNumber = `#${byteNumber}${bitIndex} (${shortName} ${bitType}${
            bitIndex + 1
          })`;

          try {
            const updateResult = await dbPool.query(
              `UPDATE io_bit 
               SET is_active = $1 
               WHERE signal_id = $2 AND bit_number = $3
               RETURNING *`,
              [isActive, signal_id, formattedBitNumber]
            );

            if (!updateResult.rowCount || updateResult.rowCount === 0) {
              console.error(
                `Failed to update bit ${formattedBitNumber} for byte ${byteNumber}`
              );
            }
          } catch (updateError) {
            console.error(
              `Error updating bit ${formattedBitNumber}:`,
              updateError
            );
          }
        }
      } catch (error) {
        console.error(`Error processing byte ${byteNumber}:`, error);
      }
    }
  } catch (err) {
    console.error("An error occurred while processing I/O data:", err);
  }
};

export default ioTransaction;
