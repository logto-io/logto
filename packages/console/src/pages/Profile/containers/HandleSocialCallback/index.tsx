import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import AppLoading from '@/components/AppLoading';
import { adminTenantEndpoint, meApi, profileSocialLinkingKeyPrefix } from '@/consts';
import { useStaticApi } from '@/hooks/use-api';
import { useConfirmModal } from '@/hooks/use-confirm-modal';

import { handleError } from '../../utils';

const HandleSocialCallback = () => {
  const { search } = useLocation();
  const { show: showModal } = useConfirmModal();
  const api = useStaticApi({
    prefixUrl: adminTenantEndpoint,
    resourceIndicator: meApi.indicator,
    hideErrorToast: true,
  });

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

        try {
          await api.post('me/social/link-identity', { json: { connectorId, connectorData } });

          window.close();
        } catch (error: unknown) {
          void handleError(error, async (code, message) => {
            if (code === 'user.identity_already_in_use') {
              await showModal({
                ModalContent: message,
                type: 'alert',
                cancelButtonText: 'general.got_it',
              });
              window.close();

              return true;
            }
          });
        }
      }
    })();
  }, [api, search, showModal]);

  return <AppLoading />;
};

export default HandleSocialCallback;
