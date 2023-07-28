import { z } from 'zod';

export const metaMaskConfigGuard = z.object({});

export type MetaMaskConfig = z.infer<typeof metaMaskConfigGuard>;

export type Payload = {
  nonce: string | number;
};
