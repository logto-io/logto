import { useEffect, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SearchParameters } from '@/types';
import { getSearchParameters } from '@/utils';
import { storeCallbackLink } from '@/utils/social-connectors';

import { PageContext } from './use-page-context';

const useSocialLandingHandler = (connectorId?: string) => {
  const [loading, setLoading] = useState(true);
  const { setToast } = useContext(PageContext);
  const { t } = useTranslation(undefined, { keyPrefix: 'main_flow' });
  const { search } = window.location;

  useEffect(() => {
    const redirectUri = getSearchParameters(search, SearchParameters.redirectTo);

    if (!redirectUri || !connectorId) {
      setLoading(false);
      setToast(t('error.invalid_connector_request'));

      return;
    }

    const nativeCallbackLink = getSearchParameters(search, SearchParameters.nativeCallbackLink);

    if (nativeCallbackLink) {
      storeCallbackLink(connectorId, nativeCallbackLink);
    }

    window.location.replace(redirectUri);
  }, [connectorId, search, setLoading, setToast, t]);

  return { loading };
};

export default useSocialLandingHandler;
