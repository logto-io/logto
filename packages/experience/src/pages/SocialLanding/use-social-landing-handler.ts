import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import useToast from '@/hooks/use-toast';
import { SearchParameters } from '@/types';
import { getSearchParameters } from '@/utils';
import { storeCallbackLink } from '@/utils/social-connectors';
import { isValidNativeCallbackLink, isValidWebRedirectUri } from '@/utils/url-scheme';

const useSocialLandingHandler = () => {
  const [loading, setLoading] = useState(true);
  const { setToast } = useToast();
  const { t } = useTranslation();
  const { search } = window.location;

  const socialLandingHandler = useCallback(
    (connectorId: string) => {
      const redirectUri = getSearchParameters(search, SearchParameters.RedirectTo);

      if (!redirectUri || !isValidWebRedirectUri(redirectUri)) {
        setLoading(false);
        setToast(t('error.invalid_connector_request'));

        return;
      }

      const nativeCallbackLink = getSearchParameters(search, SearchParameters.NativeCallbackLink);

      // Drop an invalid link rather than aborting: the web flow below still completes without it.
      if (nativeCallbackLink && isValidNativeCallbackLink(nativeCallbackLink)) {
        storeCallbackLink(connectorId, nativeCallbackLink);
      }

      window.location.replace(new URL(redirectUri));
    },
    [search, setToast, t]
  );

  return { loading, socialLandingHandler };
};

export default useSocialLandingHandler;
