import { z } from 'zod';

import { templateTypeGuard } from '@logto/connector-kit';

const templateGuard = z.object({
  usageType: templateTypeGuard,
  content: z.string(),
});

export const smsbaoSmsConfigGuard = z.object({
  username: z.string(),
  passwordOrApiKey: z.string(),
  goodsId: z.string().optional(),
  templates: z.array(templateGuard),
});

export type SmsbaoSmsConfig = z.infer<typeof smsbaoSmsConfigGuard>;
