import * as s from 'superstruct';

export const locationStateGuard = s.object({
  email: s.string(),
  action: s.union([s.literal('changeEmail'), s.literal('changePassword')]),
});

export type LocationState = s.Infer<typeof locationStateGuard>;

export const socialUserInfoGuard = s.object({
  id: s.string(),
  name: s.string(),
  email: s.string(),
  avatar: s.string(),
});

export type SocialUserInfo = s.Infer<typeof socialUserInfoGuard>;
