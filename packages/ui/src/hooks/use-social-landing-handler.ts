import { useContext, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { SearchParameters } from '@/types';
import { getSearchParameters } from '@/utils';
import { storeCallbackLink } from '@/utils/social-connectors';

import { PageContext } from './use-page-context';

const useSocialLandingHandler = () => {
  const [loading, setLoading] = useState(true);
  const { setToast } = useContext(PageContext);
  const { t } = useTranslation();
  const { search } = window.location;

  const socialLandingHandler = useCallback(
    (connectorId: string) => {
      const redirectUri = getSearchParameters(search, SearchParameters.redirectTo);

      if (!redirectUri) {
        setLoading(false);
        setToast(t('error.invalid_connector_request'));

        return;
      }

      const nativeCallbackLink = getSearchParameters(search, SearchParameters.nativeCallbackLink);

      if (nativeCallbackLink) {
        storeCallbackLink(connectorId, nativeCallbackLink);
      }

      window.location.replace(new URL(redirectUri));
    },
    [search, setToast, t]
  );

  return { loading, socialLandingHandler };
};

export default useSocialLandingHandler;
