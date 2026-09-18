import { type consoleSsoRouter } from '@logto/cloud/routes';
import { type ResponseError } from '@withtyped/client';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import { type ConsoleSsoConnector, type ConsoleSsoContext } from '@/cloud/types/router';
import useCurrentUser from '@/hooks/use-current-user';

export const consoleSsoPath = '/subscriptions/console-sso';

export const useConsoleSsoContext = () => {
  const { user, error: userError } = useCurrentUser();
  const api = useCloudApi<typeof consoleSsoRouter>({ hideErrorToast: true });
  const context = useSWR<ConsoleSsoContext, ResponseError>(
    user && ['/api/me/console-sso/context', user.id],
    async () => api.get('/api/me/console-sso/context'),
    { refreshInterval: 10_000 }
  );
  const data =
    context.data?.userId === user?.id && !context.error && !userError ? context.data : undefined;
  return { ...context, data, error: userError ?? context.error, api, user };
};

export const useConsoleSsoConnectors = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { data: context, api, mutate: refreshContext } = useConsoleSsoContext();
  return useSWR<ConsoleSsoConnector[], Error>(
    context && ['/api/me/console-sso/connectors', context.userId, context.stripeCustomerId],
    async () => {
      const connectors = await api.get('/api/me/console-sso/connectors');
      if (
        connectors.some(({ stripeCustomerId }) => stripeCustomerId !== context?.stripeCustomerId)
      ) {
        // The default may change between the context read and the collection request.
        await refreshContext();
        throw new Error(t('errors.unexpected_error'));
      }
      return connectors;
    },
    { keepPreviousData: false }
  );
};

export const useConsoleSsoConnector = (id: string | undefined) => {
  const { data: context, api } = useConsoleSsoContext();
  return useSWR<ConsoleSsoConnector, ResponseError>(
    context &&
      id && ['/api/me/console-sso/connectors', context.userId, context.stripeCustomerId, id],
    async () =>
      api.get('/api/me/console-sso/connectors/:connectorId', { params: { connectorId: id ?? '' } }),
    { keepPreviousData: false }
  );
};
