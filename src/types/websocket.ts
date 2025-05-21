export interface WebSocketMessage {
  timestamp: string;
  data: {
    peso?: number;
    unidad?: string;
    status?: string;
    message?: string;
    data?: {
      peso?: number;
      unidad?: string;
    };
  };
  error?: string;
}

export interface ConnectionStatus {
  isConnected: boolean;
  readyState: number;
  connectionTime: Date | null;
  error: string | null;
}

export interface WebSocketState {
  lastMessage: WebSocketMessage | null;
  connectionStatus: ConnectionStatus;
} 