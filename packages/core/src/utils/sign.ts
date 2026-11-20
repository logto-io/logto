import { createHmac } from 'node:crypto';

export const sign = (signingKey: string, payload: Record<string, unknown> | string) => {
  const hmac = createHmac('sha256', signingKey);
  const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);
  hmac.update(payloadString);
  return hmac.digest('hex');
};
