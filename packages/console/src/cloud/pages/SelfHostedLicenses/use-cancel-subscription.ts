import { type selfHostedLicensesRouter } from '@logto/cloud/routes';
import { ResponseError } from '@withtyped/client';
import { useCallback, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import {
  toastResponseError,
  tryReadResponseErrorBody,
  useCloudApi,
} from '@/cloud/hooks/use-cloud-api';
import { type SelfHostedLicenseSummary } from '@/cloud/types/router';

/**
 * - `payment_required`: the subscription is `past_due` or `unpaid`; the owner must pay the
 *   outstanding invoice first, so retrying does not help.
 * - `failed`: Stripe did not apply the cancellation; repeating the call is safe.
 */
type CancelSubscriptionError = 'payment_required' | 'failed';

const readErrorCode = async (error: unknown) => {
  if (!(error instanceof ResponseError)) {
    return;
  }
  const body = await tryReadResponseErrorBody(error);
  return body?.error?.code;
};

/** Whether the license has a subscription that can still be set to cancel at period end. */
export const isCancelable = (license: SelfHostedLicenseSummary) =>
  license.status === 'active' &&
  license.subscriptionStatus !== null &&
  license.subscriptionStatus !== 'canceled' &&
  !license.cancelAtPeriodEnd;

export const useCancelSubscription = (
  id: string,
  onCanceled: (license: SelfHostedLicenseSummary) => Promise<unknown>
) => {
  const { t } = useTranslation(undefined, {
    keyPrefix: 'admin_console.cloud.self_hosted_licenses.cancel',
  });
  const api = useCloudApi<typeof selfHostedLicensesRouter>({ hideErrorToast: true });
  const [isCanceling, setIsCanceling] = useState(false);
  const [error, setError] = useState<CancelSubscriptionError>();
  const pending = useRef(false);

  const cancel = useCallback(async () => {
    if (pending.current) {
      return false;
    }
    // eslint-disable-next-line @silverhand/fp/no-mutation -- Lock before React renders the loading state.
    pending.current = true;
    setIsCanceling(true);
    setError(undefined);

    try {
      const license = await api.delete('/api/me/self-hosted-licenses/:id/subscription', {
        params: { id },
      });
      await onCanceled(license);
      toast.success(t('success'));
      return true;
    } catch (error: unknown) {
      const code = await readErrorCode(error);
      if (code === 'self_hosted_license.subscription_payment_required') {
        setError('payment_required');
      } else if (code === 'self_hosted_license.subscription_cancellation_failed') {
        setError('failed');
      } else {
        await toastResponseError(error);
      }
      return false;
    } finally {
      // eslint-disable-next-line @silverhand/fp/no-mutation -- Release the single-flight lock after settlement.
      pending.current = false;
      setIsCanceling(false);
    }
  }, [api, id, onCanceled, t]);

  return { cancel, isCanceling, error };
};
