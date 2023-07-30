import { z } from 'zod';

export const walletConnectConfigGuard = z.object({});

export type WalletConnectConfig = z.infer<typeof walletConnectConfigGuard>;

export type Payload = {
  nonce: string | number;
};
