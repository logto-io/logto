import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import AppLoading from '@/components/AppLoading';
import { adminTenantEndpoint, meApi, profileSocialLinkingKeyPrefix } from '@/consts';
import { useStaticApi } from '@/hooks/use-api';

const HandleSocialCallback = () => {
  const { search } = useLocation();
  const api = useStaticApi({ prefixUrl: adminTenantEndpoint, resourceIndicator: meApi.indicator });

  useEffect(() => {
    (async () => {
      const connectorId = sessionStorage.getItem(profileSocialLinkingKeyPrefix);
      sessionStorage.removeItem(profileSocialLinkingKeyPrefix);

      if (connectorId) {
        const queries = new URLSearchParams(search);
        queries.set(
          'redirectUri',
          new URL(`/callback/${connectorId}`, new URL(adminTenantEndpoint)).toString()
        );
        const connectorData = Object.fromEntries(queries);

        await api.post('me/social/link-identity', { json: { connectorId, connectorData } });

        window.close();
      }
    })();
  }, [api, search]);

  return <AppLoading />;
};

export default HandleSocialCallback;
