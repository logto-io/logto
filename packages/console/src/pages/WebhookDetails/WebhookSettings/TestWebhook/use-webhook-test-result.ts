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

const getStorageKey = (hookId: string) => `${storageKeys.webhookTestResult}:${hookId}`;

const readResult = (hookId: string) => {
  const parsedJson = safeParseJson(
    conditionalString(sessionStorage.getItem(getStorageKey(hookId)))
  );

  return conditional(parsedJson.success && webhookTestResultGuard.parse(parsedJson.data));
};

const useWebhookTestResult = (hookId: string) => {
  const [testResult, setTestResult] = useState<WebhookTestResult | undefined>(() =>
    readResult(hookId)
  );

  return {
    result: testResult,
    setResult: (result?: WebhookTestResult) => {
      setTestResult(result);
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
