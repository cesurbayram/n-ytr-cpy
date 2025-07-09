import WebSocket from "ws";
import { messageQueue } from "./src/queue/message-queue";
import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import dbPool from "./src/utils/db-util";
import cors from "cors";

const app = express();
const port = 8082;

app.use(cors({ credentials: true, origin: true }));
app.use(bodyParser.json());

interface ParsedMessage {
  type: string;
  data: any;
}

app.post(
  "/api/input-output-socket",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const { activeInputOutput, controllerId } = req.body;
      console.log("req.body", req.body);

      if (!activeInputOutput || !controllerId) {
        return res.status(400).send("Invalid request body");
      }

      const controllerDbRes = await dbPool.query(
        `SELECT ip_address FROM controller WHERE id = $1`,
        [controllerId]
      );
      const ipAddress = controllerDbRes?.rows[0]?.ip_address;
      console.log("client-side ip", ipAddress);

      if (!motocomWebSocket) {
        return res.status(503).send("Motocom is not connected");
      }

      motocomWebSocket.send(
        JSON.stringify({ type: activeInputOutput, data: { ipAddress } })
      );

      return res.status(200).send("Message sent");
    } catch (error) {
      console.error("An error occurred while processing the request:", error);
      return res
        .status(500)
        .send("An error occurred while processing the request");
    }
  }
);

app.post(
  "/api/variable-socket",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const { activeVariable, controllerId } = req.body;
      console.log("req.body", req.body);

      if (!activeVariable || !controllerId) {
        return res.status(400).send("Invalid request body");
      }

      const controllerDbRes = await dbPool.query(
        `SELECT ip_address FROM controller WHERE id = $1`,
        [controllerId]
      );
      const ipAddress = controllerDbRes?.rows[0]?.ip_address;
      console.log("client-side ip", ipAddress);

      if (!motocomWebSocket) {
        return res.status(503).send("Motocom is not connected");
      }

      motocomWebSocket.send(
        JSON.stringify({ type: activeVariable, data: { ipAddress } })
      );

      return res.status(200).send("Message sent");
    } catch (error) {
      console.error("An error occurred while processing the request:", error);
      return res
        .status(500)
        .send("An error occurred while processing the request");
    }
  }
);

app.post(
  "/api/tork-socket",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const { controllerId } = req.body;
      console.log("req.body", req.body);

      if (!controllerId) {
        return res.status(400).send("Invalid request body");
      }

      const controllerDbRes = await dbPool.query(
        `SELECT ip_address FROM controller WHERE id = $1`,
        [controllerId]
      );
      const ipAddress = controllerDbRes?.rows[0]?.ip_address;
      console.log("client-side ip", ipAddress);

      if (!motocomWebSocket) {
        return res.status(503).send("Motocom is not connected");
      }

      motocomWebSocket.send(
        JSON.stringify({ type: "tork", data: { ipAddress } })
      );

      return res.status(200).send("Message sent");
    } catch (error) {
      console.error("An error occurred while processing the request:", error);
      return res
        .status(500)
        .send("An error occurred while processing the request");
    }
  }
);

app.post(
  "/api/absodata-socket",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const { controllerId } = req.body;
      console.log("req.body", req.body);

      if (!controllerId) {
        return res.status(400).send("Invalid request body");
      }

      const controllerDbRes = await dbPool.query(
        `SELECT ip_address FROM controller WHERE id = $1`,
        [controllerId]
      );
      const ipAddress = controllerDbRes?.rows[0]?.ip_address;
      console.log("client-side ip", ipAddress);

      if (!motocomWebSocket) {
        return res.status(503).send("Motocom is not connected");
      }

      motocomWebSocket.send(
        JSON.stringify({ type: "absoData", data: { ipAddress } })
      );

      return res.status(200).send("Message sent");
    } catch (error) {
      console.error("An error occurred while processing the request:", error);
      return res
        .status(500)
        .send("An error occurred while processing the request");
    }
  }
);

app.post(
  "/api/job-socket",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const { controllerId } = req.body;
      console.log("req.body", req.body);

      if (!controllerId) {
        return res.status(400).send("Invalid request body");
      }

      const controllerDbRes = await dbPool.query(
        `SELECT ip_address FROM controller WHERE id = $1`,
        [controllerId]
      );
      const ipAddress = controllerDbRes?.rows[0]?.ip_address;
      console.log("client-side ip", ipAddress);

      if (!motocomWebSocket) {
        return res.status(503).send("Motocom is not connected");
      }

      motocomWebSocket.send(
        JSON.stringify({ type: "job", data: { ipAddress } })
      );

      return res.status(200).send("Message sent");
    } catch (error) {
      console.error("An error occurred while processing the request:", error);
      return res
        .status(500)
        .send("An error occurred while processing the request");
    }
  }
);

