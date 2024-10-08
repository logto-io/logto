import { type JsonObject, type RequestErrorBody } from '@logto/schemas';
import { trySafe } from '@silverhand/essentials';
import { HTTPError } from 'ky';
import { useCallback, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

import useApi from '@/hooks/use-api';
import { type JwtCustomizerForm } from '@/pages/CustomizeJwtDetails/type';
import { formatFormDataToTestRequestPayload } from '@/pages/CustomizeJwtDetails/utils/format';

const testEndpointPath = 'api/configs/jwt-customizer/test';
const jwtCustomizerGeneralErrorCode = 'jwt_customizer.general';
const apiInvalidInputErrorCode = 'guard.invalid_input';

export type TestResultData = {
  error?: string;
  payload?: string;
};

const useTestHandler = () => {
  const [testResult, setTestResult] = useState<TestResultData>();
  const [isLoading, setIsLoading] = useState(false);
  const { getValues } = useFormContext<JwtCustomizerForm>();
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

          // Get error message from cloud connection client.
          if (errorResponse.code === jwtCustomizerGeneralErrorCode) {
            const result = z
              .object({ message: z.string(), code: z.string().optional() })
              .safeParse(errorResponse.data);

            if (result.success) {
              setTestResult({
                error: JSON.stringify(result.data, null, 2),
              });
              return;
            }
          }

          /**
           * Get error message when the API request violates the request guard.
           * Find details on the implementation of:
           * 1. `RequestError`
           * 2. `koaGuard`
           */
          if (errorResponse.code === apiInvalidInputErrorCode) {
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
