import { useState, useCallback, useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { WebSocketState } from '../types/websocket';
import { useAuth, useUser } from '@clerk/nextjs';
import { TOKEN_CONFIG, getTokenConfig, getWebSocketUrl } from '../config/tokens';

// Obtener la URL de WebSocket según el entorno
const SOCKET_URL = getWebSocketUrl(true); // false = desarrollo, true = producción

export const useWebSocketConnection = () => {
  const { getToken, isSignedIn } = useAuth();
  const { user } = useUser();
  const [socketUrl, setSocketUrl] = useState<string | null>(null);

  // Obtener configuración del token
  const tokenConfig = getTokenConfig();

  // Función para obtener la URL con el token
  const getSocketUrl = useCallback(async () => {
    if (!isSignedIn || !user) {
      console.error('❌ Usuario no autenticado');
      return null;
    }

    try {
      let tokenToUse: string;

      if (tokenConfig.useFixedToken) {
        // Usar token fijo
        console.log('🔑 Usando token fijo para WebSocket');
        tokenToUse = tokenConfig.fixedToken;
      } else {
        // Usar token dinámico de Clerk
        console.log('🔑 Obteniendo token dinámico de Clerk');
        const dynamicToken = await getToken();
        if (!dynamicToken) {
          console.error('❌ No se pudo obtener el token JWT de Clerk');
          return null;
        }
        tokenToUse = dynamicToken;
      }
      
      // Usar el token como subprotocolo
      return `${SOCKET_URL}?protocol=${tokenToUse}`;
    } catch (error) {
      console.error('❌ Error al obtener el token:', error);
      return null;
    }
  }, [getToken, isSignedIn, user, tokenConfig]);

  // Actualizar la URL cuando cambie el token o el estado de autenticación
  useEffect(() => {
    if (isSignedIn) {
      getSocketUrl().then(url => {
        if (url) {
          console.log(`🔗 URL del WebSocket con token ${tokenConfig.tokenType}:`, url);
          setSocketUrl(url);
        }
      });
    } else {
      setSocketUrl(null);
    }
  }, [getSocketUrl, isSignedIn, tokenConfig.tokenType]);

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
          userId: user?.id,
          tokenType: tokenConfig.tokenType
        });
        return Boolean(isSignedIn);
      },
      reconnectAttempts: TOKEN_CONFIG.RECONNECTION.MAX_ATTEMPTS,
      reconnectInterval: TOKEN_CONFIG.RECONNECTION.INTERVAL,
      onOpen: () => {
        const ws = getWebSocket();
        console.log({ws})
        console.log('🟢 Conexión WebSocket establecida:', {
          url: socketUrl,
          readyState,
          timestamp: new Date().toISOString(),
          userId: user?.id,
          isSignedIn,
          tokenType: tokenConfig.tokenType
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
          isSignedIn,
          tokenType: tokenConfig.tokenType
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
          isSignedIn,
          tokenType: tokenConfig.tokenType
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
        userId: user.id,
        tokenType: tokenConfig.tokenType
      }
    };
    sendMessage(JSON.stringify(testMessage));
  }, [sendMessage, readyState, state.connectionStatus, isSignedIn, user, tokenConfig.tokenType]);

  return {
    ...state,
    readyState,
    toggleConnection,
    sendTestMessage,
    isSignedIn,
    userId: user?.id,
    tokenType: tokenConfig.tokenType
  };
}; 