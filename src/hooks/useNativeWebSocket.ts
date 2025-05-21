import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { WebSocketMessage, ConnectionStatus, WebSocketState } from '../types/websocket';

const SOCKET_URL = "wss://balanzas-backend-develop-391235381605.us-central1.run.app/websocket/test";
// const SOCKET_URL = "ws://localhost:8080/websocket/test";

export const useNativeWebSocket = () => {
  const { getToken, isSignedIn } = useAuth();
  const { user } = useUser();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 10;
  const RECONNECT_INTERVAL = 3000;

  const [state, setState] = useState<WebSocketState>({
    lastMessage: null,
    connectionStatus: {
      isConnected: false,
      readyState: WebSocket.CLOSED,
      connectionTime: null,
      error: null
    }
  });

  const connect = useCallback(async () => {
    if (!isSignedIn || !user) {
      console.error('❌ Usuario no autenticado');
      return;
    }

    try {
      const token = await getToken();
      if (!token) {
        console.error('❌ No se pudo obtener el token JWT');
        setState(prev => ({
          ...prev,
          connectionStatus: {
            ...prev.connectionStatus,
            error: 'No se pudo obtener el token de autenticación'
          }
        }));
        return;
      }

      // Cerrar conexión existente si hay una
      if (wsRef.current) {
        wsRef.current.close();
      }

      // Crear nueva conexión WebSocket con subprotocolo para autenticación
      const ws = new WebSocket(SOCKET_URL, ['auth']);

      wsRef.current = ws;

      ws.onopen = () => {
        // Enviar credenciales como primer mensaje
        ws.send(JSON.stringify({
          type: 'auth',
          token: `Bearer ${token}`,
          userId: user.id
        }));

        console.log('🟢 Conexión WebSocket establecida:', {
          url: SOCKET_URL,
          userId: user.id,
          timestamp: new Date().toISOString()
        });

        setState(prev => ({
          ...prev,
          connectionStatus: {
            isConnected: true,
            readyState: WebSocket.OPEN,
            connectionTime: new Date(),
            error: null
          }
        }));

        reconnectAttemptsRef.current = 0;
      };

      ws.onclose = (event) => {
        console.log('🔴 Conexión WebSocket cerrada:', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
          timestamp: new Date().toISOString(),
          userId: user.id
        });

        setState(prev => ({
          ...prev,
          connectionStatus: {
            ...prev.connectionStatus,
            isConnected: false,
            readyState: WebSocket.CLOSED,
            error: `Conexión cerrada: ${event.code} - ${event.reason}`
          }
        }));

        // Intentar reconectar si no fue un cierre limpio y no hemos excedido los intentos
        if (!event.wasClean && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current += 1;
            connect();
          }, RECONNECT_INTERVAL);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ Error en WebSocket:', {
          error,
          timestamp: new Date().toISOString(),
          userId: user.id
        });

        setState(prev => ({
          ...prev,
          connectionStatus: {
            ...prev.connectionStatus,
            error: 'Error en la conexión WebSocket'
          }
        }));
      };

      ws.onmessage = (event) => {
        try {
          const parsedData = JSON.parse(event.data);
          console.log('📥 Mensaje recibido:', {
            data: parsedData,
            timestamp: new Date().toISOString()
          });

          setState(prev => ({
            ...prev,
            lastMessage: {
              timestamp: new Date().toISOString(),
              data: parsedData
            }
          }));
        } catch (e) {
          console.error('❌ Error al procesar mensaje:', {
            error: e instanceof Error ? e.message : 'Error desconocido',
            rawData: event.data,
            timestamp: new Date().toISOString()
          });

          setState(prev => ({
            ...prev,
            lastMessage: {
              timestamp: new Date().toISOString(),
              data: event.data,
              error: e instanceof Error ? e.message : 'Error desconocido'
            }
          }));
        }
      };
    } catch (error) {
      console.error('❌ Error al establecer conexión:', error);
      setState(prev => ({
        ...prev,
        connectionStatus: {
          ...prev.connectionStatus,
          error: 'Error al establecer conexión'
        }
      }));
    }
  }, [getToken, isSignedIn, user]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    setState(prev => ({
      ...prev,
      connectionStatus: {
        ...prev.connectionStatus,
        isConnected: false,
        readyState: WebSocket.CLOSED,
        connectionTime: null
      }
    }));
  }, []);

  const sendMessage = useCallback((message: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(message);
    } else {
      console.error('❌ No se puede enviar mensaje: WebSocket no está conectado');
    }
  }, []);

  const toggleConnection = useCallback(() => {
    if (state.connectionStatus.isConnected) {
      disconnect();
    } else {
      connect();
    }
  }, [state.connectionStatus.isConnected, connect, disconnect]);

  const sendTestMessage = useCallback(() => {
    if (!isSignedIn || !user) {
      console.error('❌ No se puede enviar mensaje: usuario no autenticado');
      return;
    }

    const testMessage = {
      type: "ping",
      timestamp: new Date().toISOString(),
      clientInfo: {
        readyState: state.connectionStatus.readyState,
        connectionTime: state.connectionStatus.connectionTime?.toISOString(),
        lastError: state.connectionStatus.error,
        userId: user.id
      }
    };
    sendMessage(JSON.stringify(testMessage));
  }, [sendMessage, state.connectionStatus, isSignedIn, user]);

  // Conectar automáticamente cuando el componente se monta
  useEffect(() => {
    if (isSignedIn) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [isSignedIn, connect, disconnect]);

  return {
    ...state,
    sendMessage,
    toggleConnection,
    sendTestMessage,
    isSignedIn,
    userId: user?.id
  };
}; 