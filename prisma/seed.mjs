import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});

const prisma = new PrismaClient({ adapter });

const starterMessages = [
  { id: "1", chatId: "c1", text: "hello", timestamp: BigInt(1) },
  { id: "2", chatId: "c1", text: "hi", timestamp: BigInt(2) },
  { id: "3", chatId: "c2", text: "yo", timestamp: BigInt(3) },
];

async function main() {
  for (const message of starterMessages) {
    await prisma.message.upsert({
      where: { id: message.id },
      update: {
        chatId: message.chatId,
        text: message.text,
        timestamp: message.timestamp,
      },
      create: message,
    });
  }

  console.log(`Seeded ${starterMessages.length} starter messages`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
