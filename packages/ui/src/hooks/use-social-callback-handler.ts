import { useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { parseQueryParameters } from '@/utils';

import { PageContext } from './use-page-context';
import { getCallbackLinkFromStorage } from './utils';

const useSocialCallbackHandler = () => {
  const { setToast } = useContext(PageContext);
  const { t } = useTranslation(undefined, { keyPrefix: 'main_flow' });
  const navigate = useNavigate();

  const socialCallbackHandler = useCallback(
    (connectorId: string) => {
      // Apple use fragment mode to store auth parameter. Need to support it.
      const data = window.location.search || '?' + window.location.hash.slice(1);
      const { state, error, error_description } = parseQueryParameters(data);

      // Connector auth error
      if (error) {
        setToast(`${error}${error_description ? `: ${error_description}` : ''}`);

        return;
      }

      // Connector auth missing state
      if (!state || !connectorId) {
        setToast(t('error.invalid_connector_auth'));

        return;
      }

      // Get native callback link from storage
      const callbackLink = getCallbackLinkFromStorage(connectorId);

      if (callbackLink) {
        window.location.replace(new URL(`${callbackLink}${data}`));

        return;
      }

      // Web flow
      navigate(
        {
          pathname: `/sign-in/callback/${connectorId}`,
          search: data,
        },
        {
          replace: true,
        }
      );
    },
    [navigate, setToast, t]
  );

  return socialCallbackHandler;
};

export default useSocialCallbackHandler;
