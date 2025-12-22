import { z } from 'zod';

import { templateTypeGuard } from '@logto/connector-kit';

const templateGuard = z.object({
  usageType: templateTypeGuard,
  content: z.string(),
});

export const mockSmsConfigGuard = z.object({
  accountSID: z.string(),
  authToken: z.string(),
  fromMessagingServiceSID: z.string(),
  templates: z.array(templateGuard),
});

export type MockSmsConfig = z.infer<typeof mockSmsConfigGuard>;
