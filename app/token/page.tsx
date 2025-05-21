"use client"
import React from 'react'
import { useToken } from '@/src/hooks/useToken'
import { AuthButtons } from '@/src/components/auth/AuthButtons'
import { UserInfo } from '@/src/components/user/UserInfo'
import { TokenDisplay } from '@/src/components/token/TokenDisplay'
import { LoginMessage } from '@/src/components/auth/LoginMessage'

function TokenPage() {
  const {
    token,
    isRefreshing,
    error,
    copied,
    userRole,
    isSignedIn,
    user,
    fetchToken,
    copyToClipboard
  } = useToken();

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Token JWT</h1>
        <AuthButtons isSignedIn={isSignedIn} />
      </div>
      
      {error && (
        <div className="p-4 mb-4 bg-red-100 border border-red-400 text-red-700 rounded">
          Error: {error}
        </div>
      )}

      {!isSignedIn ? (
        <LoginMessage />
      ) : (
        <>
          <UserInfo user={user} userRole={userRole} />
          <TokenDisplay
            token={token}
            isRefreshing={isRefreshing}
            copied={copied}
            onRefresh={fetchToken}
            onCopy={copyToClipboard}
          />
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