import { WebSocketMessage } from '../../types/websocket';

interface RawDataDisplayProps {
  lastMessage: WebSocketMessage | null;
  rawMessage: string | null;
}

export const RawDataDisplay = ({ lastMessage, rawMessage }: RawDataDisplayProps) => (
  <>
    <div className="mt-6 p-4 bg-gray-500 rounded-lg border">
      <h3 className="font-bold mb-2">Mensaje Crudo:</h3>
      <pre className="whitespace-pre-wrap break-words text-sm overflow-x-auto bg-gray-500 p-3 rounded">
        {rawMessage ? (
          <>
            <div className="text-xs text-gray-500 mb-1">Timestamp: {new Date().toISOString()}</div>
            <div className="font-mono">{rawMessage}</div>
          </>
        ) : (
          "Sin mensajes recibidos"
        )}
      </pre>
    </div>

    <div className="mt-6 p-4 bg-gray-500 rounded-lg border">
      <h3 className="font-bold mb-2">Datos Procesados:</h3>
      <pre className="whitespace-pre-wrap break-words text-sm overflow-x-auto bg-gray-500 p-3 rounded">
        {lastMessage ? (
          JSON.stringify(lastMessage.data, null, 2)
        ) : (
          "Sin datos procesados"
        )}
      </pre>
    </div>
  </>
); 