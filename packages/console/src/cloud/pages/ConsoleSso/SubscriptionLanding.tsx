import { Navigate } from 'react-router-dom';
import useSWR from 'swr';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import { type LogtoEnterpriseResponse } from '@/cloud/types/router';
import DelayedSuspenseFallback from '@/components/DelayedSuspenseFallback';
import InlineNotification from '@/ds-components/InlineNotification';
import useCurrentUser from '@/hooks/use-current-user';

import { consoleSsoPath } from './use-console-sso';

function SubscriptionLanding() {
  const { user } = useCurrentUser();
  const api = useCloudApi();
  const { data, error } = useSWR<{ logtoEnterprises: LogtoEnterpriseResponse[] }, Error>(
    user && ['/api/me/logto-enterprises', user.id],
    async () => api.get('/api/me/logto-enterprises')
  );
  if (error) {
    return <InlineNotification severity="error">{error.message}</InlineNotification>;
  }
  if (!data) {
    return <DelayedSuspenseFallback />;
  }
  return (
    <Navigate
      replace
      to={
        data.logtoEnterprises[0]
          ? `/subscriptions/${data.logtoEnterprises[0].id}/subscription`
          : consoleSsoPath
      }
    />
  );
}

export default SubscriptionLanding;
