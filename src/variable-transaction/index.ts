import dbPool from '../utils/db-util';


// Gelen mesajın türünü tanımlıyoruz
interface Message {
  type: string;
  robot_ip: string;
  no: number;
  value: string;
  name: string;
}

const variableTransaction = async (message: Message): Promise<void> => {
  try {
    let updateQuery = '';
    let insertQuery = '';
    let values: (string | number)[] = [];

    // Gelen mesaja göre ilgili tabloya kaydet
    switch (message.type) {
      case 'd_read':
        updateQuery =
          `UPDATE d_read SET value = $3, name = $4 WHERE robot_ip = $1 AND no = $2 RETURNING *`;
        insertQuery =
          `INSERT INTO d_read (robot_ip, no, value, name) VALUES ($1, $2, $3, $4) RETURNING *`;
        values = [message.robot_ip, message.no, message.value, message.name];
        break;
      case 'r_read':
        updateQuery =
          `UPDATE r_read SET value = $3, name = $4 WHERE robot_ip = $1 AND no = $2 RETURNING *`;
        insertQuery =
          `INSERT INTO r_read (robot_ip, no, value, name) VALUES ($1, $2, $3, $4) RETURNING *`;
        values = [message.robot_ip, message.no, message.value, message.name];
        break;
      case 's_read':
        updateQuery =
          `UPDATE s_read SET value = $3, name = $4 WHERE robot_ip = $1 AND no = $2 RETURNING *`;
        insertQuery =
          `INSERT INTO s_read (robot_ip, no, value, name) VALUES ($1, $2, $3, $4) RETURNING *`;
        values = [message.robot_ip, message.no, message.value, message.name];
        break;
      case 'ı_read':
        updateQuery =
          `UPDATE ı_read SET value = $3, name = $4 WHERE robot_ip = $1 AND no = $2 RETURNING *`;
        insertQuery =
          `INSERT INTO ı_read (robot_ip, no, value, name) VALUES ($1, $2, $3, $4) RETURNING *`;
        values = [message.robot_ip, message.no, message.value, message.name];
        break;
      case 'b_read':
        updateQuery =
          `UPDATE b_read SET value = $3, name = $4 WHERE robot_ip = $1 AND no = $2 RETURNING *`;
        insertQuery =
          `INSERT INTO b_read (robot_ip, no, value, name) VALUES ($1, $2, $3, $4) RETURNING *`;
        values = [message.robot_ip, message.no, message.value, message.name];
        break;
      default:
        console.log('Unknown variable type:', message.type);
        return;
    }

    // Önce güncellemeyi dene
    const result = await dbPool.query(updateQuery, values);

    if (result.rowCount === 0) {
      // Güncellenecek bir satır yoksa, yeni bir satır ekle
      await dbPool.query(insertQuery, values);
      console.log(`${message.type} data inserted successfully`);
    } else {
      console.log(`${message.type} data updated successfully`);
    }
  } catch (err) {
    console.error('An error occurred while saving data to the database:', err);
  }
};

export default variableTransaction;
