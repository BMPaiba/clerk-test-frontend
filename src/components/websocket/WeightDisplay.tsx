import { WebSocketMessage } from '../../types/websocket';
import { formatLastUpdateTime, extractPeso, extractUnidad } from '../../utils/formatUtils';

interface WeightDisplayProps {
  lastMessage: WebSocketMessage | null;
}

export const WeightDisplay = ({ lastMessage }: WeightDisplayProps) => {
  const peso = extractPeso(lastMessage);
  const unidad = extractUnidad(lastMessage);

  return (
    <div className="bg-gray-500 p-6 rounded-lg border shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Último dato recibido</h2>
        <div className="text-sm text-gray-100">
          Actualizado: {formatLastUpdateTime(lastMessage)}
        </div>
      </div>
      
      {peso ? (
        <div className="text-center">
          <div className="text-5xl font-bold text-blue-700 my-6">
            {peso} <span className="text-2xl text-gray-500">{unidad}</span>
          </div>
          
          <div className="text-sm text-gray-500">
            {lastMessage?.data?.status && (
              <div className="mb-2">
                Estado: <span className="font-medium">{lastMessage.data.status}</span>
              </div>
            )}
            
            {lastMessage?.data?.message && (
              <div>
                Mensaje: <span className="font-medium">{lastMessage.data.message}</span>
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
  );
};