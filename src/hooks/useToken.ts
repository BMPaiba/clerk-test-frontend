import { useState, useCallback, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { TokenState } from '../types/user';
import { getTokenExpirationTime, formatTimeRemaining } from '../utils/formatUtils';

export const useToken = () => {
  const { getToken } = useAuth();
  const { user, isSignedIn } = useUser();
  const [state, setState] = useState<TokenState>({
    token: null,
    isRefreshing: false,
    error: null,
    copied: false
  });
  const [userRole, setUserRole] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);

  const updateTimeRemaining = useCallback((token: string) => {
    const remaining = getTokenExpirationTime(token);
    if (remaining !== null) {
      setTimeRemaining(formatTimeRemaining(remaining));
    }
  }, []);

  const fetchToken = useCallback(async () => {
    if (!isSignedIn) return;
    
    try {
      setState(prev => ({ ...prev, isRefreshing: true }));
      const jwt = await getToken();
      if (jwt) {
        setState(prev => ({ ...prev, token: jwt }));
        updateTimeRemaining(jwt);
      }
      
      if (user?.publicMetadata?.role) {
        setUserRole(user.publicMetadata.role as string);
      }
    } catch (err) {
      console.error('Error al actualizar el token:', err);
    } finally {
      setState(prev => ({ ...prev, isRefreshing: false }));
    }
  }, [getToken, user, isSignedIn, updateTimeRemaining]);

  const copyToClipboard = useCallback(async () => {
    if (!state.token) return;
    
    try {
      await navigator.clipboard.writeText(state.token);
      setState(prev => ({ ...prev, copied: true }));
      setTimeout(() => setState(prev => ({ ...prev, copied: false })), 2000);
    } catch (err) {
      setState(prev => ({ ...prev, error: 'Error al copiar al portapapeles', err }));
    }
  }, [state.token]);

  useEffect(() => {
    if (isSignedIn) {
      fetchToken();
      const intervalId = setInterval(fetchToken, 60 * 1000);
      
      // Actualizar el tiempo restante cada segundo
      const timeIntervalId = setInterval(() => {
        if (state.token) {
          updateTimeRemaining(state.token);
        }
      }, 1000);
      
      return () => {
        clearInterval(intervalId);
        clearInterval(timeIntervalId);
      };
    } else {
      setState({ token: null, isRefreshing: false, error: null, copied: false });
      setUserRole(null);
      setTimeRemaining(null);
    }
  }, [fetchToken, isSignedIn, state.token, updateTimeRemaining]);

  return {
    ...state,
    userRole,
    isSignedIn,
    user,
    timeRemaining,
    fetchToken,
    copyToClipboard
  };
}; 