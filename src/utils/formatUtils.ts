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

export const decodeJWT = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decodificando JWT:', error);
    return null;
  }
};

export const getTokenExpirationTime = (token: string) => {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return null;
  
  const expirationTime = decoded.exp * 1000; // Convertir a milisegundos
  const currentTime = Date.now();
  const timeRemaining = expirationTime - currentTime;
  
  return timeRemaining > 0 ? timeRemaining : 0;
};

export const formatTimeRemaining = (milliseconds: number) => {
  if (milliseconds <= 0) return 'Expirado';
  
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days} día${days > 1 ? 's' : ''} ${hours % 24}h ${minutes % 60}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}; 