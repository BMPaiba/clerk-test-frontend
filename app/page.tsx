"use client"
import React, { useState, useEffect } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { useAuth, useUser, SignInButton, SignOutButton } from "@clerk/nextjs";

interface WebSocketMessage {
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

export default function App() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const [lastReceivedMessage, setLastReceivedMessage] = useState<WebSocketMessage | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionTime, setConnectionTime] = useState<Date | null>(null);

  // URL del WebSocket
  // const socketUrl = "ws://localhost:8080/websocket/test";
const socketUrl = "wss://balanzas-backend-develop-391235381605.us-central1.run.app/websocket/test";


  const { sendMessage, lastMessage, readyState, getWebSocket } = useWebSocket(
    isConnected ? socketUrl : null,
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
          url: socketUrl,
          readyState: readyState,
          timestamp: new Date().toISOString()
        });
        setError(null);
        setConnectionTime(new Date());
      },
      onClose: (event) => {
        console.log('🔴 Conexión WebSocket cerrada:', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
          timestamp: new Date().toISOString()
        });
        setError(`Conexión cerrada: ${event.code} - ${event.reason}`);
      },
      onError: (event) => {
        console.error('❌ Error en WebSocket:', {
          error: event,
          readyState: readyState,
          timestamp: new Date().toISOString(),
          connectionTime: connectionTime?.toISOString(),
          lastMessage: lastReceivedMessage
        });
        setError('Error en la conexión WebSocket');
      },
      onMessage: (event) => {
        console.log('📥 Mensaje recibido:', {
          rawData: event.data,
          timestamp: new Date().toISOString(),
          readyState: readyState
        });
        try {
          const parsedData = JSON.parse(event.data);
          console.log('✅ Datos parseados correctamente:', {
            data: parsedData,
            timestamp: new Date().toISOString()
          });
        } catch (e) {
          console.error('❌ Error al parsear el mensaje:', {
            error: e instanceof Error ? e.message : 'Error desconocido',
            rawData: event.data,
            timestamp: new Date().toISOString()
          });
        }
      }
    }
  );

  useEffect(() => {
    if (lastMessage !== null) {
      console.log('🔄 Procesando nuevo mensaje en useEffect:', {
        rawMessage: lastMessage.data,
        readyState: readyState,
        timestamp: new Date().toISOString()
      });

      try {
        const parsedData = JSON.parse(lastMessage.data);
        console.log('✅ Mensaje procesado exitosamente:', {
          parsedData,
          timestamp: new Date().toISOString()
        });
        
        setLastReceivedMessage({
          timestamp: new Date().toISOString(),
          data: parsedData
        });
      } catch (e) {
        console.error('❌ Error al procesar el mensaje en useEffect:', {
          error: e instanceof Error ? e.message : 'Error desconocido',
          rawMessage: lastMessage.data,
          timestamp: new Date().toISOString()
        });
        
        setLastReceivedMessage({
          timestamp: new Date().toISOString(),
          data: lastMessage.data,
          error: e instanceof Error ? e.message : 'Error desconocido'
        });
      }
    }
  }, [lastMessage, readyState]);

  const toggleConnection = () => {
    setIsConnected((prev) => !prev);
  };

  const connectionStatus = {
    [ReadyState.CONNECTING]: "Conectando",
    [ReadyState.OPEN]: "Abierto",
    [ReadyState.CLOSING]: "Cerrando",
    [ReadyState.CLOSED]: "Cerrado",
    [ReadyState.UNINSTANTIATED]: "No instanciado",
  }[readyState];

  const sendTestMessage = () => {
    const testMessage = {
      type: "ping",
      timestamp: new Date().toISOString(),
      clientInfo: {
        readyState,
        connectionTime: connectionTime?.toISOString(),
        lastError: error
      }
    };
    
    console.log('📤 Enviando mensaje de prueba:', {
      message: testMessage,
      readyState,
      timestamp: new Date().toISOString()
    });
    
    sendMessage(JSON.stringify(testMessage));
  };

  // Función para extraer y formatear el peso si está disponible
  const extractPeso = () => {
    if (!lastReceivedMessage || !lastReceivedMessage.data) {
      console.log('ℹ️ No hay datos disponibles para extraer peso');
      return null;
    }
    
    const data = lastReceivedMessage.data;
    console.log('🔍 Extrayendo peso de datos:', {
      data,
      timestamp: new Date().toISOString()
    });
    
    if (data.data && data.data.peso) {
      console.log('✅ Peso encontrado en data.data.peso:', data.data.peso);
      return data.data.peso;
    } else if (data.peso) {
      console.log('✅ Peso encontrado en data.peso:', data.peso);
      return data.peso;
    }
    
    console.log('ℹ️ No se encontró peso en los datos');
    return null;
  };

  // Función para extraer la unidad si está disponible
  const extractUnidad = () => {
    if (!lastReceivedMessage || !lastReceivedMessage.data) return null;
    
    // Buscar la unidad en la estructura de datos
    const data = lastReceivedMessage.data;
    
    if (data.data && data.data.unidad) {
      return data.data.unidad;
    } else if (data.unidad) {
      return data.unidad;
    }
    
    return null;
  };

  // Formatear hora de la última actualización
  const formatLastUpdateTime = () => {
    if (!lastReceivedMessage) return "Sin datos";
    
    const date = new Date(lastReceivedMessage.timestamp);
    return date.toLocaleTimeString();
  };

  // Calcular tiempo transcurrido desde la conexión
  const getConnectionDuration = () => {
    if (!connectionTime || readyState !== ReadyState.OPEN) return null;
    
    const now = new Date();
    const diffMs = now.getTime() - connectionTime.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    
    if (diffSec < 60) return `${diffSec} seg`;
    
    const diffMin = Math.floor(diffSec / 60);
    const remainingSec = diffSec % 60;
    
    return `${diffMin} min ${remainingSec} seg`;
  };

  const peso = extractPeso();
  const unidad = extractUnidad();

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Monitor de Balanza</h1>
        <div className="flex items-center gap-4">
          {isLoaded && (
            isSignedIn ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <img 
                    src={user?.imageUrl} 
                    alt="Avatar" 
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-sm">{user?.fullName || user?.username}</span>
                </div>
                <SignOutButton>
                  <button className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600">
                    Cerrar Sesión
                  </button>
                </SignOutButton>
              </div>
            ) : (
              <SignInButton mode="modal">
                <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
                  Iniciar Sesión
                </button>
              </SignInButton>
            )
          )}
        </div>
      </div>
      
      <div className="mb-4 p-3 bg-gray-500 border rounded shadow-sm">
        <div className="mb-2 flex justify-between items-center">
          <div>
            <span className="font-bold">Estado: </span>
            <span className={`px-2 py-1 rounded ${
              connectionStatus === 'Abierto' ? 'bg-green-100 text-green-800' : 
              connectionStatus === 'Cerrado' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {connectionStatus}
            </span>
          </div>
          
          {getConnectionDuration() && (
            <div className="text-sm text-gray-100">
              Tiempo de conexión: {getConnectionDuration()}
            </div>
          )}
        </div>

        <div className="flex space-x-2">
          <button 
            onClick={toggleConnection}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {isConnected ? "Desconectar" : "Conectar"}
          </button>
          
          <button 
            onClick={sendTestMessage}
            disabled={readyState !== ReadyState.OPEN}
            className={`px-4 py-2 rounded ${
              readyState === ReadyState.OPEN 
                ? 'bg-green-500 text-white hover:bg-green-600' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Enviar Ping
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="mt-6">
        <div className="bg-gray-500 p-6 rounded-lg border shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Último dato recibido</h2>
            <div className="text-sm text-gray-100">
              Actualizado: {formatLastUpdateTime()}
            </div>
          </div>
          
          {peso ? (
            <div className="text-center">
              <div className="text-5xl font-bold text-blue-700 my-6">
                {peso} <span className="text-2xl text-gray-500">{unidad}</span>
              </div>
              
              <div className="text-sm text-gray-500">
                {lastReceivedMessage && lastReceivedMessage.data && lastReceivedMessage.data.status && (
                  <div className="mb-2">
                    Estado: <span className="font-medium">{lastReceivedMessage.data.status}</span>
                  </div>
                )}
                
                {lastReceivedMessage && lastReceivedMessage.data && lastReceivedMessage.data.message && (
                  <div>
                    Mensaje: <span className="font-medium">{lastReceivedMessage.data.message}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-100">
              Esperando datos...
            </div>
          )}
        </div>
        
        <div className="mt-6 p-4 bg-gray-500 rounded-lg border">
          <h3 className="font-bold mb-2">Mensaje Crudo:</h3>
          <pre className="whitespace-pre-wrap break-words text-sm overflow-x-auto bg-gray-500 p-3 rounded">
            {lastMessage ? (
              <>
                <div className="text-xs text-gray-500 mb-1">Timestamp: {new Date().toISOString()}</div>
                <div className="font-mono">{lastMessage.data}</div>
              </>
            ) : (
              "Sin mensajes recibidos"
            )}
          </pre>
        </div>

        <div className="mt-6 p-4 bg-gray-500 rounded-lg border">
          <h3 className="font-bold mb-2">Datos Procesados:</h3>
          <pre className="whitespace-pre-wrap break-words text-sm overflow-x-auto bg-gray-500 p-3 rounded">
            {lastReceivedMessage ? (
              JSON.stringify(lastReceivedMessage.data, null, 2)
            ) : (
              "Sin datos procesados"
            )}
          </pre>
        </div>
      </div>
    </div>
  );
}
