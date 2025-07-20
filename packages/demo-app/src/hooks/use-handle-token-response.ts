import { useLogto } from '@logto/react';
import { useCallback } from 'react';

/**
 * Hook to intercept and handle token responses that may contain encrypted client secrets.
 */
export const useHandleTokenResponse = () => {
  const { isAuthenticated } = useLogto();

  // Helper function to get the encrypted client secret from session storage
  const getEncryptedClientSecret = useCallback(() => {
    return sessionStorage.getItem('logto_encrypted_client_secret');
  }, []);

  return { getEncryptedClientSecret };
};
