import { z } from 'zod';

export const appleConfigGuard = z.object({
  clientId: z.string(),
  scope: z.string().optional(),
});

export type AppleConfig = z.infer<typeof appleConfigGuard>;

const stringToJson = () =>
  z.string().transform((value, ctx): z.ZodType<JSON> => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return JSON.parse(value);
    } catch {
      ctx.addIssue({ code: 'custom', message: 'Invalid JSON' });
      return z.NEVER;
    }
  });

// https://developer.apple.com/documentation/sign_in_with_apple/sign_in_with_apple_js/configuring_your_webpage_for_sign_in_with_apple#3331292
// https://developer.apple.com/documentation/sign_in_with_apple/sign_in_with_apple_js/incorporating_sign_in_with_apple_into_other_platforms#3332113
export const dataGuard = z.object({
  id_token: z.string(),
  user: stringToJson()
    .pipe(
      z
        .object({
          name: z
            .object({
              firstName: z.string(),
              lastName: z.string(),
            })
            .partial(),
          email: z.string(),
        })
        .partial()
    )
    .optional(),
});
