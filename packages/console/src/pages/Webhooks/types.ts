import { type Hook, type HookConfig, type HookEvent } from '@logto/schemas';

export type BasicWebhookFormType = {
  name: Hook['name'];
  events: HookEvent[];
  url: HookConfig['url'];
};
