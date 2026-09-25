import { conditional, conditionalString } from '@silverhand/essentials';
import { useState } from 'react';
import { z } from 'zod';

import { storageKeys } from '@/consts';
import { safeParseJson } from '@/utils/json';

const webhookTestResultGuard = z.object({
  result: z.enum(['success', 'error']),
  endpointUrl: z.string(),
  requestTime: z.number(),
  message: z.string().optional(),
  responseStatus: z.number().optional(),
  responseBody: z.string().optional(),
});

type WebhookTestResult = z.infer<typeof webhookTestResultGuard>;

type TestResultState = {
  readonly hookId: string;
  readonly result?: WebhookTestResult;
};

const getStorageKey = (hookId: string) => `${storageKeys.webhookTestResult}:${hookId}`;

const readResult = (hookId: string) => {
  const parsedJson = safeParseJson(
    conditionalString(sessionStorage.getItem(getStorageKey(hookId)))
  );

  return conditional(parsedJson.success && webhookTestResultGuard.parse(parsedJson.data));
};

const useWebhookTestResult = (hookId: string) => {
  const [state, setState] = useState<TestResultState>(() => ({
    hookId,
    result: readResult(hookId),
  }));

  if (state.hookId !== hookId) {
    setState({ hookId, result: readResult(hookId) });
  }

  return {
    result: state.result,
    setResult: (result?: WebhookTestResult) => {
      setState({ hookId, result });
      const storageKey = getStorageKey(hookId);
      if (result) {
        sessionStorage.setItem(storageKey, JSON.stringify(result));
      } else {
        sessionStorage.removeItem(storageKey);
      }
    },
  };
};

export default useWebhookTestResult;
