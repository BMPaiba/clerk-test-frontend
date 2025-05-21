"use client"
import React from "react";
import { useAuth, useUser, SignInButton, SignOutButton } from "@clerk/nextjs";
import { useWebSocketConnection } from "@/src/hooks/useWebSocketConnection";
import { ConnectionStatus } from "@/src/components/websocket/ConnectionStatus";
import { WeightDisplay } from "@/src/components/websocket/WeightDisplay";
import { RawDataDisplay } from "@/src/components/websocket/RawDataDisplay";

export default function App() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const {
    lastMessage,
    connectionStatus,
    readyState,
    toggleConnection,
    sendTestMessage
  } = useWebSocketConnection();

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Monitor de Balanza</h1>
        <div className="flex items-center gap-4">
          {isLoaded && (
            isSignedIn ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {/* <img 
                    src={user?.imageUrl} 
                    alt="Avatar" 
                    className="w-8 h-8 rounded-full"
                  /> */}
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
      
      <ConnectionStatus
        readyState={readyState}
        connectionTime={connectionStatus.connectionTime}
        isConnected={connectionStatus.isConnected}
        onToggleConnection={toggleConnection}
        onSendTestMessage={sendTestMessage}
      />

      {connectionStatus.error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded">
          {connectionStatus.error}
        </div>
      )}

      <div className="mt-6">
        <WeightDisplay lastMessage={lastMessage} />
        <RawDataDisplay 
          lastMessage={lastMessage}
          rawMessage={lastMessage ? JSON.stringify(lastMessage.data) : null}
        />
      </div>
    </div>
  );
}
