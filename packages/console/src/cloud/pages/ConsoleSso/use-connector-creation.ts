import { type consoleSsoRouter } from '@logto/cloud/routes';
import { type SsoProviderName } from '@logto/schemas';
import Client from '@withtyped/client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSWRConfig } from 'swr';

import { toastResponseError, useCloudApi } from '@/cloud/hooks/use-cloud-api';

import {
  clearPendingConnectorCreation,
  getOrCreatePendingConnectorCreation,
  getPendingConnectorCreationStorageKey,
  isPendingConnectorCreationCurrent,
  readPendingConnectorCreation,
  type PendingConnectorCreation,
} from './connector-creation-idempotency';
import {
  abandonConnectorCreation,
  continueConnectorCreation,
  selectCreationFunding,
} from './creation-billing';
import { useConsoleSsoConnectors } from './use-console-sso';
import { useCreationBilling } from './use-creation-billing';

const paymentCheckingInterval = 1000;
const paymentCheckingTimeout = 60 * 1000;

export const useConnectorCreation = (userId: string, onClose: (id?: string) => void) => {
  const api = useCloudApi<typeof consoleSsoRouter>({ hideErrorToast: true });
  const { mutate } = useConsoleSsoConnectors();
  const [operation, setOperation] = useState(() => readPendingConnectorCreation(userId));
  const billing = useCreationBilling(operation);
  const { mutate: mutateCache } = useSWRConfig();
  const [status, setStatus] = useState<
    'open' | 'expired' | 'payment_pending' | 'payment_received' | 'error'
  >();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const busy = useRef(false);
  const mounted = useRef(false);
  const isMounted = useCallback(() => mounted.current, []);
  useEffect(() => {
    // eslint-disable-next-line @silverhand/fp/no-mutation -- Track whether async results still have a modal.
    mounted.current = true;
    return () => {
      // eslint-disable-next-line @silverhand/fp/no-mutation -- Ignore callbacks after the modal closes.
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (
        event.storageArea === localStorage &&
        (event.key === null || event.key === getPendingConnectorCreationStorageKey(userId)) &&
        operation &&
        !isPendingConnectorCreationCurrent(userId, operation)
      ) {
        setStatus('error');
        onClose();
      }
    };
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('storage', onStorage);
    };
  }, [onClose, operation, userId]);
  const syncOperation = useCallback(
    (key: string) => {
      const current = readPendingConnectorCreation(userId);
      if (current && current.key !== key) {
        setStatus('error');
        onClose();
        return;
      }
      setOperation(current);
    },
    [onClose, userId]
  );
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
    await Promise.allSettled([
      mutate(),
      mutateCache(['console-sso-coverage', userId], undefined, true),
    ]);
  }, [mutate, mutateCache, userId]);
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
        if (!isMounted()) {
          return;
        }
        if (!isPendingConnectorCreationCurrent(userId, result.operation)) {
          setStatus('error');
          onClose();
          return;
        }
        if (result.status === 'created') {
          clearPendingConnectorCreation(userId);
          await refresh();
          if (isMounted() && !readPendingConnectorCreation(userId)) {
            onClose(result.id);
          }
        } else {
          setStatus((previous) => (!redirect && previous === 'error' ? previous : result.status));
          if (redirect && result.status === 'open' && result.redirectUri) {
            window.location.assign(result.redirectUri);
          }
        }
      } catch (error) {
        if (!isMounted()) {
          return;
        }
        if (error instanceof DOMException && error.name === 'AbortError') {
          setStatus('error');
          onClose();
          return;
        }
        setStatus('error');
        await refresh();
        await toastResponseError(error);
      } finally {
        if (isMounted()) {
          syncOperation(current.key);
          setIsSubmitting(false);
        }
        // eslint-disable-next-line @silverhand/fp/no-mutation -- Release the action lock after completion.
        busy.current = false;
      }
    },
    [getApi, isMounted, onClose, refresh, syncOperation, userId]
  );

  useEffect(() => {
    if (
      !operation?.sessionId ||
      Boolean(operation.subscriptionId) ||
      isSubmitting ||
      (status !== undefined && status !== 'payment_pending')
    ) {
      return;
    }
    const timeout = window.setTimeout(
      () => {
        void run(operation, false);
      },
      status === undefined ? 0 : paymentCheckingInterval
    );
    return () => {
      window.clearTimeout(timeout);
    };
  }, [isSubmitting, operation, run, status]);

  useEffect(() => {
    if (status !== 'payment_pending') {
      return;
    }
    const timeout = window.setTimeout(() => {
      // Preserve recovery and let the existing create button retry after a slow payment.
      setStatus('error');
    }, paymentCheckingTimeout);
    return () => {
      window.clearTimeout(timeout);
    };
  }, [operation?.key, operation?.sessionId, status]);

  const create = async (providerName: SsoProviderName) => {
    if (busy.current || !billing.isBillingReady || billing.billingError) {
      return;
    }
    try {
      const current = selectCreationFunding(
        userId,
        getOrCreatePendingConnectorCreation(userId, providerName),
        { funding: billing.funding }
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
      if (!isMounted()) {
        return;
      }
      setStatus(result.status === 'abandoned' ? undefined : result.status);
    } catch (error) {
      if (!isMounted()) {
        return;
      }
      if (error instanceof DOMException && error.name === 'AbortError') {
        setStatus('error');
        onClose();
        return;
      }
      setStatus('error');
      await toastResponseError(error);
    } finally {
      if (isMounted()) {
        syncOperation(operation.key);
      }
      await refresh();
      if (isMounted()) {
        setIsSubmitting(false);
      }
      // eslint-disable-next-line @silverhand/fp/no-mutation -- Release the action lock after completion.
      busy.current = false;
    }
  };
  return { operation, status, isSubmitting, create, startOver, billing };
};
