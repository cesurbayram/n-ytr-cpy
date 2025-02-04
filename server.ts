import WebSocket from "ws";
import { messageQueue } from "./src/queue/message-queue";
import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import dbPool from "./src/utils/db-util";
import cors from "cors";

interface ParsedMessage {
  type: string;
  data: any;
}

const wssMotocom = new WebSocket.Server({ port: 8081 });
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

      await messageQueue.addToQueue(parsedMessage.type, parsedMessage.data);
    } catch (err) {
      console.error("An error occurred while processing the message:", err);
    }
  });
});

const app = express();
const port = 8082;

app.use(bodyParser.json());
app.use(cors<Request>());

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
      console.log("istek gelen ip", ipAddress);

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

app.listen(port, () => {
  console.log(`Express API çalışıyor: http://localhost:${port}`);
});
