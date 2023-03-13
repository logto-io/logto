import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { getCallbackLinkFromStorage } from '@/utils/social-connectors';

const useSocialCallbackHandler = () => {
  const navigate = useNavigate();

  const socialCallbackHandler = useCallback(
    (connectorId: string) => {
      // Get search string to evaluate
      const searchString = window.location.search

      // Get hash string to evaluate
      const hashString = window.location.hash

      // Define evaluated search string
      let search = searchString

      // Apple use fragment mode to store auth parameter. Need to support it.
      if (!searchString && hashString) {
        search = `?${hashString.slice(1)}`
      }

      if (searchString && hashString) {
        search = `${search}&${hashString.slice(1)}`
      }

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
