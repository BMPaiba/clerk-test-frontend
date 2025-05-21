"use client"
import React, { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'

interface Contenedor {
  // Define aquí la interfaz según la respuesta que esperas
  id?: string;
  // ... otros campos
}

const TestPage = () => {
  const { getToken } = useAuth();
  const [data, setData] = useState<Contenedor[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const url = 'https://balanzas-backend-develop-391235381605.us-central1.run.app/containers';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Obtener el token de Clerk
        const token = await getToken();
        
        if (!token) {
          throw new Error('No hay token disponible');
        }

        console.log('🔑 Token obtenido:', token);
        console.log('🌐 URL de la solicitud:', url);

        // Log de la solicitud antes de enviarla
        console.log('📤 Detalles de la solicitud:', {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer [TOKEN]', // No logueamos el token por seguridad
            'Content-Type': 'application/json',
          },
          mode: 'cors',
          credentials: 'same-origin'
        });

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        // Log detallado de la respuesta
        console.log('📡 Respuesta completa:', {
          status: response.status,
          statusText: response.statusText,
          type: response.type,
          url: response.url,
          headers: {
            'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
            'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
            'access-control-allow-headers': response.headers.get('access-control-allow-headers'),
            'access-control-allow-credentials': response.headers.get('access-control-allow-credentials'),
            'origin': response.headers.get('origin'),
            'all-headers': Object.fromEntries(response.headers.entries())
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Detalles del error:', {
            status: response.status,
            statusText: response.statusText,
            errorBody: errorText
          });
          throw new Error(`Error HTTP: ${response.status} ${response.statusText}\nDetalles: ${errorText}`);
        }

        const jsonData = await response.json();
        console.log('✅ Datos recibidos:', jsonData);
        setData(jsonData);
      } catch (err) {
        console.error('❌ Error en la petición:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [getToken]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Test de API</h1>
      
      {loading && (
        <div className="text-blue-500">Cargando...</div>
      )}

      {error && (
        <div className="p-4 mb-4 bg-red-100 border border-red-400 text-red-700 rounded">
          Error: {error}
        </div>
      )}

      {data && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Datos recibidos:</h2>
          <pre className="bg-gray-500 p-4 rounded overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

export default TestPage