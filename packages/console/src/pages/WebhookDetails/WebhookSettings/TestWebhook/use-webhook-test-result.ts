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

const readResult = () => {
  const parsedJson = safeParseJson(
    conditionalString(sessionStorage.getItem(storageKeys.webhookTestResult))
  );

  return conditional(parsedJson.success && webhookTestResultGuard.parse(parsedJson.data));
};

const useWebhookTestResult = () => {
  const [testResult, setTestResult] = useState<WebhookTestResult | undefined>(readResult());

  return {
    result: testResult,
    setResult: (result?: WebhookTestResult) => {
      setTestResult(result);
      if (result) {
        sessionStorage.setItem(storageKeys.webhookTestResult, JSON.stringify(result));
      } else {
        sessionStorage.removeItem(storageKeys.webhookTestResult);
      }
    },
  };
};

export default useWebhookTestResult;
