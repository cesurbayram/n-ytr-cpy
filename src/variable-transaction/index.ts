import { v4 as uuidv4 } from 'uuid'; 
import dbPool from '../utils/db-util';

// Gelen mesajın türünü tanımlıyoruz
interface Message {
  type: string;
  robot_ip: string; 
  value: number;
  name: string;
  no: number; // no değerini de ekledik
}

const variableTransaction = async (message: Message): Promise<void> => {
  try {
    let updateQuery = '';
    let controllerId = '';
    
    // Gelen mesaja göre ilgili tabloya kaydet
    switch (message.type) {
      case 'd_read':


        updateQuery =
          `UPDATE d_read SET value = $2, name = $3, no = $4 WHERE controller_id = $1`;
        
        break;
      case 'r_read':
        updateQuery =
          `UPDATE r_read SET value = $2, name = $3, no = $4 WHERE controller_id = $1 `;
        
        break;
      case 's_read':
        updateQuery =
          `UPDATE s_read SET value = $2, name = $3, no = $4 WHERE controller_id = $1 `;
        
        break;
      case 'i_read':
        updateQuery =
          `UPDATE i_read SET value = $2, name = $3, no = $4 WHERE controller_id = $1 `;
        
        break;
      case 'b_read':
        updateQuery =
          `UPDATE b_read SET value = $2, name = $3, no = $4 WHERE controller_id = $1 `;
        
        break;
      default:
        console.log('Unknown variable type:', message.type);
        return;
    }

    const controllerDbRes = await dbPool.query(`SELECT id FROM controller WHERE ip_address = $1`, [message.robot_ip])
    if(controllerDbRes.rowCount && controllerDbRes.rowCount > 0) {
      controllerId = controllerDbRes.rows[0]?.id
    }
    
    // Önce güncellemeyi dene
    await dbPool.query(updateQuery, [controllerId, message.value, message.name, message.no]);    
  } catch (err) {
    console.error('An error occurred while saving data to the database:', err);
  }
};

export default variableTransaction;