import express from "express";

import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const app = express();
const port = Number(process.env.PORT ?? 3000);
const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

function toApiMessage(message: { id: string; chatId: string; text: string; timestamp: bigint }) {
  return {
    ...message,
    timestamp: Number(message.timestamp),
  };
}

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    message: "Messaging API is running",
    endpoints: ["GET /messages", "GET /messages/:chatId", "POST /messages", "DELETE /messages/:chatId"],
  });
});

app.get("/messages", async (_req, res) => {
  const dbMessages = await prisma.message.findMany({ orderBy: { timestamp: "asc" } });
  res.json(dbMessages.map(toApiMessage));
});

app.get("/messages/:chatId", async (req, res) => {
  const { chatId } = req.params;
  const chatMessages = await prisma.message.findMany({
    where: { chatId },
    orderBy: { timestamp: "asc" },
  });

  res.json(chatMessages.map(toApiMessage));
});

app.post("/messages", async (req, res) => {
  const { chatId, text } = req.body as { chatId?: unknown; text?: unknown };

  if (typeof chatId !== "string" || chatId.trim() === "") {
    return res.status(400).json({ error: "chatId is required and must be a non-empty string" });
  }

  if (typeof text !== "string" || text.trim() === "") {
    return res.status(400).json({ error: "text is required and must be a non-empty string" });
  }

  const newMessage = await prisma.message.create({
    data: {
      chatId: chatId.trim(),
      text: text.trim(),
      timestamp: BigInt(Date.now()),
    },
  });

  return res.status(201).json(toApiMessage(newMessage));
});

app.delete("/messages/:chatId", async (req, res) => {
  const { chatId } = req.params;

  const result = await prisma.message.deleteMany({
    where: { chatId },
  });

  if (result.count === 0) {
    return res.status(404).json({ error: "No messages found for the provided chatId" });
  }

  return res.json({
    message: `Deleted ${result.count} message(s) for chat ${chatId}`,
    deletedCount: result.count,
    chatId: chatId.trim(),
  });
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
