import WebSocket from "ws";
import statusTransaction from "./src/status-transaction/index";
import ioTransaction from "./src/io-transaction/index";
import alarmTransaction from "./src/alarm-transaction/index";
import variableTransaction from "./src/variable-transaction/index";
import jobTransaction from "./src/job-transaction/index";
import utilTransaction from "./src/util-transaction/index";

interface ParsedMessage {
  type: string;
  data: any;
}

const wssMotocom = new WebSocket.Server({ port: 8081 });

wssMotocom.on("connection", (ws: WebSocket) => {
  console.log("Motocom connected");

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
        case "utilization":
          await utilTransaction(parsedMessage.data);
          break;
        case "job":
          await jobTransaction(parsedMessage.data);
          break;
        default:
          console.log("Unknown message type:", parsedMessage.type);
          return;
      }
    } catch (err) {
      console.error("An error occurred while processing the message:", err);
    }
  });
});
