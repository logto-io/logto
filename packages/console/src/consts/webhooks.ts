import { type AdminConsoleKey } from '@logto/phrases';
import { HookEvent, type LogKey } from '@logto/schemas';

type HookEventLabel = {
  [key in HookEvent]: AdminConsoleKey;
};

export const hookEventLabel = Object.freeze({
  [HookEvent.PostRegister]: 'webhooks.events.post_register',
  [HookEvent.PostResetPassword]: 'webhooks.events.post_reset_password',
  [HookEvent.PostSignIn]: 'webhooks.events.post_sign_in',
}) satisfies HookEventLabel;

type HookEventLogKey = {
  [key in HookEvent]: LogKey;
};

export const hookEventLogKey = Object.freeze({
  [HookEvent.PostRegister]: 'TriggerHook.PostRegister',
  [HookEvent.PostResetPassword]: 'TriggerHook.PostResetPassword',
  [HookEvent.PostSignIn]: 'TriggerHook.PostSignIn',
}) satisfies HookEventLogKey;
