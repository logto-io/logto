import { createHmac } from 'node:crypto';
import { promisify } from 'node:util';

export const sign = (signingKey: string, payload: Record<string, unknown>): string => {
  const hmac = createHmac('sha256', signingKey);
  const payloadString = JSON.stringify(payload);
  hmac.update(payloadString);
  return `sha256=${hmac.digest('hex')}`;
};

export const signAsync = async (signingKey: string, payload: Record<string, unknown>) =>
  promisify<string>((callback) => {
    callback(null, sign(signingKey, payload));
  })();
