import { z } from "zod";

/**
 * WeChat mini program connector configuration guard.
 */
export const configGuard = z.object({
  appid: z.string(),
  secret: z.string(),
  mode: z.enum(["openid", "unionid"]).default("openid"),
});

export type Config = z.infer<typeof configGuard>;
