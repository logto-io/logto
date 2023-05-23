import { createHmac } from 'node:crypto';

export const sign = (signingKey: string, payload: Record<string, unknown>) => {
  const hmac = createHmac('sha256', signingKey);
  const payloadString = JSON.stringify(payload);
  hmac.update(payloadString);
  return `sha256=${hmac.digest('hex')}`;
};
