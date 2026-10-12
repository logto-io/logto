import { type Nullable } from '@silverhand/essentials';
import { HTTPError } from 'ky';
import { useCallback, useEffect, useState } from 'react';
import useSWR from 'swr';

import { isCloud } from '@/consts/env';
import { type License } from '@/types/license';
import { getEffectiveLicenseQuota } from '@/utils/license';
import { shouldRetryOnError } from '@/utils/request';

import useApi, { RequestError } from './use-api';

const licenseApiPath = 'api/systems/license';

/**
 * Read the license installed on this self-hosted deployment.
 *
 * No license is a normal state rather than an error, so a `404` resolves to `null` instead of being
 * retried or toasted. Any other failure leaves the license unknown, which puts the deployment on the
 * OSS defaults rather than blocking Console; the license page is where a problem is shown.
 */
const useLicense = () => {
  const api = useApi({ hideErrorToast: true });

  const fetcher = useCallback(async (): Promise<Nullable<License>> => {
    try {
      return await api.get(licenseApiPath).json<License>();
    } catch (error: unknown) {
      if (!(error instanceof HTTPError)) {
        throw error;
      }

      if (error.response.status === 404) {
        return null;
      }

      throw new RequestError(error.response.status);
    }
  }, [api]);

  const { data, error, isLoading, mutate } = useSWR<Nullable<License>, RequestError>(
    // Cloud uses its subscription instead, and the license route returns 501 there.
    !isCloud && licenseApiPath,
    fetcher,
    { shouldRetryOnError: shouldRetryOnError({ ignore: [401, 403] }) }
  );

  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    const remaining = data ? Date.parse(data.graceEndsAt) - Date.now() : 0;

    if (remaining <= 0) {
      return;
    }

    // A grace period can exceed the browser's signed 32-bit timeout limit. Re-arm if needed.
    const timer = window.setTimeout(
      () => {
        setNow(Date.now());
      },
      Math.min(remaining, 2_147_483_647)
    );

    return () => {
      window.clearTimeout(timer);
    };
  }, [data, now]);

  return {
    license: data ?? undefined,
    licenseQuota: getEffectiveLicenseQuota(data ?? undefined),
    // A retry after a failure is not the first load and must not send Console back to its loading
    // screen.
    isLoading: isLoading && !error,
    mutate,
  };
};

export default useLicense;
