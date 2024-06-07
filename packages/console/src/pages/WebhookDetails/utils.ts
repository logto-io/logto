import { hookEvents, type Hook, type HookEvent, type WebhookLogKey } from '@logto/schemas';
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
      headers: headerFields?.length ? headerFields : [{ key: '', value: '' }],
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
        /**
         * This is for backward compatibility.
         */
        retries: 3,
      },
    };
  },
};

export const buildHookEventLogKey = (event: HookEvent): WebhookLogKey => `TriggerHook.${event}`;

export const isWebhookEventLogKey = (logKey: string): logKey is WebhookLogKey => {
  const [prefix, ...events] = logKey.split('.');

  // eslint-disable-next-line no-restricted-syntax
  return prefix === 'TriggerHook' && hookEvents.includes(events.join('.') as HookEvent);
};

export const getHookEventKey = (logKey: string) => {
  if (!isWebhookEventLogKey(logKey)) {
    return ' - ';
  }

  return logKey.replace('TriggerHook.', '');
};
