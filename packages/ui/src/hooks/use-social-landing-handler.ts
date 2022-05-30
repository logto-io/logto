import { useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';

import { SearchParameters } from '@/types';
import { getSearchParameters } from '@/utils';

import { PageContext } from './use-page-context';
import { storeCallbackLink } from './utils';

const useSocialLandingHandler = (connectorId?: string) => {
  const { setToast } = useContext(PageContext);
  const { t } = useTranslation(undefined, { keyPrefix: 'main_flow' });
  const { search } = window.location;

  useEffect(() => {
    const redirectUri = getSearchParameters(search, SearchParameters.redirectTo);

    if (!redirectUri || !connectorId) {
      setToast(t('error.invalid_connector_request'));

      return;
    }

    const nativeCallbackLink = getSearchParameters(search, SearchParameters.nativeCallbackLink);

    if (nativeCallbackLink) {
      storeCallbackLink(connectorId, nativeCallbackLink);
    }

    window.location.replace(redirectUri);
  }, [connectorId, search, setToast, t]);
};

export default useSocialLandingHandler;
