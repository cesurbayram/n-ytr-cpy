import statusTransaction from "../status-transaction";
import ioTransaction from "../io-transaction";
import alarmTransaction from "../alarm-transaction";
import variableTransaction from "../variable-transaction";
import jobTransaction from "../job-transaction";
import utilTransaction from "../util-transaction";
import torkTransaction from "../tork-transaction";

interface QueueItem {
  type: string;
  data: any;
}

class MessageQueue {
  private queues: { [key: string]: QueueItem[] } = {
    variable: [],
    io: [],
    alarm: [],
    robotStatus: [],
    utilization: [],
    job: [],
    tork: [],
  };
  private processing: boolean = false;

  public async addToQueue(type: string, data: any) {
    try {
      switch (type) {
        case "robotStatus":
          await statusTransaction(data);
          break;
        case "alarm":
          await alarmTransaction(data);
          break;
        case "io":
          await ioTransaction(data);
          break;
        case "variable":
          await variableTransaction(data);
          break;
        case "utilization":
          await utilTransaction(data);
          break;
        case "job":
          await jobTransaction(data);
          break;
        case "tork":
          await torkTransaction(data);
          break;
        default:
          console.error(`Unknown message type: ${type}`);
      }
    } catch (error) {
      console.error(`Error processing message of type ${type}:`, error);
      this.queues[type].push({ type, data });

      if (!this.processing) {
        this.processing = true;
        await this.processQueue();
      }
    }
  }

  private async processQueue() {
    try {
      while (true) {
        let hasItems = false;

        for (const type in this.queues) {
          if (this.queues[type].length > 0) {
            hasItems = true;
            const item = this.queues[type].shift();
            if (item) {
              try {
                switch (item.type) {
                  case "robotStatus":
                    await statusTransaction(item.data);
                    break;
                  case "alarm":
                    await alarmTransaction(item.data);
                    break;
                  case "io":
                    await ioTransaction(item.data);
                    break;
                  case "variable":
                    await variableTransaction(item.data);
                    break;
                  case "utilization":
                    await utilTransaction(item.data);
                    break;
                  case "job":
                    await jobTransaction(item.data);
                    break;
                  case "tork":
                    await torkTransaction(item.data);
                    break;
                }
              } catch (error) {
                console.error(
                  `Error reprocessing message of type ${item.type}:`,
                  error
                );
                this.queues[item.type].push(item);
              }
            }
          }
        }

        if (!hasItems) {
          this.processing = false;
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error("Error in process queue:", error);
      this.processing = false;
    }
  }
}

export const messageQueue = new MessageQueue();
