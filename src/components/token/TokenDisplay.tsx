import { Check, Copy, RefreshCw } from 'lucide-react';

interface TokenDisplayProps {
  token: string | null;
  isRefreshing: boolean;
  copied: boolean;
  onRefresh: () => void;
  onCopy: () => void;
}

export const TokenDisplay = ({ 
  token, 
  isRefreshing, 
  copied, 
  onRefresh, 
  onCopy 
}: TokenDisplayProps) => (
  <div className="bg-gray-100 p-4 rounded-lg">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold text-gray-800">Tu token JWT:</h2>
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-1 hover:bg-gray-200 rounded-full transition-colors"
          title="Actualizar token"
        >
          <RefreshCw 
            size={16} 
            className={`text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`}
          />
        </button>
      </div>
      <button
        onClick={onCopy}
        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        disabled={!token || isRefreshing}
      >
        {copied ? (
          <>
            <Check size={16} />
            Copiado
          </>
        ) : (
          <>
            <Copy size={16} />
            Copiar
          </>
        )}
      </button>
    </div>
    
    {token ? (
      <div className="bg-gray-800 text-gray-200 p-4 rounded overflow-x-auto">
        <pre className="text-sm whitespace-pre-wrap break-all">
          {token}
        </pre>
      </div>
    ) : (
      <div className="text-gray-500 italic">
        {isRefreshing ? 'Actualizando token...' : 'Cargando token...'}
      </div>
    )}
  </div>
); 