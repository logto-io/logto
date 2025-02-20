import crypto from 'node:crypto';

export const generateCodeVerifier = () => {
  const buffer = crypto.randomBytes(32);
  return buffer.toString('base64url');
};

export const generateCodeChallenge = (verifier: string) => {
  const hash = crypto.createHash('sha256');
  hash.update(verifier);
  return hash.digest('base64url');
};
