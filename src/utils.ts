import type { Message } from "./types";

export function getMessagesForChat(
  messages: Message[],
  chatId: string
): Message[] {
  return messages.filter((m) => m.chatId === chatId);
}


