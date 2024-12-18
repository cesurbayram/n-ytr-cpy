import dbPool from "../utils/db-util";

interface IOValue {
  byteNumber: number; // Byte numarası
  bits: boolean[]; // 8 bitlik dizi (true = aktif, false = inaktif)
}

interface IOMessage {
  ip_address: string; // Controller IP adresi
  values: IOValue[]; // I/O verileri
}

const ioTransaction = async (message: IOMessage): Promise<void> => {
  try {
    let controllerId = "";

    // 1. Controller ID'sini al
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
      // 2. Belirli byteNumber için sinyal ID'sini al
      const signalRes = await dbPool.query(
        `SELECT id FROM io_signal WHERE controller_id = $1 AND byte_number = $2`,
        [controllerId, byteNumber]
      );

      if (signalRes.rowCount === 0) {
        console.error(`No signal found for byte: ${byteNumber}`);
        continue;
      }

      const signalId = signalRes.rows[0].id;

      // 3. Bit bilgilerini güncelle
      for (let bitIndex = 0; bitIndex < bits.length; bitIndex++) {
        const isActive = bits[bitIndex];

        // Bit numarası formatı: `#20010 (EI I1)` gibi
        const bitNumber = `#${byteNumber}0${bitIndex}`;

        await dbPool.query(
          `UPDATE io_bit 
           SET is_active = $1 
           WHERE signal_id = $2 AND bit_number = $3`,
          [isActive, signalId, bitNumber]
        );
      }
    }

    console.log("I/O data updated successfully");
  } catch (err) {
    console.error("An error occurred while processing I/O data:", err);
  }
};

export default ioTransaction;
