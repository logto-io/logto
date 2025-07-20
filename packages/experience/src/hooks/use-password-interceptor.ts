/**
 * Hook to intercept password input and handle zero-knowledge encryption.
 * This hook manages password splitting and temporary storage of the client password.
 */

import { useCallback, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { storeUserEncryptedSecret, storeSessionEncryptedSecret } from '@/utils/zero-knowledge-api';
import {
  splitPassword,
  generateSecret,
  encryptWithPassword,
  decryptWithPassword,
  encryptWithPublicKey,
  deriveAppSecret,
} from '@/utils/zero-knowledge-encryption';

export type PasswordInterceptorResult = {
  processPassword: (password: string) => Promise<string>;
  handleSecretManagement: (
    verificationId: string,
    encryptedSecret: string | undefined
  ) => Promise<void>;
};

const usePasswordInterceptor = (): PasswordInterceptorResult => {
  const [searchParams] = useSearchParams();
  const [clientPassword, setClientPassword] = useState<string | undefined>();
  const publicKeyRef = useRef<string | undefined>(searchParams.get('public_key'));

  /**
   * Process the password by splitting it into server and client parts.
   * Returns the server password for authentication.
   */
  const processPassword = useCallback(async (password: string): Promise<string> => {
    const { serverPassword, clientPassword: splitClientPassword } = await splitPassword(password);

    // Store client password temporarily for secret encryption/decryption
    setClientPassword(splitClientPassword);

    return serverPassword;
  }, []);

  /**
   * Handle secret management after successful authentication.
   * Creates a new secret if none exists, or decrypts existing secret.
   * Then derives an app-specific secret and encrypts it with the app's public key for the session.
   */
  const handleSecretManagement = useCallback(
    async (verificationId: string, encryptedSecret: string | undefined) => {
      const publicKey = publicKeyRef.current;

      // Get app ID from session storage (set during OAuth flow)
      const appId = sessionStorage.getItem('app_id');

      if (!clientPassword) {
        throw new Error('Client password not available');
      }

      if (!publicKey) {
        // No public key provided, skip secret management
        return;
      }

      if (!appId) {
        // No app ID available, skip secret management
        return;
      }

      const baseSecret = await (async (): Promise<string> => {
        if (encryptedSecret) {
          // Subsequent login - decrypt existing secret
          try {
            return await decryptWithPassword(encryptedSecret, clientPassword);
          } catch {
            // Failed to decrypt - likely password was reset by admin
            // Generate new secret and re-encrypt with current password
            const newBaseSecret = generateSecret();
            const newEncryptedSecret = await encryptWithPassword(newBaseSecret, clientPassword);
            await storeUserEncryptedSecret(newEncryptedSecret);
            return newBaseSecret;
          }
        } else {
          // First login - generate and store new secret
          const newBaseSecret = generateSecret();
          const newEncryptedSecret = await encryptWithPassword(newBaseSecret, clientPassword);
          await storeUserEncryptedSecret(newEncryptedSecret);
          return newBaseSecret;
        }
      })();

      // Derive app-specific secret from base secret
      const appSpecificSecret = await deriveAppSecret(baseSecret, appId);
      // Encrypt app-specific secret with app's public key for this session
      const encryptedClientSecret = await encryptWithPublicKey(appSpecificSecret, publicKey);
      await storeSessionEncryptedSecret(encryptedClientSecret);

      // Clear the client password from memory
      setClientPassword(undefined);
    },
    [clientPassword]
  );

  return {
    processPassword,
    handleSecretManagement,
  };
};

export default usePasswordInterceptor;
