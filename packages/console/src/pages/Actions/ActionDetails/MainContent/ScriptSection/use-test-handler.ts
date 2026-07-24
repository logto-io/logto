import { type Json, type RequestErrorBody } from '@logto/schemas';
import { trySafe } from '@silverhand/essentials';
import { HTTPError } from 'ky';
import { useCallback, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

import useApi from '@/hooks/use-api';

import { type ActionForm } from '../../type';
import { formatFormDataToTestRequestPayload } from '../../utils/format';

const testEndpointPath = 'api/configs/actions/test';
const actionGeneralErrorCode = 'action.general';
const apiInvalidInputErrorCode = 'guard.invalid_input';

export type TestResultData = {
  error?: string;
  payload?: string;
};

const formatTestResult = (result: unknown) =>
  result === undefined ? 'undefined' : JSON.stringify(result, null, 2);

const useTestHandler = () => {
  const [testResult, setTestResult] = useState<TestResultData>();
  const [isLoading, setIsLoading] = useState(false);
  const { getValues, trigger } = useFormContext<ActionForm>();
  const api = useApi({ hideErrorToast: true });

  const onTestHandler = useCallback(async () => {
    // Dry-run should use the same field rules as save, otherwise invalid JSON /
    // incomplete env rows can still be posted after silent formatting.
    const isValid = await trigger(['contextSample', 'environmentVariables']);

    if (!isValid) {
      return;
    }

    const payload = getValues();
    setIsLoading(true);

    await api
      .post(testEndpointPath, {
        json: formatFormDataToTestRequestPayload(payload),
      })
      .then(async (response) => {
        const result = response.status === 204 ? undefined : await response.json<Json>();

        setTestResult({ payload: formatTestResult(result) });
      })
      .catch(async (error: unknown) => {
        if (error instanceof HTTPError) {
          const { response } = error;
          const errorResponse = await response.clone().json<RequestErrorBody>();
          const { code, data } = errorResponse;

          if (code === actionGeneralErrorCode) {
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
  }, [api, getValues, trigger]);

  return { testResult, isLoading, onTestHandler, setTestResult };
};

export default useTestHandler;
