import * as s from 'superstruct';

export const locationStateGuard = s.object({
  email: s.string(),
  action: s.union([s.literal('changeEmail'), s.literal('changePassword')]),
});

export type LocationState = s.Infer<typeof locationStateGuard>;
