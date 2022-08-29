import * as s from 'superstruct';

export const bindSocialStateGuard = s.object({
  relatedUser: s.optional(s.string()),
});

export const passcodeStateGuard = s.object({
  email: s.optional(s.string()),
  sms: s.optional(s.string()),
});

export const passcodeMethodGuard = s.union([s.literal('email'), s.literal('sms')]);
