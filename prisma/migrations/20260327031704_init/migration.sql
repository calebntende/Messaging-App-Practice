-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chatId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "timestamp" BIGINT NOT NULL
);
