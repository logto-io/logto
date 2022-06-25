import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { getCallbackLinkFromStorage } from '@/utils/social-connectors';

const useSocialCallbackHandler = () => {
  const navigate = useNavigate();

  const socialCallbackHandler = useCallback(
    (connectorId: string) => {
      // Apple use fragment mode to store auth parameter. Need to support it.
      const search = window.location.search || '?' + window.location.hash.slice(1);

      // Get native callback link from storage
      const callbackLink = getCallbackLinkFromStorage(connectorId);

      if (callbackLink) {
        window.location.replace(new URL(`${callbackLink}${search}`));

        return;
      }

      // Web flow
      navigate(
        {
          pathname: `/social/sign-in-callback/${connectorId}`,
          search,
        },
        {
          replace: true,
        }
      );
    },
    [navigate]
  );

  return { socialCallbackHandler };
};

export default useSocialCallbackHandler;