app.post("/api/tab-exit", async (req: Request, res: Response): Promise<any> => {
  try {
    const { exitedTab, controllerId } = req.body;
    console.log("tab exit req.body", req.body);

    if (!exitedTab || !controllerId) {
      return res.status(400).send("Invalid request body");
    }

    const controllerDbRes = await dbPool.query(
      `SELECT ip_address FROM controller WHERE id = $1`,
      [controllerId]
    );
    const ipAddress = controllerDbRes?.rows[0]?.ip_address;
    console.log("client-side ip", ipAddress);

    if (!motocomWebSocket) {
      return res.status(503).send("Motocom is not connected");
    }

    motocomWebSocket.send(
      JSON.stringify({
        type: `${exitedTab}Exit`,
        data: {
          ipAddress,
          exitedTab,
        },
      })
    );

    return res.status(200).send("Message sent");
  } catch (error) {
    console.error("An error occurred while processing the request:", error);
    return res
      .status(500)
      .send("An error occurred while processing the request");
  }
});

app.post(
  "/api/tork-examination-socket",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const { type, data } = req.body;

      console.log(
        "tork-examination req.body",
        JSON.stringify(req.body, null, 2)
      );

      if (!data || !data.controllerId) {
        return res.status(400).send("Invalid request body");
      }

      const { controllerId } = data;
      const messageType = data.type;

      const controllerDbRes = await dbPool.query(
        `SELECT ip_address FROM controller WHERE id = $1`,
        [controllerId]
      );
      const ipAddress = controllerDbRes?.rows[0]?.ip_address;
      console.log("client-side ip", ipAddress);

      if (!motocomWebSocket) {
        return res.status(503).send("Motocom is not connected");
      }

      interface ValueObject {
        duration?: number;
        jobName?: string;
        signalNumbers?: string[];
        JobName?: string;
      }

      let valueObject: ValueObject = {};

      if (messageType === "Init") {
        if (data.values && data.values[0] && data.values[0].duration) {
          valueObject = {
            duration: data.values[0].duration,
          };
        }
      } else if (messageType === "JobSelect" && data.values?.[0]?.JobName) {
        valueObject = {
          JobName: data.values[0].JobName,
        };
        console.log(
          "JobSelect values:",
          JSON.stringify(data.values[0], null, 2)
        );
      } else if (messageType === "Start" && data.values?.[0]) {
        const values = data.values[0];
        console.log("Start values:", JSON.stringify(values, null, 2));

        valueObject = {
          duration: values.duration || 5,
        };

        if (values.jobName) valueObject.jobName = values.jobName;
        else if (values.jobId) valueObject.jobName = values.jobId;

        if (values.signalNumbers && Array.isArray(values.signalNumbers))
          valueObject.signalNumbers = values.signalNumbers;
      }

      const wsMessage = {
        type: "torkExam",
        data: {
          type: messageType,
          ipAddress: ipAddress,
          ...(messageType !== "Init" ? { values: [valueObject] } : {}),
        },
      };

      console.log("Sending to WebSocket:", JSON.stringify(wsMessage, null, 2));
      motocomWebSocket.send(JSON.stringify(wsMessage));

      return res.status(200).send("Message sent");
    } catch (error) {
      console.error("An error occurred while processing the request:", error);
      return res
        .status(500)
        .send("An error occurred while processing the request");
    }
  }
);

