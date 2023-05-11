import { type Hook } from '@logto/schemas';

import { type BasicWebhookFormType } from '../Webhooks/types';

export type WebhookDetailsOutletContext = {
  hook: Hook;
  isDeleting: boolean;
  onHookUpdated: (hook?: Hook) => void;
};

type HeaderField = {
  key: string;
  value: string;
};

export type WebhookDetailsFormType = BasicWebhookFormType & { headers?: HeaderField[] };
