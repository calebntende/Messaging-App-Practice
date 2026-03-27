export interface Message {
  id: string;
  chatId: string;
  text: string;
  timestamp: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}