import { messages } from "./data";
import { getMessagesForChat } from "./utils";

const result = getMessagesForChat(messages, "c1");

console.log(result);