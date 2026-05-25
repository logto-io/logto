import { z } from 'zod';

const templateGuard = z.object({
  usageType: z.string(),
  content: z.string(),
});

export const smsbaoSmsConfigGuard = z.object({
  username: z.string(),
  passwordOrApiKey: z.string(),
  goodsId: z.string().optional(),
  templates: z.array(templateGuard),
});

export type SmsbaoSmsConfig = z.infer<typeof smsbaoSmsConfigGuard>;
