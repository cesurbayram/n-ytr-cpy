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
  "/api/register-socket",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const { controllerId } = req.body;
      console.log("register-socket req.body", req.body);

      if (!controllerId) {
        return res.status(400).send("Invalid request body");
      }

      const controllerDbRes = await dbPool.query(
        `SELECT ip_address FROM controller WHERE id = $1`,
        [controllerId]
      );
      const ipAddress = controllerDbRes?.rows[0]?.ip_address;
      console.log("register-socket client-side ip", ipAddress);

      if (!motocomWebSocket) {
        return res.status(503).send("Motocom is not connected");
      }

      motocomWebSocket.send(
        JSON.stringify({ type: "register", data: { ipAddress } })
      );

      return res.status(200).send("Register monitoring started");
    } catch (error) {
      console.error(
        "An error occurred while processing register request:",
        error
      );
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
  "/api/job-select-socket",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const { type, data } = req.body;

      console.log("job-select req.body", JSON.stringify(req.body, null, 2));

      if (!data || !data.controllerId) {
        return res.status(400).json({ error: "Invalid request body" });
      }

      const { controllerId, shiftId, type: messageType } = data;

      const controllerDbRes = await dbPool.query(
        `SELECT ip_address FROM controller WHERE id = $1`,
        [controllerId]
      );
      const ipAddress = controllerDbRes?.rows[0]?.ip_address;

      if (!ipAddress) {
        return res.status(404).json({ error: "Controller not found" });
      }

      console.log("client-side ip", ipAddress);

      if (!motocomWebSocket) {
        return res.status(503).json({ error: "Motocom is not connected" });
      }

      const wsMessage = {
        type: "jobSelect",
        data: {
          type: messageType,
          ipAddress: ipAddress,
        },
      };

      console.log("Sending to WebSocket:", JSON.stringify(wsMessage, null, 2));
      motocomWebSocket.send(JSON.stringify(wsMessage));

      return res.status(200).json({ success: true, message: "Message sent" });
    } catch (error) {
      console.error("An error occurred while processing the request:", error);
      return res
        .status(500)
        .json({ error: "An error occurred while processing the request" });
    }
  }
);

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

const manualBackupResults = new Map<string, any>();

app.post(
  "/api/manual-backup",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const { controllerId, fileTypes } = req.body;
      console.log("manual-backup req.body", JSON.stringify(req.body, null, 2));

      if (!controllerId || !fileTypes || !Array.isArray(fileTypes)) {
        return res.status(400).json({ error: "Invalid request body" });
      }

      const controllerDbRes = await dbPool.query(
        `SELECT ip_address, name FROM controller WHERE id = $1`,
        [controllerId]
      );

      if (controllerDbRes.rows.length === 0) {
        return res.status(404).json({ error: "Controller not found" });
      }

      const { ip_address, name } = controllerDbRes.rows[0];
      console.log("Manual backup for controller:", name, ip_address);

      if (!motocomWebSocket) {
        return res.status(503).json({ error: "Motocom is not connected" });
      }

      const requestId = `backup_${Date.now()}`;
      const wsMessage = {
        type: "manualBackup",
        data: {
          ipAddress: ip_address,
          controllerName: name,
          fileTypes: fileTypes,
          requestId: requestId,
          controllerId: controllerId,
        },
      };

      console.log(
        "Sending manual backup to WebSocket:",
        JSON.stringify(wsMessage, null, 2)
      );
      motocomWebSocket.send(JSON.stringify(wsMessage));

      return res.status(200).json({
        success: true,
        message: "Manual backup initiated",
        requestId: requestId,
      });
    } catch (error) {
      console.error("An error occurred while processing manual backup:", error);
      return res
        .status(500)
        .json({ error: "An error occurred while processing manual backup" });
    }
  }
);

app.get(
  "/api/manual-backup-result/:requestId",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const { requestId } = req.params;

      if (manualBackupResults.has(requestId)) {
        const result = manualBackupResults.get(requestId);
        manualBackupResults.delete(requestId);
        return res.status(200).json(result);
      } else {
        return res.status(202).json({ message: "Backup in progress" });
      }
    } catch (error) {
      console.error("Error retrieving backup result:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

app.get(
  "/api/backup-history/:controllerId",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const { controllerId } = req.params;

      const result = await dbPool.query(
        `
        SELECT 
          id, controller_name, ip_address, file_name, 
          file_count, file_size_mb, created_at
        FROM backup_history 
        WHERE controller_id = $1 
        ORDER BY created_at DESC
      `,
        [controllerId]
      );

      return res.status(200).json({
        success: true,
        data: result.rows,
      });
    } catch (error) {
      console.error("Error fetching backup history:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch backup history",
      });
    }
  }
);

app.get(
  "/api/backup-download/:backupId",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const { backupId } = req.params;

      const result = await dbPool.query(
        `
        SELECT file_name, file_data 
        FROM backup_history 
        WHERE id = $1
      `,
        [backupId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Backup not found" });
      }

      const { file_name, file_data } = result.rows[0];

      const zipBuffer = Buffer.from(file_data, "base64");

      res.setHeader("Content-Type", "application/zip");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${file_name}"`
      );
      res.setHeader("Content-Length", zipBuffer.length);

      return res.send(zipBuffer);
    } catch (error) {
      console.error("Error downloading backup:", error);
      return res.status(500).json({ error: "Failed to download backup" });
    }
  }
);

app.delete(
  "/api/backup-history/:backupId",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const { backupId } = req.params;

      const result = await dbPool.query(
        `
        DELETE FROM backup_history 
        WHERE id = $1 
        RETURNING file_name
      `,
        [backupId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Backup not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: `Backup ${result.rows[0].file_name} deleted successfully`,
      });
    } catch (error) {
      console.error("Error deleting backup:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to delete backup",
      });
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

      if (parsedMessage.type === "manualBackupComplete") {
        const { requestId } = parsedMessage.data;
        manualBackupResults.set(requestId, parsedMessage.data);
        console.log(`Manual backup result stored for requestId: ${requestId}`);

        if (parsedMessage.data.success && parsedMessage.data.fileData) {
          try {
            const fileSizeBytes = Math.round(
              (parsedMessage.data.fileData.length * 3) / 4
            );
            const fileSizeMB = (fileSizeBytes / (1024 * 1024)).toFixed(2);

            const backupId = `backup_${Date.now()}_${Math.random()
              .toString(36)
              .substr(2, 9)}`;

            await dbPool.query(
              `
              INSERT INTO backup_history (
                id, controller_id, controller_name, ip_address, 
                file_name, file_data, file_count, file_size_mb, created_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
            `,
              [
                backupId,
                parsedMessage.data.controllerId || "unknown",
                parsedMessage.data.controllerName,
                parsedMessage.data.ipAddress,
                parsedMessage.data.fileName,
                parsedMessage.data.fileData,
                parsedMessage.data.fileCount,
                fileSizeMB,
              ]
            );

            console.log(
              `Backup saved to database: ${parsedMessage.data.fileName} (${fileSizeMB} MB)`
            );
          } catch (error) {
            console.error("Error saving backup to database:", error);
          }
        }
        return;
      }

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
