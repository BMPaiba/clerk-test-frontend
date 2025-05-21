import { ReadyState } from 'react-use-websocket';
import { WebSocketMessage } from '../types/websocket';

export const getConnectionStatusText = (readyState: ReadyState): string => {
  return {
    [ReadyState.CONNECTING]: "Conectando",
    [ReadyState.OPEN]: "Abierto",
    [ReadyState.CLOSING]: "Cerrando",
    [ReadyState.CLOSED]: "Cerrado",
    [ReadyState.UNINSTANTIATED]: "No instanciado",
  }[readyState];
};

export const formatLastUpdateTime = (message: WebSocketMessage | null): string => {
  if (!message) return "Sin datos";
  const date = new Date(message.timestamp);
  return date.toLocaleTimeString();
};

export const getConnectionDuration = (connectionTime: Date | null, readyState: ReadyState): string | null => {
  if (!connectionTime || readyState !== ReadyState.OPEN) return null;
  
  const now = new Date();
  const diffMs = now.getTime() - connectionTime.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  
  if (diffSec < 60) return `${diffSec} seg`;
  
  const diffMin = Math.floor(diffSec / 60);
  const remainingSec = diffSec % 60;
  
  return `${diffMin} min ${remainingSec} seg`;
};

export const extractPeso = (message: WebSocketMessage | null): number | null => {
  if (!message?.data) return null;
  
  const data = message.data;
  if (data.data?.peso) return data.data.peso;
  if (data.peso) return data.peso;
  
  return null;
};

export const extractUnidad = (message: WebSocketMessage | null): string | null => {
  if (!message?.data) return null;
  
  const data = message.data;
  if (data.data?.unidad) return data.data.unidad;
  if (data.unidad) return data.unidad;
  
  return null;
}; 