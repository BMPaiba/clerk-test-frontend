// Configuración de tokens para WebSocket
export const TOKEN_CONFIG = {
  // Configuración: true para usar token fijo, false para usar token dinámico de Clerk
  USE_FIXED_TOKEN: true,
  
  // Token fijo para pruebas y desarrollo
  FIXED_TOKEN: "eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18ydnNMT1kxWnZkS0FidUpqMW91aUJodXBYZVMiLCJ0eXAiOiJKV1QifQ.eyJhenAiOiJodHRwczovL2NsZXJrLXRlc3QtZnJvbnRlbmQudmVyY2VsLmFwcCIsImV4cCI6MTc1MTAzNTI3NiwiZnZhIjpbMjYxMiwtMV0sImlhdCI6MTc1MTAzNTIxNiwiaXNzIjoiaHR0cHM6Ly93ZWFsdGh5LW1ha28tNzguY2xlcmsuYWNjb3VudHMuZGV2IiwibmJmIjoxNzUxMDM1MjA2LCJzaWQiOiJzZXNzXzJ6MHFrNnhrOW5vaG5sQ1hzcXh4ZmNrS2NPaiIsInN1YiI6InVzZXJfMnZ2QnR2dkl6ZmhmSzMxYXZ5ZWFmaFZ6Y1REIiwidiI6Mn0.ZOrb2Lb3fJTa9OjT7C7hEbRq0ZdT3aThOQ74OvHqN8EOA463PWVhktxsLlKNbaOyhV5OF3pu4FGHqM1uC-gYeWpQnH2aQT22MkzWY2Ic_BYlDnoUEqyc8JoGJ3Q9PLmmXweFwyjd7vlCqI0SFf5iKvI3USmzkAHbXUOcy09OnyfaPkCrE8ZZJyr9wQWwmVFRPxS0g5UwAh0TqqnTjOLUuXJArRV1Iy1OZ7z7pyx_rSZ5JMMlqvSML0C-trSJWzdBIoxMO7VjM_5KAk2YsQfLhvsVLE9xNv43EXFJC5udLOJTyK9ml5BKyNUciffE6KRY9H0qgiVwLiMfLPuu3r_zQQ",
  
  // URLs de WebSocket
  WEBSOCKET_URLS: {
    PRODUCTION: "wss://balanzas-backend-develop-391235381605.us-central1.run.app/websocket/balanza-uno",
    DEVELOPMENT: "ws://localhost:8080/websocket/balanza-uno"
  },
  
  // Configuración de reconexión
  RECONNECTION: {
    MAX_ATTEMPTS: 10,
    INTERVAL: 3000
  }
};

// Función para obtener el token según la configuración
export const getTokenConfig = () => {
  return {
    useFixedToken: TOKEN_CONFIG.USE_FIXED_TOKEN,
    fixedToken: TOKEN_CONFIG.FIXED_TOKEN,
    tokenType: TOKEN_CONFIG.USE_FIXED_TOKEN ? 'fijo' : 'dinámico'
  };
};

// Función para obtener la URL de WebSocket según el entorno
export const getWebSocketUrl = (useProduction = false) => {
  return useProduction 
    ? TOKEN_CONFIG.WEBSOCKET_URLS.PRODUCTION 
    : TOKEN_CONFIG.WEBSOCKET_URLS.DEVELOPMENT;
}; 