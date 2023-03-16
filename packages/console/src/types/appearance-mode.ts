import { Theme } from '@logto/schemas';
import { z } from 'zod';

export enum DynamicAppearanceMode {
  System = 'system',
}

export const appearanceModeGuard = z.nativeEnum(Theme).or(z.nativeEnum(DynamicAppearanceMode));

export type AppearanceMode = z.infer<typeof appearanceModeGuard>;
