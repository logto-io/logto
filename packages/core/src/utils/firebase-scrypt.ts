import crypto from 'node:crypto';

import RequestError from '#src/errors/RequestError/index.js';

/**
 * Firebase's non-standard scrypt password hashing algorithm.
 * This is NOT standard scrypt — it adds an extra AES-256-CTR step using a project-level signer key.
 * @see https://firebaseopensource.com/projects/firebase/scrypt
 * Vendored from https://github.com/xeewi/firebase-scrypt
 *
 * Steps:
 * 1. Decode user salt and project salt separator, concatenate them
 * 2. Run scrypt KDF with the password and combined salt
 * 3. AES-256-CTR encrypt the signer key using the derived key (zero IV)
 * 4. Return the ciphertext as base64
 *
 * All inputs (salt, signerKey, saltSeparator) and output are base64-encoded.
 */
async function firebaseScryptHash(
  password: string,
  config: {
    salt: string;
    signerKey: string;
    saltSeparator: string;
    rounds: string;
    memCost: string;
  }
): Promise<string> {
  // Firebase CLI exports use standard base64 (+, /), but the Admin SDK's listUsers
  // uses URL-safe base64 (-, _). Normalize to standard base64 to handle both.
  const base64Decode = (encoded: string) =>
    Buffer.from(encoded.replaceAll('-', '+').replaceAll('_', '/'), 'base64');

  const bSalt = Buffer.concat([base64Decode(config.salt), base64Decode(config.saltSeparator)]);
  const signerKey = base64Decode(config.signerKey);

  const derivedKey = await new Promise<Uint8Array>((resolve, reject) => {
    crypto.scrypt(
      password,
      bSalt,
      32,
      { N: 2 ** Number.parseInt(config.memCost, 10), r: Number.parseInt(config.rounds, 10), p: 1 },
      (error, key) => {
        if (error) {
          reject(error);
        } else {
          resolve(key);
        }
      }
    );
  });

  // Zero IV is safe here: each scrypt-derived key is unique (different password+salt),
  // so the same (key, IV) pair is never reused.
  const iv = Buffer.alloc(16, 0);
  const cipher = crypto.createCipheriv('aes-256-ctr', derivedKey, iv);
  return Buffer.concat([cipher.update(signerKey), cipher.final()]).toString('base64');
}

export async function executeFirebaseScryptHash(
  args: string[],
  inputPassword: string
): Promise<string> {
  const [salt, signerKey, saltSeparator, rounds, memCost] = args;
  if (!salt || !signerKey || !saltSeparator || !rounds || !memCost) {
    throw new RequestError({ code: 'password.invalid_legacy_password_format' });
  }
  return firebaseScryptHash(inputPassword, { salt, signerKey, saltSeparator, rounds, memCost });
}
