import { z } from 'zod';

import { type ToZodObject } from '../utils/zod.js';

export type LogtoUiCookie = Partial<{
  appId: string;
  organizationId: string;
  ui_locales: string;
}>;

export const logtoUiCookieGuard = z
  .object({ appId: z.string(), organizationId: z.string(), ui_locales: z.string() })
  .partial() satisfies ToZodObject<LogtoUiCookie>;
