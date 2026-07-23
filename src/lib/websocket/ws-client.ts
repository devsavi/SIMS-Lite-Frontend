/**
 * WebSocket client placeholder.
 * Full implementation happens in the notifications phase.
 */

type MessageHandler = (event: MessageEvent) => void;
type ConnectionHandler = () => void;

interface WsClientOptions {
  url: string;
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
}

export class WsClient {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private readonly options: Required<WsClientOptions>;
  private messageHandlers: Set<MessageHandler> = new Set();
  private openHandlers: Set<ConnectionHandler> = new Set();
  private closeHandlers: Set<ConnectionHandler> = new Set();

  constructor(options: WsClientOptions) {
    this.options = {
      reconnectDelay: 3000,
      maxReconnectAttempts: 5,
      ...options,
    };
  }

  connect(): void {
    if (typeof window === "undefined") return;

    this.socket = new WebSocket(this.options.url);

    this.socket.addEventListener("open", () => {
      this.reconnectAttempts = 0;
      this.openHandlers.forEach((h) => h());
    });

    this.socket.addEventListener("message", (event) => {
      this.messageHandlers.forEach((h) => h(event));
    });

    this.socket.addEventListener("close", () => {
      this.closeHandlers.forEach((h) => h());
      this.attemptReconnect();
    });

    this.socket.addEventListener("error", () => {
      this.socket?.close();
    });
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.options.maxReconnectAttempts) return;
    this.reconnectAttempts++;
    setTimeout(() => this.connect(), this.options.reconnectDelay);
  }

  disconnect(): void {
    this.socket?.close();
    this.socket = null;
  }

  send(data: unknown): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    }
  }

  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  onOpen(handler: ConnectionHandler): () => void {
    this.openHandlers.add(handler);
    return () => this.openHandlers.delete(handler);
  }

  onClose(handler: ConnectionHandler): () => void {
    this.closeHandlers.add(handler);
    return () => this.closeHandlers.delete(handler);
  }

  get isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }
}

// Singleton — lazy-initialised on client only
let _wsClient: WsClient | null = null;

export function getWsClient(): WsClient {
  if (!_wsClient) {
    _wsClient = new WsClient({
      url: process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8000/ws",
    });
  }
  return _wsClient;
}
