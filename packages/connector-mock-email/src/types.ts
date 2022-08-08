import { z } from 'zod';

export enum ContextType {
  Text = 'text/plain',
  Html = 'text/html',
}

const templateGuard = z.object({
  usageType: z.string(),
  type: z.nativeEnum(ContextType),
  subject: z.string(),
  content: z.string(), // With variable {{code}}, support HTML
});

export const mockMailConfigGuard = z.object({
  apiKey: z.string(),
  fromEmail: z.string(),
  fromName: z.string().optional(),
  templates: z.array(templateGuard),
});

export type MockMailConfig = z.infer<typeof mockMailConfigGuard>;
