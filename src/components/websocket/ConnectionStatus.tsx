import { ReadyState } from 'react-use-websocket';
import { getConnectionStatusText, getConnectionDuration } from '../../utils/formatUtils';

interface ConnectionStatusProps {
  readyState: ReadyState;
  connectionTime: Date | null;
  isConnected: boolean;
  onToggleConnection: () => void;
  onSendTestMessage: () => void;
}

export const ConnectionStatus = ({
  readyState,
  connectionTime,
  isConnected,
  onToggleConnection,
  onSendTestMessage
}: ConnectionStatusProps) => {
  const connectionStatusText = getConnectionStatusText(readyState);
  const connectionDuration = getConnectionDuration(connectionTime, readyState);

  return (
    <div className="mb-4 p-3 bg-gray-500 border rounded shadow-sm">
      <div className="mb-2 flex justify-between items-center">
        <div>
          <span className="font-bold">Estado: </span>
          <span className={`px-2 py-1 rounded ${
            connectionStatusText === 'Abierto' ? 'bg-green-100 text-green-800' : 
            connectionStatusText === 'Cerrado' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {connectionStatusText}
          </span>
        </div>
        
        {connectionDuration && (
          <div className="text-sm text-gray-100">
            Tiempo de conexión: {connectionDuration}
          </div>
        )}
      </div>

      <div className="flex space-x-2">
        <button 
          onClick={onToggleConnection}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {isConnected ? "Desconectar" : "Conectar"}
        </button>
        
        <button 
          onClick={onSendTestMessage}
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
  );
}; 