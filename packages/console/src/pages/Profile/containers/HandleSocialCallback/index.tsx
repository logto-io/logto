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
      const connectorData = Object.fromEntries(new URLSearchParams(search));

      if (connectorId) {
        sessionStorage.removeItem(profileSocialLinkingKeyPrefix);
        await api.post('me/social/link-identity', { json: { connectorId, connectorData } });

        window.close();
      }
    })();
  }, [api, search]);

  return <AppLoading />;
};

export default HandleSocialCallback;
