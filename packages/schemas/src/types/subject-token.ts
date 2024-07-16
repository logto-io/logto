import { number, object, string, type z } from 'zod';

export const subjectTokenResponseGuard = object({
  subjectToken: string(),
  expiresIn: number(),
});

export type SubjectTokenResponse = z.infer<typeof subjectTokenResponseGuard>;
