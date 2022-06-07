import { useCallback, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { parseQueryParameters } from '@/utils';
import { getCallbackLinkFromStorage } from '@/utils/social-connectors';

import { PageContext } from './use-page-context';

const useSocialCallbackHandler = () => {
  const [loading, setLoading] = useState(true);
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
        setLoading(false);
        setToast(`${error}${error_description ? `: ${error_description}` : ''}`);

        return;
      }

      // Connector auth missing state
      if (!state || !connectorId) {
        setLoading(false);
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
          pathname: `/social/sign-in-callback/${connectorId}`,
          search: data,
        },
        {
          replace: true,
        }
      );
    },
    [navigate, setToast, t]
  );

  return { socialCallbackHandler, loading };
};

export default useSocialCallbackHandler;
