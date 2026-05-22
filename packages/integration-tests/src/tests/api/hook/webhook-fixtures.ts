import {
  hookEventGuard,
  hookEvents,
  jsonGuard,
  managementApiHooksRegistration,
} from '@logto/schemas';
import { z } from 'zod';

import { WebHookApiTest, getSupportedHookEvents } from '#src/helpers/hook.js';
import { waitFor } from '#src/utils.js';

import WebhookMockServer from './WebhookMockServer.js';

export const mockHookResponseGuard = z.object({
  signature: z.string(),
  payload: z
    .object({
      event: hookEventGuard,
      createdAt: z.string(),
      hookId: z.string(),
      data: jsonGuard.optional(),
      method: z
        .string()
        .optional()
        .transform((value) => value?.toUpperCase()),
      matchedRoute: z.string().optional(),
      status: z.number().optional(),
    })
    .catchall(z.any()),
  // Keep the raw payload for signature verification
  rawPayload: z.string(),
});

export type MockHookResponse = z.infer<typeof mockHookResponseGuard>;

export type DataHookFixture = {
  webHookApi: WebHookApiTest;
  hookName: string;
  /** Exposed so tests can `.delete(key)` before asserting "no webhook fired". */
  webhookResults: Map<string, MockHookResponse>;
  getWebhookResult: (key: string) => Promise<MockHookResponse | undefined>;
  start: () => Promise<void>;
  cleanup: () => Promise<void>;
};

/**
 * Webhook fixture for data-hook integration tests. Org and non-org test files share
 * port 9999 — safe because integration tests run with `jest --runInBand`. Use a
 * distinct port if running in parallel workers.
 */
export const createDataHookFixture = (port: number, hookName: string): DataHookFixture => {
  const webhookResults = new Map<string, MockHookResponse>();
  const webHookApi = new WebHookApiTest();

  const webhookResponseHandler = (response: string) => {
    const result = mockHookResponseGuard.parse(JSON.parse(response));
    const { payload } = result;
    if (payload.matchedRoute) {
      webhookResults.set(`${payload.method} ${payload.matchedRoute}`, result);
    }
  };

  /** Webhook delivery is async; sleeps 100ms before reading to let the request land. */
  const getWebhookResult = async (key: string) => {
    await waitFor(100);
    return webhookResults.get(key);
  };

  const webhookServer = new WebhookMockServer(port, webhookResponseHandler);

  const start = async () => {
    await webhookServer.listen();
    await webHookApi.create({
      name: hookName,
      events: getSupportedHookEvents([...hookEvents]),
      config: { url: webhookServer.endpoint },
    });
  };

  const cleanup = async () => {
    await webHookApi.cleanUp();
    await webhookServer.close();
  };

  return { webHookApi, hookName, webhookResults, getWebhookResult, start, cleanup };
};

const organizationEventPrefixes = ['Organization', 'OrganizationRole', 'OrganizationScope'];

const isOrganizationEvent = (event: string): boolean =>
  organizationEventPrefixes.some((prefix) => event.startsWith(prefix));

/**
 * Partition the `managementApiHooksRegistration` keys into organization-related
 * and the rest. Coverage assertions are split between two test files; this
 * partition must stay disjoint and complete — every registered key appears in
 * exactly one bucket.
 */
export const partitionManagementApiHookKeys = (): {
  organizationKeys: string[];
  nonOrganizationKeys: string[];
} => {
  const entries = Object.entries(managementApiHooksRegistration);
  return {
    organizationKeys: entries.filter(([, event]) => isOrganizationEvent(event)).map(([key]) => key),
    nonOrganizationKeys: entries
      .filter(([, event]) => !isOrganizationEvent(event))
      .map(([key]) => key),
  };
};
