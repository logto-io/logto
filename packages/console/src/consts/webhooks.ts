import { type AdminConsoleKey } from '@logto/phrases';
import { InteractionHookEvent, type LogKey } from '@logto/schemas';

type HookEventLabel = {
  // TODO: Implement all hook events
  [key in InteractionHookEvent]: AdminConsoleKey;
};

export const hookEventLabel = Object.freeze({
  [InteractionHookEvent.PostRegister]: 'webhooks.events.post_register',
  [InteractionHookEvent.PostResetPassword]: 'webhooks.events.post_reset_password',
  [InteractionHookEvent.PostSignIn]: 'webhooks.events.post_sign_in',
}) satisfies HookEventLabel;

type HookEventLogKey = {
  // TODO: Implement all hook events
  [key in InteractionHookEvent]: LogKey;
};

export const hookEventLogKey = Object.freeze({
  [InteractionHookEvent.PostRegister]: 'TriggerHook.PostRegister',
  [InteractionHookEvent.PostResetPassword]: 'TriggerHook.PostResetPassword',
  [InteractionHookEvent.PostSignIn]: 'TriggerHook.PostSignIn',
}) satisfies HookEventLogKey;
