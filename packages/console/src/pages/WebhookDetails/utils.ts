import { type Hook } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';

import { type WebhookDetailsFormType } from './types';

export const webhookDetailsParser = {
  toLocalForm: (data: Hook): WebhookDetailsFormType => {
    const {
      event,
      events,
      name,
      config: { url, headers },
    } = data;

    return {
      events: conditional(events.length > 0 && events) ?? (event ? [event] : []),
      name,
      url,
      headers,
    };
  },
  toRemoteModel: (formData: WebhookDetailsFormType): Partial<Hook> => {
    const { name, events, url, headers } = formData;

    return {
      name,
      events,
      config: {
        url,
        headers,
      },
    };
  },
};
