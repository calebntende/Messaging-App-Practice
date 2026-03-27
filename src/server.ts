import express from "express";

import { Prisma, PrismaClient } from "@prisma/client";
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
    endpoints: [
      "GET /messages",
      "GET /messages/:chatId",
      "POST /messages",
      "DELETE /messages/:chatId",
      "GET /users",
      "GET /users/:id",
      "POST /users",
      "DELETE /users/:id",
    ],
  });
});

app.get("/users", async (_req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  res.json(users);
});

app.get("/users/:id", async (req, res) => {
  const { id } = req.params;
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  return res.json(user);
});

app.post("/users", async (req, res) => {
  const { name, email } = req.body as { name?: unknown; email?: unknown };

  if (typeof name !== "string" || name.trim() === "") {
    return res.status(400).json({ error: "name is required and must be a non-empty string" });
  }

  if (typeof email !== "string" || email.trim() === "") {
    return res.status(400).json({ error: "email is required and must be a non-empty string" });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(normalizedEmail)) {
    return res.status(400).json({ error: "email must be a valid email address" });
  }

  try {
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
      },
    });

    return res.status(201).json(user);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError
      && error.code === "P2002"
    ) {
      return res.status(409).json({ error: "A user with that email already exists" });
    }

    throw error;
  }
});

app.delete("/users/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedUser = await prisma.user.delete({ where: { id } });

    return res.json({
      message: `Deleted user ${deletedUser.id}`,
      user: deletedUser,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError
      && error.code === "P2025"
    ) {
      return res.status(404).json({ error: "User not found" });
    }

    throw error;
  }
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
