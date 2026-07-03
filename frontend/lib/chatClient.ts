export type ChatMessage = {
  id: string;
  roomId: string;
  text: string;
  userId: string;
  username: string;
  createdAt: string;
  source?: "local" | "remote" | "system";
};

export type ChatEvent =
  | { type: "history"; messages: ChatMessage[] }
  | { type: "message"; message: ChatMessage }
  | { type: "system"; message: ChatMessage }
  | { type: "error"; message: string };

type ChatClientOptions = {
  url: string;
  token: string;
  roomId: string;
  displayName: string;
  onEvent: (event: ChatEvent) => void;
  onStatus: (status: ConnectionStatus) => void;
};

export type ConnectionStatus =
  | "demo"
  | "connecting"
  | "connected"
  | "closed"
  | "error";

export class ChatClient {
  private socket: WebSocket | null = null;
  private options: ChatClientOptions;

  constructor(options: ChatClientOptions) {
    this.options = options;
  }

  connect() {
    const { url, token, roomId, displayName, onEvent, onStatus } = this.options;
    const endpoint = new URL(url);

    endpoint.searchParams.set("token", token);
    endpoint.searchParams.set("roomId", roomId);
    endpoint.searchParams.set("name", displayName);

    onStatus("connecting");
    this.socket = new WebSocket(endpoint.toString());

    this.socket.addEventListener("open", () => {
      onStatus("connected");
      this.sendRaw({ action: "getHistory", roomId, limit: 30 });
    });

    this.socket.addEventListener("message", (event) => {
      try {
        onEvent(JSON.parse(event.data) as ChatEvent);
      } catch {
        onEvent({ type: "error", message: "Received an unreadable message." });
      }
    });

    this.socket.addEventListener("close", () => onStatus("closed"));
    this.socket.addEventListener("error", () => onStatus("error"));
  }

  sendMessage(text: string) {
    this.sendRaw({
      action: "sendMessage",
      roomId: this.options.roomId,
      text
    });
  }

  close() {
    this.socket?.close();
    this.socket = null;
  }

  private sendRaw(payload: Record<string, unknown>) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      this.options.onEvent({
        type: "error",
        message: "Connection is not open."
      });
      return;
    }

    this.socket.send(JSON.stringify(payload));
  }
}

