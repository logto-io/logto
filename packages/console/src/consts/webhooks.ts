import { type AdminConsoleKey } from '@logto/phrases';
import { HookEvent } from '@logto/schemas';
import { yes } from '@silverhand/essentials';

type HookEventLabel = {
  [key in HookEvent]: AdminConsoleKey;
};

export const hookEventLabel = Object.freeze({
  [HookEvent.PostRegister]: 'webhooks.events.post_register',
  [HookEvent.PostResetPassword]: 'webhooks.events.post_reset_password',
  [HookEvent.PostSignIn]: 'webhooks.events.post_sign_in',
}) satisfies HookEventLabel;

export const isHookFeatureEnabled = yes(process.env.HOOK_FEATURE_ENABLED);
