import { type HookConfig, type Hook } from '@logto/schemas';

import { type BasicWebhookFormType } from '../Webhooks/types';

export type WebhookDetailsOutletContext = {
  hook: Hook;
  isDeleting: boolean;
  onHookUpdated: (hook?: Hook) => void;
};

export type WebhookDetailsFormType = BasicWebhookFormType & { headers: HookConfig['headers'] };
