import { z } from 'zod';

import { type ToZodObject } from '../utils/zod.js';

export type LogtoUiCookie = Partial<{
  appId: string;
  organizationId: string;
  uiLocales: string;
  theme: string;
  /** A UX hint for the entry guard; Core remains the security boundary. */
  isStepUp: boolean;
}>;

export const logtoUiCookieGuard = z
  .object({
    appId: z.string(),
    organizationId: z.string(),
    uiLocales: z.string(),
    theme: z.string(),
    isStepUp: z.boolean(),
  })
  .partial() satisfies ToZodObject<LogtoUiCookie>;
