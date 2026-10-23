import { type userSubscriptionsRouter } from '@logto/cloud/routes';
import { ResponseError } from '@withtyped/client';
import useSWR from 'swr';

import {
  type LogtoEnterpriseResponse,
  type LogtoEnterpriseSubscriptionInvoiceResponse,
  type UserSubscription,
  type UserSubscriptionInvoicesResponse,
} from '@/cloud/types/router';
import { isDevFeaturesEnabled } from '@/consts/env';
import useCurrentUser from '@/hooks/use-current-user';

import { useCloudApi } from './use-cloud-api';

/** Global entry eligibility uses local existence only, independently of billing detail reads. */
export const useSubscriptionEntry = () => {
  const { user, error: userError } = useCurrentUser();
  const api = useCloudApi({ hideErrorToast: true });
  const subscriptionsApi = useCloudApi<typeof userSubscriptionsRouter>({ hideErrorToast: true });
  const enterprises = useSWR<{ logtoEnterprises: LogtoEnterpriseResponse[] }, ResponseError>(
    user && !userError && ['/api/me/logto-enterprises', user.id],
    async () => api.get('/api/me/logto-enterprises'),
    { keepPreviousData: false }
  );
  // Console SSO billing: retain the existing Enterprise entry until this feature is released.
  const summary = useSWR<{ hasSubscriptions: boolean }, ResponseError>(
    isDevFeaturesEnabled && user && !userError && ['/api/me/subscriptions/summary', user.id],
    async () => subscriptionsApi.get('/api/me/subscriptions/summary'),
    { keepPreviousData: false }
  );
  return {
    enterprises: {
      ...enterprises,
      data: (userError ?? enterprises.error) ? undefined : enterprises.data?.logtoEnterprises,
      error: userError ?? enterprises.error,
    },
    hasSubscriptions:
      isDevFeaturesEnabled &&
      !userError &&
      !summary.error &&
      Boolean(summary.data?.hasSubscriptions),
  };
};

/** Read every product and status; an error must never become empty billing history. */
export const useUserSubscriptions = () => {
  const { user, error: userError, isLoading: isUserLoading } = useCurrentUser();
  const api = useCloudApi<typeof userSubscriptionsRouter>({ hideErrorToast: true });
  const result = useSWR<{ subscriptions: UserSubscription[] }, ResponseError>(
    user && !userError && ['/api/me/subscriptions', user.id],
    async () => api.get('/api/me/subscriptions'),
    { keepPreviousData: false }
  );
  return {
    ...result,
    isLoading: isUserLoading || result.isLoading,
    data: (userError ?? result.error) ? undefined : result.data?.subscriptions,
    error: userError ?? result.error,
  };
};

/** Page the user's own subscription invoices; an error must never become empty billing history. */
export const useUserSubscriptionInvoices = (page: number, pageSize: number) => {
  const { user, error: userError, isLoading: isUserLoading } = useCurrentUser();
  const api = useCloudApi<typeof userSubscriptionsRouter>({ hideErrorToast: true });
  const result = useSWR<UserSubscriptionInvoicesResponse, ResponseError>(
    user && !userError && ['/api/me/subscriptions/invoices', user.id, page, pageSize],
    async () =>
      api.get('/api/me/subscriptions/invoices', {
        search: { page: String(page), page_size: String(pageSize) },
      }),
    { keepPreviousData: false }
  );
  return {
    ...result,
    isLoading: isUserLoading || result.isLoading,
    data: (userError ?? result.error) ? undefined : result.data,
    error: userError ?? result.error,
  };
};

/**
 * Read an authorized Enterprise's invoices for the global billing history, newest first and
 * without drafts.
 */
export const useEnterpriseInvoices = (enterpriseId?: string) => {
  const { user, error: userError, isLoading: isUserLoading } = useCurrentUser();
  const api = useCloudApi({ hideErrorToast: true });
  const result = useSWR<{ invoices: LogtoEnterpriseSubscriptionInvoiceResponse[] }, ResponseError>(
    enterpriseId &&
      user &&
      !userError && ['/api/me/logto-enterprises/:id/invoices', user.id, enterpriseId],
    async () =>
      api.get('/api/me/logto-enterprises/:id/invoices', { params: { id: enterpriseId ?? '' } }),
    { keepPreviousData: false }
  );
  // An Enterprise without a subscription answers 404. It has no invoices yet, matching the
  // Subscription tab's not-covered state, so this must not show as a failed read.
  const hasNoSubscription =
    result.error instanceof ResponseError && result.error.response.status === 404;
  const error = userError ?? (hasNoSubscription ? undefined : result.error);
  const invoices = hasNoSubscription ? [] : result.data?.invoices;
  return {
    ...result,
    isLoading: isUserLoading || result.isLoading,
    data: error
      ? undefined
      : invoices
          ?.filter(({ status }) => status !== 'draft')
          .slice()
          .sort(
            (invoiceA, invoiceB) =>
              new Date(invoiceB.createdAt).getTime() - new Date(invoiceA.createdAt).getTime()
          ),
    error,
  };
};
