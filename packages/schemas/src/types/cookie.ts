import { z } from 'zod';

import { type ToZodObject } from '../utils/zod.js';

export type LogtoUiCookie = Partial<{
  appId: string;
  organizationId: string;
  uiLocales: string;
  theme: string;
}>;

export const logtoUiCookieGuard = z
  .object({
    appId: z.string(),
    organizationId: z.string(),
    uiLocales: z.string(),
    theme: z.string(),
  })
  .partial() satisfies ToZodObject<LogtoUiCookie>;
