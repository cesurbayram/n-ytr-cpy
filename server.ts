import WebSocket from "ws";
import { messageQueue } from "./src/queue/message-queue";

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

      await messageQueue.addToQueue(parsedMessage.type, parsedMessage.data);
    } catch (err) {
      console.error("An error occurred while processing the message:", err);
    }
  });
});

export default wssMotocom;
