import { z } from 'zod';

export enum SocialProvider {
  Google = 'google',
  GitHub = 'github',
  Discord = 'discord',
}

export const socialDemoConfigGuard = z.object({
  provider: z.nativeEnum(SocialProvider),
  clientId: z.string(),
  redirectUri: z.string(),
});

export type SocialDemoConfig = z.infer<typeof socialDemoConfigGuard>;
