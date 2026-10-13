import { type consoleSsoRouter } from '@logto/cloud/routes';
import { type SsoProviderName } from '@logto/schemas';
import Client from '@withtyped/client';
import { useCallback, useEffect, useRef, useState } from 'react';

import { toastResponseError, useCloudApi } from '@/cloud/hooks/use-cloud-api';

import {
  clearPendingConnectorCreation,
  getOrCreatePendingConnectorCreation,
  readPendingConnectorCreation,
  type PendingConnectorCreation,
} from './connector-creation-idempotency';
import {
  abandonConnectorCreation,
  continueConnectorCreation,
  selectCreationFunding,
  type CreationFunding,
} from './creation-billing';
import { useConsoleSsoConnectors } from './use-console-sso';
import { useCreationBilling } from './use-creation-billing';

export const useConnectorCreation = (userId: string, onCreated: (id: string) => void) => {
  const api = useCloudApi<typeof consoleSsoRouter>({ hideErrorToast: true });
  const { mutate } = useConsoleSsoConnectors();
  const [operation, setOperation] = useState(() => readPendingConnectorCreation(userId));
  const billing = useCreationBilling(operation);
  const { mutate: mutatePreview } = billing.preview;
  const { mutate: mutateCoverage } = billing.coverage;
  const [status, setStatus] = useState<
    'open' | 'expired' | 'payment_pending' | 'payment_received' | 'error'
  >();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const busy = useRef(false);
  const getApi = useCallback(
    (key: string) =>
      new Client<typeof consoleSsoRouter>({
        ...api.config,
        headers: async (url, method) => ({
          ...(typeof api.config.headers === 'function'
            ? await api.config.headers(url, method)
            : api.config.headers),
          'Idempotency-Key': key,
        }),
      }),
    [api]
  );
  const refresh = useCallback(async () => {
    await Promise.allSettled([mutate(), mutatePreview(), mutateCoverage()]);
  }, [mutate, mutatePreview, mutateCoverage]);
  const run = useCallback(
    async (current: PendingConnectorCreation, redirect: boolean) => {
      if (busy.current) {
        return;
      }
      // eslint-disable-next-line @silverhand/fp/no-mutation -- Serialize billing actions between renders.
      busy.current = true;
      setIsSubmitting(true);
      try {
        const result = await continueConnectorCreation(userId, current, getApi, redirect);
        if (result.status === 'created') {
          clearPendingConnectorCreation(userId);
          await refresh();
          onCreated(result.id);
        } else {
          setStatus(result.status);
          if (redirect && result.status === 'open' && result.redirectUri) {
            window.location.assign(result.redirectUri);
          }
        }
      } catch (error) {
        setStatus('error');
        await refresh();
        await toastResponseError(error);
      } finally {
        setOperation(readPendingConnectorCreation(userId));
        setIsSubmitting(false);
        // eslint-disable-next-line @silverhand/fp/no-mutation -- Release the action lock after completion.
        busy.current = false;
      }
    },
    [getApi, onCreated, refresh, userId]
  );

  useEffect(() => {
    if (
      !operation?.sessionId ||
      Boolean(operation.subscriptionId) ||
      isSubmitting ||
      status === 'expired' ||
      status === 'error'
    ) {
      return;
    }
    const timeout = window.setTimeout(() => {
      void run(operation, false);
    }, 5000);
    return () => {
      window.clearTimeout(timeout);
    };
  }, [isSubmitting, operation, run, status]);

  const create = async (providerName: SsoProviderName, funding: CreationFunding) => {
    if (busy.current) {
      return;
    }
    try {
      const current = selectCreationFunding(
        userId,
        getOrCreatePendingConnectorCreation(userId, providerName),
        funding
      );
      setOperation(current);
      await run(current, true);
    } catch (error) {
      await toastResponseError(error);
    }
  };
  const startOver = async () => {
    if (!operation || busy.current) {
      return;
    }
    // eslint-disable-next-line @silverhand/fp/no-mutation -- Serialize billing actions between renders.
    busy.current = true;
    setIsSubmitting(true);
    try {
      const result = await abandonConnectorCreation(userId, operation, getApi);
      setStatus(result.status === 'abandoned' ? undefined : result.status);
    } catch (error) {
      await toastResponseError(error);
    } finally {
      setOperation(readPendingConnectorCreation(userId));
      await refresh();
      setIsSubmitting(false);
      // eslint-disable-next-line @silverhand/fp/no-mutation -- Release the action lock after completion.
      busy.current = false;
    }
  };
  return { operation, status, isSubmitting, create, startOver, billing };
};
