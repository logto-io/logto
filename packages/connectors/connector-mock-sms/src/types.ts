import { z } from 'zod';

const templateGuard = z.object({
  usageType: z.string(),
  content: z.string(),
});

export const mockSmsConfigGuard = z.object({
  accountSID: z.string(),
  authToken: z.string(),
  fromMessagingServiceSID: z.string(),
  templates: z.array(templateGuard),
});

export type MockSmsConfig = z.infer<typeof mockSmsConfigGuard>;
