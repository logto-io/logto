// Password splitting function for zero-knowledge encryption
import { fromUint8Array } from 'js-base64';

export async function splitPassword(
  password: string
): Promise<{ serverPassword: string; clientPassword: string }> {
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password);

  const serverSalt = encoder.encode('logto_server_password_salt');
  const clientSalt = encoder.encode('logto_client_password_salt');

  const baseKey = await crypto.subtle.importKey('raw', passwordData, 'PBKDF2', false, [
    'deriveBits',
  ]);

  const serverBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: serverSalt,
      iterations: 100_000,
      hash: 'SHA-256',
    },
    baseKey,
    256
  );

  const clientBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: clientSalt,
      iterations: 100_000,
      hash: 'SHA-256',
    },
    baseKey,
    256
  );

  const serverPassword: string = fromUint8Array(new Uint8Array(serverBits), true);

  const clientPassword: string = fromUint8Array(new Uint8Array(clientBits), true);

  return { serverPassword, clientPassword };
}
