import { type HookResponse, type Hook } from '@logto/schemas';

import { type BasicWebhookFormType } from '@/components/BasicWebhookForm';

export type WebhookDetailsOutletContext = {
  hook: HookResponse;
  isDeleting: boolean;
  onHookUpdated: (hook?: Hook) => void;
};

type HeaderField = {
  key: string;
  value: string;
};

export type WebhookDetailsFormType = BasicWebhookFormType & { headers?: HeaderField[] };
