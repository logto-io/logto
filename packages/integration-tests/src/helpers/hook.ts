import { type Hook, type HookConfig, type HookEvent } from '@logto/schemas';

type HookCreationPayload = Pick<Hook, 'name' | 'events'> & {
  config: HookConfig;
};

export const getHookCreationPayload = (
  event: HookEvent,
  url = 'not_work_url'
): HookCreationPayload => ({
  name: 'hook_name',
  events: [event],
  config: {
    url,
    headers: { foo: 'bar' },
  },
});
