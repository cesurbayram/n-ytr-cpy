import WebSocket from 'ws';
import statusTransaction from './src/status-transaction/index';
import ioTransaction from './src/io-transaction/index';
import alarmTransaction from './src/alarm-transaction/index';
import variableTransaction from './src/variable-transaction/index';

interface ParsedMessage {
  type: string;
  data: any;
}

const wssMotocom = new WebSocket.Server({ port: 8080 });

wssMotocom.on('connection', (ws: WebSocket) => {
  console.log('Motocom connected');

  ws.on('message', async (message: string) => {
    try {
      const parsedMessage: ParsedMessage = JSON.parse(message);

      if (!parsedMessage || !parsedMessage.type) {
        console.log('Invalid message format:', message);
        return;
      }

      console.log('Received:', parsedMessage);

      // Gelen veriye göre ilgili işlem fonksiyonunu çağır
      switch (parsedMessage.type) {
        case "variable":
          await variableTransaction(parsedMessage.data);
          break;
        case "io":
          await ioTransaction(parsedMessage.data);
          break;
        case "alarm":
          await alarmTransaction(parsedMessage.data);
          break;
        case "robotStatus":
          await statusTransaction(parsedMessage.data);
          break;
        default:
          console.log('Unknown message type:', parsedMessage.type);
          return; // Bilinmeyen mesaj türü varsa işlem yapma
      }

    } catch (err) {
      console.error('An error occurred while processing the message:', err);
    }
  });
});
