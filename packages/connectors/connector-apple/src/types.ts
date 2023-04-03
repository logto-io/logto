import { z } from 'zod';

export const appleConfigGuard = z.object({
  clientId: z.string(),
});

export type AppleConfig = z.infer<typeof appleConfigGuard>;

// https://developer.apple.com/documentation/sign_in_with_apple/sign_in_with_apple_js/configuring_your_webpage_for_sign_in_with_apple#3331292
export const dataGuard = z.object({
  id_token: z.string(),
});
