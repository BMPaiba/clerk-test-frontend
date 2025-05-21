"use client"
import React, { useEffect, useState, useCallback } from 'react'
import { useAuth, useUser, SignInButton, SignOutButton } from '@clerk/nextjs'
import { Check, Copy, User, RefreshCw, LogIn, LogOut } from 'lucide-react'

function TokenPage() {
  const { getToken } = useAuth();
  const { user, isSignedIn } = useUser();
  const [token, setToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchToken = useCallback(async () => {
    if (!isSignedIn) return;
    
    try {
      setIsRefreshing(true);
      const jwt = await getToken();
      if (jwt) {
        setToken(jwt);
      }
      
      if (user?.publicMetadata?.role) {
        setUserRole(user.publicMetadata.role as string);
      }
    } catch (err) {
      console.error('Error al actualizar el token:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [getToken, user, isSignedIn]);

  // Actualizar el token cada minuto solo si está autenticado
  useEffect(() => {
    if (isSignedIn) {
      fetchToken();
      const intervalId = setInterval(fetchToken, 60 * 1000);
      return () => clearInterval(intervalId);
    } else {
      setToken(null);
      setUserRole(null);
    }
  }, [fetchToken, isSignedIn]);

  const copyToClipboard = async () => {
    if (!token) return;
    
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError('Error al copiar al portapapeles');
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Token JWT</h1>
        <div className="flex gap-2">
          {isSignedIn ? (
            <SignOutButton>
              <button className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors">
                <LogOut size={16} />
                Cerrar Sesión
              </button>
            </SignOutButton>
          ) : (
            <SignInButton mode="modal">
              <button className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
                <LogIn size={16} />
                Iniciar Sesión
              </button>
            </SignInButton>
          )}
        </div>
      </div>
      
      {error && (
        <div className="p-4 mb-4 bg-red-100 border border-red-400 text-red-700 rounded">
          Error: {error}
        </div>
      )}

      {!isSignedIn ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800 mb-4">Necesitas iniciar sesión para ver tu token JWT</p>
          <SignInButton mode="modal">
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
              <LogIn size={16} />
              Iniciar Sesión
            </button>
          </SignInButton>
        </div>
      ) : (
        <>
          {/* Sección de información del usuario */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-4 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <User size={20} className="text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-800">Información del Usuario</h2>
            </div>
            <div className="pl-8">
              <p className="text-gray-600">
                <span className="font-medium">Email:</span>{' '}
                <span className="text-gray-800">{user?.primaryEmailAddress?.emailAddress}</span>
              </p>
              <p className="text-gray-600 mt-2">
                <span className="font-medium">Rol:</span>{' '}
                {userRole ? (
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {userRole}
                  </span>
                ) : (
                  <span className="text-gray-400 italic">No asignado</span>
                )}
              </p>
            </div>
          </div>

          {/* Sección del token */}
          <div className="bg-gray-100 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-gray-800">Tu token JWT:</h2>
                <button
                  onClick={fetchToken}
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
                onClick={copyToClipboard}
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

          <div className="mt-4 text-sm text-gray-600">
            <p>Este token se utiliza para autenticar las solicitudes a la API.</p>
            <p className="mt-2">⚠️ Ten cuidado al compartir este token, ya que proporciona acceso a tu cuenta.</p>
            <p className="mt-2">🔄 El token se actualiza automáticamente cada minuto. También puedes actualizarlo manualmente usando el botón de actualizar.</p>
          </div>
        </>
      )}
    </div>
  )
}

export default TokenPage