import { type JsonObject, type RequestErrorBody } from '@logto/schemas';
import { trySafe } from '@silverhand/essentials';
import { HTTPError } from 'ky';
import { useCallback, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

import useApi from '@/hooks/use-api';

import { type InlineHookForm } from '../../type';
import { formatFormDataToTestRequestPayload } from '../../utils/format';

const testEndpointPath = 'api/configs/inline-hooks/test';
const inlineHookGeneralErrorCode = 'inline_hook.general';
const apiInvalidInputErrorCode = 'guard.invalid_input';

export type TestResultData = {
  error?: string;
  payload?: string;
};

const useTestHandler = () => {
  const [testResult, setTestResult] = useState<TestResultData>();
  const [isLoading, setIsLoading] = useState(false);
  const { getValues } = useFormContext<InlineHookForm>();
  const api = useApi({ hideErrorToast: true });

  const onTestHandler = useCallback(async () => {
    const payload = getValues();
    setIsLoading(true);

    const result = await api
      .post(testEndpointPath, {
        json: formatFormDataToTestRequestPayload(payload),
      })
      .json<JsonObject>()
      .catch(async (error: unknown) => {
        if (error instanceof HTTPError) {
          const { response } = error;
          const errorResponse = await response.clone().json<RequestErrorBody>();
          const { code, data } = errorResponse;

          if (code === inlineHookGeneralErrorCode) {
            setTestResult({
              error:
                typeof data === 'string'
                  ? data
                  : trySafe(
                      () => JSON.stringify(data, null, 2),
                      () => String(data)
                    ),
            });
            return;
          }

          if (code === apiInvalidInputErrorCode) {
            const result = z.string().safeParse(errorResponse.details);
            if (result.success) {
              setTestResult({
                error: result.data,
              });
              return;
            }
          }

          setTestResult({
            error: trySafe(
              () => JSON.stringify(errorResponse, null, 2),
              () => errorResponse.message
            ),
          });

          return;
        }

        setTestResult({
          error: error instanceof Error ? error.message : String(error),
        });
      })
      .finally(() => {
        setIsLoading(false);
      });

    if (result) {
      setTestResult({ payload: JSON.stringify(result, null, 2) });
    }
  }, [api, getValues]);

  return { testResult, isLoading, onTestHandler, setTestResult };
};

export default useTestHandler;
