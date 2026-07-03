export type ConnectionRecord = {
  connectionId: string;
  roomId: string;
  userId: string;
  username: string;
  connectedAt: string;
  ttl: number;
};

export type StoredMessage = {
  roomId: string;
  messageId: string;
  createdAt: string;
  text: string;
  userId: string;
  username: string;
};

export type ChatMessagePayload = {
  id: string;
  roomId: string;
  text: string;
  userId: string;
  username: string;
  createdAt: string;
  source: "remote";
};

export type SendMessageRequest = {
  action?: "sendMessage";
  roomId?: string;
  text?: string;
};

export type GetHistoryRequest = {
  action?: "getHistory";
  roomId?: string;
  limit?: number;
};

