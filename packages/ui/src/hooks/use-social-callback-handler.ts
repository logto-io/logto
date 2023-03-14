import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { getCallbackLinkFromStorage } from '@/utils/social-connectors';

const useSocialCallbackHandler = () => {
  const navigate = useNavigate();

  const socialCallbackHandler = useCallback(
    (connectorId: string) => {
      // Get search string to evaluate
      const searchString = window.location.search;

      // Get hash string to evaluate
      const hashString = window.location.hash;

      // Define evaluated search string
      const search = `${searchString ?? '?'}${(searchString && hashString ? '&' : '')}${hashString.slice(1)}`;

      // Get native callback link from storage
      const callbackLink = getCallbackLinkFromStorage(connectorId);

      if (callbackLink) {
        window.location.replace(new URL(`${callbackLink}${search}`));

        return;
      }

      // Web flow
      navigate(
        {
          pathname: `/sign-in/social/${connectorId}`,
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
