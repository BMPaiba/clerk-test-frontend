import { useState, useCallback, useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { WebSocketMessage, ConnectionStatus, WebSocketState } from '../types/websocket';
import { useAuth, useUser } from '@clerk/nextjs';

const SOCKET_URL = "wss://balanzas-backend-develop-391235381605.us-central1.run.app/websocket/balanza-uno";
// const SOCKET_URL = "ws://localhost:8080/websocket/test";

export const useWebSocketConnection = () => {
  const { getToken, isSignedIn } = useAuth();
  const { user } = useUser();
  const [socketUrl, setSocketUrl] = useState<string | null>(null);

  // Función para obtener la URL con el token
  const getSocketUrl = useCallback(async () => {
    if (!isSignedIn || !user) {
      console.error('❌ Usuario no autenticado');
      return null;
    }

    try {
      const token = await getToken();
      if (!token) {
        console.error('❌ No se pudo obtener el token JWT');
        return null;
      }

      // Usar el token como subprotocolo
      return `${SOCKET_URL}?protocol=${token}`;
    } catch (error) {
      console.error('❌ Error al obtener el token:', error);
      return null;
    }
  }, [getToken, isSignedIn, user]);

  // Actualizar la URL cuando cambie el token o el estado de autenticación
  useEffect(() => {
    if (isSignedIn) {
      getSocketUrl().then(url => {
        if (url) {
          console.log('🔗 URL del WebSocket con token:', url);
          setSocketUrl(url);
        }
      });
    } else {
      setSocketUrl(null);
    }
  }, [getSocketUrl, isSignedIn]);

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
    socketUrl,
    {
      shouldReconnect: (closeEvent) => {
        console.log('🔄 Intento de reconexión:', {
          code: closeEvent.code,
          reason: closeEvent.reason,
          wasClean: closeEvent.wasClean,
          timestamp: new Date().toISOString(),
          isSignedIn,
          userId: user?.id
        });
        return Boolean(isSignedIn);
      },
      reconnectAttempts: 10,
      reconnectInterval: 3000,
      onOpen: () => {
        const ws = getWebSocket();
        console.log('🟢 Conexión WebSocket establecida:', {
          url: socketUrl,
          readyState,
          timestamp: new Date().toISOString(),
          userId: user?.id,
          isSignedIn
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
          timestamp: new Date().toISOString(),
          userId: user?.id,
          isSignedIn
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
          lastMessage: state.lastMessage,
          userId: user?.id,
          isSignedIn
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
    if (!isSignedIn || !user) {
      console.error('❌ No se puede enviar mensaje: usuario no autenticado');
      return;
    }

    const testMessage = {
      type: "ping",
      timestamp: new Date().toISOString(),
      clientInfo: {
        readyState,
        connectionTime: state.connectionStatus.connectionTime?.toISOString(),
        lastError: state.connectionStatus.error,
        userId: user.id
      }
    };
    sendMessage(JSON.stringify(testMessage));
  }, [sendMessage, readyState, state.connectionStatus, isSignedIn, user]);

  return {
    ...state,
    readyState,
    toggleConnection,
    sendTestMessage,
    isSignedIn,
    userId: user?.id
  };
}; 