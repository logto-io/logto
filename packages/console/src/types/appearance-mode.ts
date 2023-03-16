import { Theme } from '@logto/schemas';
import { z } from 'zod';

export enum ThemePolicy {
  System = 'system',
}

export const appearanceModeGuard = z.nativeEnum(Theme).or(z.nativeEnum(ThemePolicy));

export type AppearanceMode = z.infer<typeof appearanceModeGuard>;
