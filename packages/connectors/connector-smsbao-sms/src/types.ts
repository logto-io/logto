import { z } from 'zod';

import { templateTypeGuard } from '@logto/connector-kit';

const templateGuard = z.object({
  usageType: templateTypeGuard,
  content: z.string().min(1),
});

export const smsbaoSmsConfigGuard = z.object({
  username: z.string().min(1),
  passwordOrApiKey: z.string().min(1),
  goodsId: z.string().min(1).optional(),
  templates: z.array(templateGuard).min(1),
});

export type SmsbaoSmsConfig = z.infer<typeof smsbaoSmsConfigGuard>;
