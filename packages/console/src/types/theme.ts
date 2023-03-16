import { z } from 'zod';

export enum Theme {
  Light = 'light',
  Dark = 'dark',
}

export const appearanceModeGuard = z.nativeEnum(Theme).or(z.literal('system'));

export type AppearanceMode = z.infer<typeof appearanceModeGuard>;
