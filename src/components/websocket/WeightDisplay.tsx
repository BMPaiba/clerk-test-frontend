import { WebSocketMessage } from '../../types/websocket';
import { formatLastUpdateTime } from '../../utils/formatUtils';

interface WeightDisplayProps {
  lastMessage: WebSocketMessage | null;
}

const extractPeso = (message: WebSocketMessage | null): string | null => {
  if (!message?.data?.data?.peso) return null;
  // Asegurarnos de que el peso sea tratado como string y tenga 6 dígitos
  const peso = String(message.data.data.peso).padStart(6, '0');
  return peso;
};

const extractUnidad = (message: WebSocketMessage | null): string | null => {
  if (!message?.data?.data?.unidad) return null;
  // Extraer solo la unidad base (KG)
  return message.data.data.unidad.split(' ')[0];
};

const getEstabilidad = (message: WebSocketMessage | null): { 
  isEstable: boolean; 
  label: string;
} => {
  if (!message?.data?.data?.unidad) return { isEstable: false, label: 'Desconocido' };
  
  const unidad = message.data.data.unidad;
  if (unidad.includes('MO')) {
    return { isEstable: false, label: 'Inestable' };
  }
  return { isEstable: true, label: 'Estable' };
};

export const WeightDisplay = ({ lastMessage }: WeightDisplayProps) => {
  const peso = extractPeso(lastMessage);
  const unidad = extractUnidad(lastMessage);
  const { isEstable, label } = getEstabilidad(lastMessage);

  return (
    <div className="bg-gray-500 p-6 rounded-lg border shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Último dato recibido</h2>
        <div className="text-sm text-gray-100">
          Actualizado: {formatLastUpdateTime(lastMessage)}
        </div>
      </div>
      
      {peso ? (
        <div className="text-center">
          <div className="text-6xl font-bold text-blue-100 my-6">
            {peso} <span className="text-3xl text-gray-300">{unidad}</span>
          </div>
          
          <div className="flex flex-col items-center gap-2">
            {/* Indicador de estabilidad */}
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              isEstable 
                ? 'bg-green-500 text-white' 
                : 'bg-red-500 text-white'
            }`}>
              {label}
            </div>

            {/* Estado y mensaje del servidor */}
            <div className="text-sm text-gray-300 mt-2">
              {lastMessage?.data?.status && (
                <div className="mb-1">
                  Estado: <span className="font-medium text-gray-100">{lastMessage.data.status}</span>
                </div>
              )}
              
              {lastMessage?.data?.message && (
                <div>
                  Mensaje: <span className="font-medium text-gray-100">{lastMessage.data.message}</span>
                </div>
              )}
            </div>
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