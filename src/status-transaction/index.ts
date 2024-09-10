import dbPool from "../utils/db-util";

interface StatusData {
  ipAddress: string;
  type: string;
  value: any;
}

const statusTransaction = async (data: StatusData): Promise<void> => {
  const { ipAddress, type, value } = data;

  try {
    await dbPool.query(`
      UPDATE robot_status SET ${type} = $1 WHERE ip_address = $2
    `, [value, ipAddress]);
  } catch (error) {
    console.error('An error occurred while updating the robot status:', error);
    throw error; // Hatanın üst katmanlara iletilmesi için
  }
};

export default statusTransaction;
