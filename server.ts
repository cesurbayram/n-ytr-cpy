import WebSocket from "ws";
import { messageQueue } from "./src/queue/message-queue";

interface ParsedMessage {
  type: string;
  data: any;
  ip_address: string;
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

      await messageQueue.addToQueue(
        parsedMessage.type,
        parsedMessage.data,
        parsedMessage.ip_address
      );
    } catch (err) {
      console.error("An error occurred while processing the message:", err);
    }
  });
});

wssMotocom.on("listening", () => {
  console.log("WebSocket server is running on port 8081");
});

wssMotocom.on("error", (error) => {
  console.error("WebSocket server error:", error);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM signal received. Closing WebSocket server...");
  wssMotocom.close(() => {
    console.log("WebSocket server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT signal received. Closing WebSocket server...");
  wssMotocom.close(() => {
    console.log("WebSocket server closed");
    process.exit(0);
  });
});

export default wssMotocom;
