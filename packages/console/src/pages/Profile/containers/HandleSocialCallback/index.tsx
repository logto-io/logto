import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import AppLoading from '@/components/AppLoading';
import { adminTenantEndpoint, meApi, storageKeys } from '@/consts';
import { useStaticApi } from '@/hooks/use-api';
import { useConfirmModal } from '@/hooks/use-confirm-modal';

import { handleError } from '../../utils';

function HandleSocialCallback() {
  const { search } = useLocation();
  const { show: showModal } = useConfirmModal();
  const api = useStaticApi({
    prefixUrl: adminTenantEndpoint,
    hideErrorToast: true,
  });

  useEffect(() => {
    (async () => {
      const [connectorId, verificationRecordId, newIdentifierVerificationRecordId] = String(
        sessionStorage.getItem(storageKeys.linkingSocialConnector)
      ).split(':');
      sessionStorage.removeItem(storageKeys.linkingSocialConnector);

      if (connectorId && verificationRecordId && newIdentifierVerificationRecordId) {
        const queries = new URLSearchParams(search);
        queries.set(
          'redirectUri',
          new URL(`/callback/${connectorId}`, new URL(adminTenantEndpoint)).toString()
        );
        const connectorData = Object.fromEntries(queries);

        try {
          await api.post('api/verifications/social/verify', {
            json: { verificationRecordId: newIdentifierVerificationRecordId, connectorData },
          });
          await api.post('api/profile/identities', {
            json: { verificationRecordId, newIdentifierVerificationRecordId },
          });

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
}

export default HandleSocialCallback;
