import statusTransaction from "../status-transaction";
import ioTransaction from "../io-transaction";
import alarmTransaction from "../alarm-transaction";
import variableTransaction from "../variable-transaction";
import jobTransaction from "../job-transaction";
import utilTransaction from "../util-transaction";

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

interface IOValue {
  byteNumber: number;
  bits: boolean[];
}

interface VariableValue {
  name: string;
  no: number;
  value: number;
}

interface AlarmValue {
  code: string;
  alarm?: string;
  type?: string;
  text?: string;
  name?: string;
  origin_date: string;
  mode?: string;
}

interface JobValue {
  job_name: string;
  current_line: number;
  job_content: string;
}

interface UtilizationValue {
  control_power_time: number;
  servo_power_time: number;
  playback_time: number;
  moving_time: number;
}

interface QueueItem {
  type: string;
  data: any;
  ip_address: string;
}

class MessageQueue {
  private queues: { [key: string]: QueueItem[] } = {
    variable: [],
    io: [],
    alarm: [],
    robotStatus: [],
    utilization: [],
    job: [],
  };
  private processing: boolean = false;
  private batchSize: number = 10;
  private batchTimeout: number = 1000;

  public async addToQueue(type: string, data: any, ip_address: string) {
    this.queues[type].push({ type, data, ip_address });

    if (!this.processing) {
      this.processing = true;
      this.processQueue();
    }
  }

  private async processQueue() {
    while (true) {
      for (const type in this.queues) {
        if (this.queues[type].length >= this.batchSize) {
          const batch = this.queues[type].splice(0, this.batchSize);
          await this.processBatch(type, batch);
        }
      }

      await new Promise((resolve) => setTimeout(resolve, this.batchTimeout));

      for (const type in this.queues) {
        if (this.queues[type].length > 0) {
          const batch = this.queues[type].splice(0, this.queues[type].length);
          await this.processBatch(type, batch);
        }
      }

      if (Object.values(this.queues).every((queue) => queue.length === 0)) {
        this.processing = false;
        break;
      }
    }
  }

  private async processBatch(type: string, batch: QueueItem[]) {
    try {
      const ip_address = batch[0].ip_address;
      const values = batch.map((item) => item.data);

      switch (type) {
        case "variable":
          await this.processVariableBatch(
            type,
            ip_address,
            values as VariableValue[]
          );
          break;
        case "io":
          await this.processIoBatch(ip_address, values as IOValue[]);
          break;
        case "alarm":
          await this.processAlarmBatch(
            type,
            ip_address,
            values as AlarmValue[]
          );
          break;
        case "robotStatus":
          await this.processStatusBatch(ip_address, values[0] as StatusValue);
          break;
        case "utilization":
          await this.processUtilizationBatch(
            ip_address,
            values as UtilizationValue[]
          );
          break;
        case "job":
          await this.processJobBatch(ip_address, values as JobValue[]);
          break;
        default:
          console.error(`Error: Unknown message type received: ${type}`);
      }
    } catch (error) {
      console.error(`Error processing batch of type ${type}:`, error);
    }
  }

  private async processVariableBatch(
    type: string,
    ip_address: string,
    values: VariableValue[]
  ) {
    try {
      await variableTransaction({
        type,
        ip_address,
        values,
      });
    } catch (error) {
      console.error("Error processing variable batch:", error);
    }
  }

  private async processIoBatch(ip_address: string, values: IOValue[]) {
    try {
      await ioTransaction({
        ip_address,
        values,
      });
    } catch (error) {
      console.error("Error processing IO batch:", error);
    }
  }

  private async processAlarmBatch(
    type: string,
    ip_address: string,
    values: AlarmValue[]
  ) {
    try {
      await alarmTransaction({
        type,
        ip_address,
        values,
      });
    } catch (error) {
      console.error("Error processing alarm batch:", error);
    }
  }

  private async processStatusBatch(ip_address: string, values: StatusValue) {
    try {
      await statusTransaction({
        ip_address,
        values,
      });
    } catch (error) {
      console.error("Error processing status batch:", error);
    }
  }

  private async processUtilizationBatch(
    ip_address: string,
    values: UtilizationValue[]
  ) {
    try {
      await utilTransaction({
        ip_address,
        values,
      });
    } catch (error) {
      console.error("Error processing utilization batch:", error);
    }
  }

  private async processJobBatch(ip_address: string, values: JobValue[]) {
    try {
      await jobTransaction({
        type: "job",
        ip_address,
        values,
      });
    } catch (error) {
      console.error("Error processing job batch:", error);
    }
  }
}

export const messageQueue = new MessageQueue();
