import { type selfHostedLicensesRouter } from '@logto/cloud/routes';
import { noop } from '@silverhand/essentials';
import Client from '@withtyped/client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { toastResponseError, useCloudApi } from '@/cloud/hooks/use-cloud-api';
import { useSelfHostedLicenses } from '@/cloud/hooks/use-self-hosted-licenses';
import { GlobalRoute } from '@/contexts/TenantsProvider';
import { useBillingCustomerChoice } from '@/hooks/use-billing-customer-choice';

import {
  cancelPurchase,
  PurchaseTimeoutError,
  startPurchase,
  waitForActivation,
  type PurchaseResult,
} from './checkout';

/** The query parameter Stripe returns with, and that purchase links open the flow with. */
const checkoutSearchKey = 'checkout';
const sessionIdSearchKey = 'sessionId';
const checkoutEntryValue = 'self-hosted-pro';

type PurchaseStatus = 'idle' | 'subscribing' | 'canceling' | 'activating' | 'processing';

const isAbortError = (error: unknown) =>
  error instanceof DOMException && error.name === 'AbortError';

export const useLicensePurchase = (userId: string) => {
  const { t } = useTranslation(undefined, {
    keyPrefix: 'admin_console.cloud.self_hosted_licenses.purchase',
  });
  const api = useCloudApi<typeof selfHostedLicensesRouter>({ hideErrorToast: true });
  const { chooseBillingCustomer } = useBillingCustomerChoice();
  const { mutate } = useSelfHostedLicenses();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [status, setStatus] = useState<PurchaseStatus>('idle');
  const [isCardOpen, setIsCardOpen] = useState(
    () => searchParams.get(checkoutSearchKey) === checkoutEntryValue
  );
  /** The paid session to retry activation for after a timeout. */
  const [paidSessionId, setPaidSessionId] = useState<string>();
  const busy = useRef(false);
  const controller = useRef<AbortController>();

  useEffect(
    () => () => {
      controller.current?.abort();
    },
    []
  );

  const getApi = useCallback(
    (key: string) =>
      new Client<typeof selfHostedLicensesRouter>({
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

  /** Drop the return parameters and keep everything else, such as `utm_*`. */
  const clearCheckoutSearch = useCallback(() => {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.delete(checkoutSearchKey);
        next.delete(sessionIdSearchKey);
        return next;
      },
      { replace: true }
    );
  }, [setSearchParams]);

  /** Serialize purchase actions; a newer action supersedes the polls of an older one. */
  const runExclusive = useCallback(async (action: (signal: AbortSignal) => Promise<void>) => {
    if (busy.current) {
      return;
    }
    // eslint-disable-next-line @silverhand/fp/no-mutation -- Lock before React renders the busy state.
    busy.current = true;
    const current = new AbortController();
    // eslint-disable-next-line @silverhand/fp/no-mutation -- Let unmounting cancel the polls.
    controller.current = current;
    try {
      await action(current.signal);
    } finally {
      // eslint-disable-next-line @silverhand/fp/no-mutation -- Release the lock after settlement.
      busy.current = false;
    }
  }, []);

  const activate = useCallback(
    async (sessionId: string, signal: AbortSignal) => {
      setStatus('activating');
      setPaidSessionId(sessionId);
      try {
        const result = await waitForActivation(userId, sessionId, api, signal);
        if (result.status === 'expired') {
          setStatus('idle');
          setPaidSessionId(undefined);
          clearCheckoutSearch();
          toast.error(t('checkout_expired'));
          return;
        }
        await mutate().catch(noop);
        navigate(`${GlobalRoute.SelfHostedLicenses}/${result.licenseId}`);
      } catch (error: unknown) {
        if (isAbortError(error)) {
          return;
        }
        // Keep the saved purchase: the payment may still complete, and retry polls it again.
        setStatus('processing');
        if (!(error instanceof PurchaseTimeoutError)) {
          await toastResponseError(error);
        }
      }
    },
    [api, clearCheckoutSearch, mutate, navigate, t, userId]
  );

  const handleResult = useCallback(
    async (result: PurchaseResult, signal: AbortSignal) => {
      if (result.status === 'redirect') {
        // Keep the busy state until the browser leaves for Stripe.
        window.location.assign(result.redirectUri);
        return;
      }
      if (result.status === 'paid') {
        await activate(result.sessionId, signal);
        return;
      }
      setStatus('idle');
      if (result.status === 'expired') {
        toast.error(t('checkout_expired'));
      }
    },
    [activate, t]
  );

  const subscribe = useCallback(async () => {
    await runExclusive(async (signal) => {
      setStatus('subscribing');
      try {
        await handleResult(await startPurchase(userId, getApi, chooseBillingCustomer), signal);
      } catch (error: unknown) {
        setStatus('idle');
        await toastResponseError(error);
      }
    });
  }, [chooseBillingCustomer, getApi, handleResult, runExclusive, userId]);

  const retryActivation = useCallback(async () => {
    if (!paidSessionId) {
      return;
    }
    await runExclusive(async (signal) => activate(paidSessionId, signal));
  }, [activate, paidSessionId, runExclusive]);

  const checkout = searchParams.get(checkoutSearchKey);
  const returnedSessionId = searchParams.get(sessionIdSearchKey);
  const handledReturn = useRef<string>();

  useEffect(() => {
    const returnKey = `${checkout ?? ''}:${returnedSessionId ?? ''}`;
    if (handledReturn.current === returnKey) {
      return;
    }
    // eslint-disable-next-line @silverhand/fp/no-mutation -- Handle each return once, not on every render.
    handledReturn.current = returnKey;

    if (checkout === 'success' && returnedSessionId) {
      // Keep the parameters until activation, so a reload while waiting resumes the check.
      void runExclusive(async (signal) => activate(returnedSessionId, signal));
      return;
    }

    if (checkout === 'cancel') {
      void runExclusive(async (signal) => {
        setStatus('canceling');
        try {
          const result = await cancelPurchase(userId, getApi);
          clearCheckoutSearch();
          await handleResult(result, signal);
        } catch (error: unknown) {
          setStatus('idle');
          clearCheckoutSearch();
          await toastResponseError(error);
        }
      });
      return;
    }

    if (checkout === checkoutEntryValue) {
      setIsCardOpen(true);
      clearCheckoutSearch();
    }
  }, [
    activate,
    checkout,
    clearCheckoutSearch,
    getApi,
    handleResult,
    returnedSessionId,
    runExclusive,
    userId,
  ]);

  return {
    status,
    isCardOpen,
    openCard: useCallback(() => {
      setIsCardOpen(true);
    }, []),
    closeCard: useCallback(() => {
      setIsCardOpen(false);
    }, []),
    subscribe,
    retryActivation,
  };
};
