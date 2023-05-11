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

    const headerFields = conditional(
      headers && Object.entries(headers).map(([key, value]) => ({ key, value }))
    );

    return {
      events: conditional(events.length > 0 && events) ?? (event ? [event] : []),
      name,
      url,
      headers: headerFields,
    };
  },
  toRemoteModel: (formData: WebhookDetailsFormType): Partial<Hook> => {
    const { name, events, url, headers } = formData;

    const headersObject = conditional(
      headers &&
        Object.fromEntries(
          headers.filter(({ key, value }) => key && value).map(({ key, value }) => [key, value])
        )
    );

    return {
      name,
      events,
      config: {
        url,
        headers: headersObject,
      },
    };
  },
};
