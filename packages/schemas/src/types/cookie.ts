import { z } from 'zod';

export const logtoUiCookieGuard = z.object({ appId: z.string() }).partial();

export type LogtoUiCookie = z.infer<typeof logtoUiCookieGuard>;