async function handleApiRequest(ws: WebSocket, parsedMessage: ParsedMessage) {
  try {
    let result;

    switch (parsedMessage.type) {
      case "api_getRobots":
        const robotsResult = await dbPool.query(`
          SELECT id, ip_address, name, status 
          FROM controller 
          WHERE status = 'active'
          ORDER BY name ASC
        `);
        result = { success: true, data: robotsResult.rows };
        break;

      case "api_getAlarms":
        const { ipAddress: alarmIp } = parsedMessage.data;
        const alarmsResult = await dbPool.query(
          `
          SELECT a.id, a.ip_address, a.code, a.alarm, a.text, a.origin_date, a.is_active 
          FROM alarm a
          INNER JOIN controller c ON a.controller_id = c.id 
          WHERE c.ip_address = $1 AND a.is_active = true AND c.status = 'active'
          ORDER BY a.origin_date DESC
        `,
          [alarmIp]
        );
        result = { success: true, data: alarmsResult.rows };
        break;

      case "api_getStatus":
        const { ipAddress: statusIp } = parsedMessage.data;
        const statusResult = await dbPool.query(
          `
          SELECT cs.id, cs.ip_address, cs.connection
          FROM controller_status cs
          INNER JOIN controller c ON cs.controller_id = c.id 
          WHERE c.ip_address = $1 AND c.status = 'active'
        `,
          [statusIp]
        );
        result = { success: true, data: statusResult.rows };
        break;

      case "api_getUtilization":
        const { ipAddress: utilIp } = parsedMessage.data;
        const latestTimestampResult = await dbPool.query(
          `
          SELECT MAX(ud.timestamp) as latest_timestamp 
          FROM utilization_data ud
          INNER JOIN controller c ON ud.controller_id = c.id 
          WHERE c.ip_address = $1 AND c.status = 'active'
        `,
          [utilIp]
        );

        const latestTimestamp = latestTimestampResult.rows[0]?.latest_timestamp;

        if (!latestTimestamp) {
          result = {
            success: true,
            data: {
              id: null,
              controller_id: null,
              ip_address: utilIp,
              control_power_time: 0,
              servo_power_time: 0,
              playback_time: 0,
              moving_time: 0,
              timestamp: null,
            },
          };
        } else {
          const utilizationResult = await dbPool.query(
            `
            SELECT ud.id, ud.controller_id, c.ip_address, ud.control_power_time, ud.servo_power_time, 
                   ud.playback_time, ud.moving_time, ud.timestamp 
            FROM utilization_data ud
            INNER JOIN controller c ON ud.controller_id = c.id 
            WHERE c.ip_address = $1 AND ud.timestamp = $2 AND c.status = 'active'
          `,
            [utilIp, latestTimestamp]
          );

          const utilizationData = utilizationResult.rows[0] || {
            id: null,
            controller_id: null,
            ip_address: utilIp,
            control_power_time: 0,
            servo_power_time: 0,
            playback_time: 0,
            moving_time: 0,
            timestamp: null,
          };
          result = { success: true, data: utilizationData };
        }
        break;

      case "api_getBackupSchedules":
        const backupResult = await dbPool.query(`
          SELECT * FROM backup_plans 
          WHERE is_active = true
          ORDER BY time ASC
        `);
        result = { success: true, data: backupResult.rows };
        break;

      default:
        result = { success: false, error: "Unknown API request" };
    }

    if (ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: "api_response",
          requestType: parsedMessage.type,
          requestId: parsedMessage.data?.requestId,
          result: result,
        })
      );
    }
  } catch (error) {
    console.error("API request error:", error);
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: "api_response",
          requestType: parsedMessage.type,
          requestId: parsedMessage.data?.requestId,
          result: { success: false, error: "Internal server error" },
        })
      );
    }
  }
}

app.listen(port, "0.0.0.0", () => {
  console.log(`Express API running at http://0.0.0.0:${port}`);
});

interface ParsedMessage {
  type: string;
  data: any;
}

const wssMotocom = new WebSocket.Server({ port: 4000, host: "0.0.0.0" });

let motocomWebSocket: WebSocket | null;

wssMotocom.on("connection", (ws: WebSocket) => {
  console.log("Motocom connected");
  motocomWebSocket = ws;

  const pingInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping();
    }
  }, 10000);

  ws.on("pong", () => {
    // console.log("Client pong received");
  });

  ws.on("ping", () => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.pong();
    }
  });

  ws.on("close", () => {
    console.log("Motocom disconnected");
    motocomWebSocket = null;
    clearInterval(pingInterval);
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });

  ws.on("message", async (message: string) => {
    try {
      const parsedMessage: ParsedMessage = JSON.parse(message);

      if (!parsedMessage || !parsedMessage.type) {
        console.log("Invalid message format:", message);
        return;
      }

      if (parsedMessage.type === "ping") {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "pong" }));
        }
        return;
      }

      console.log("Received:", parsedMessage);

      if (parsedMessage.type.startsWith("api_")) {
        await handleApiRequest(ws, parsedMessage);
        return;
      }

      await messageQueue.addToQueue(parsedMessage.type, parsedMessage.data);
    } catch (err) {
      console.error("An error occurred while processing the message:", err);
    }
  });
});
