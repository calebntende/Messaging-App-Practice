export interface Message {
  id: string;
  chatId: string;
  text: string;
  timestamp: number;
}

export interface User {
  userid: number;
  name: string;
}