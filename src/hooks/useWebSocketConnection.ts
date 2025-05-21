import { useState, useCallback, useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { WebSocketMessage, ConnectionStatus, WebSocketState } from '../types/websocket';

// const SOCKET_URL = "wss://balanzas-backend-develop-391235381605.us-central1.run.app/websocket/test";
const SOCKET_URL = "ws://localhost:8080/websocket/test";

export const useWebSocketConnection = () => {
  const [state, setState] = useState<WebSocketState>({
    lastMessage: null,
    connectionStatus: {
      isConnected: true,
      readyState: ReadyState.UNINSTANTIATED,
      connectionTime: null,
      error: null
    }
  });

  const { sendMessage, lastMessage, readyState, getWebSocket } = useWebSocket(
    state.connectionStatus.isConnected ? SOCKET_URL : null,
    {
      shouldReconnect: (closeEvent) => {
        console.log('🔄 Intento de reconexión:', {
          code: closeEvent.code,
          reason: closeEvent.reason,
          wasClean: closeEvent.wasClean,
          timestamp: new Date().toISOString()
        });
        return true;
      },
      reconnectAttempts: 10,
      reconnectInterval: 3000,
      onOpen: () => {
        const ws = getWebSocket();
        console.log('🟢 Conexión WebSocket establecida:', {
          url: SOCKET_URL,
          readyState,
          timestamp: new Date().toISOString()
        });
        setState(prev => ({
          ...prev,
          connectionStatus: {
            ...prev.connectionStatus,
            error: null,
            connectionTime: new Date()
          }
        }));
      },
      onClose: (event) => {
        console.log('🔴 Conexión WebSocket cerrada:', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
          timestamp: new Date().toISOString()
        });
        setState(prev => ({
          ...prev,
          connectionStatus: {
            ...prev.connectionStatus,
            error: `Conexión cerrada: ${event.code} - ${event.reason}`
          }
        }));
      },
      onError: (event) => {
        console.error('❌ Error en WebSocket:', {
          error: event,
          readyState,
          timestamp: new Date().toISOString(),
          connectionTime: state.connectionStatus.connectionTime?.toISOString(),
          lastMessage: state.lastMessage
        });
        setState(prev => ({
          ...prev,
          connectionStatus: {
            ...prev.connectionStatus,
            error: 'Error en la conexión WebSocket'
          }
        }));
      }
    }
  );

  useEffect(() => {
    if (lastMessage !== null) {
      try {
        const parsedData = JSON.parse(lastMessage.data);
        setState(prev => ({
          ...prev,
          lastMessage: {
            timestamp: new Date().toISOString(),
            data: parsedData
          }
        }));
      } catch (e) {
        setState(prev => ({
          ...prev,
          lastMessage: {
            timestamp: new Date().toISOString(),
            data: lastMessage.data,
            error: e instanceof Error ? e.message : 'Error desconocido'
          }
        }));
      }
    }
  }, [lastMessage]);

  const toggleConnection = useCallback(() => {
    setState(prev => ({
      ...prev,
      connectionStatus: {
        ...prev.connectionStatus,
        isConnected: !prev.connectionStatus.isConnected
      }
    }));
  }, []);

  const sendTestMessage = useCallback(() => {
    const testMessage = {
      type: "ping",
      timestamp: new Date().toISOString(),
      clientInfo: {
        readyState,
        connectionTime: state.connectionStatus.connectionTime?.toISOString(),
        lastError: state.connectionStatus.error
      }
    };
    sendMessage(JSON.stringify(testMessage));
  }, [sendMessage, readyState, state.connectionStatus]);

  return {
    ...state,
    readyState,
    toggleConnection,
    sendTestMessage
  };
}; 