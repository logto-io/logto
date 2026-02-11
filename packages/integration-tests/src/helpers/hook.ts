import {
  InteractionHookEvent,
  type CreateHook,
  type Hook,
  type HookConfig,
  type HookEvent,
} from '@logto/schemas';

import { authedAdminApi } from '#src/api/api.js';
import { isDevFeaturesEnabled } from '#src/constants.js';

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

export const getSupportedHookEvents = (events: HookEvent[]): HookEvent[] =>
  isDevFeaturesEnabled
    ? events
    : events.filter((event) => event !== InteractionHookEvent.PostSignInAdaptiveMfaTriggered);

export class WebHookApiTest {
  readonly #hooks = new Map<string, Hook>();

  get hooks(): Map<string, Hook> {
    return this.#hooks;
  }

  async create(json: Omit<CreateHook, 'id'>): Promise<Hook> {
    const hook = await authedAdminApi.post('hooks', { json }).json<Hook>();
    this.#hooks.set(hook.name, hook);

    return hook;
  }

  async delete(name: string): Promise<void> {
    const hook = this.#hooks.get(name);

    if (hook) {
      await authedAdminApi.delete(`hooks/${hook.id}`);
      this.#hooks.delete(name);
    }
  }

  async cleanUp(): Promise<void> {
    await Promise.all(Array.from(this.#hooks.keys()).map(async (name) => this.delete(name)));
  }
}
