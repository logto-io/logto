import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import LoadingLayer from '@/components/LoadingLayer';
import { storeCallbackLink, storeState } from '@/utils/social-connectors';

const Springboard = () => {
  const [searchParameters] = useSearchParams();

  useEffect(() => {
    const state = searchParameters.get('state');
    const connectorId = searchParameters.get('connectorId');
    const callback = searchParameters.get('callback');
    const redirectTo = searchParameters.get('redirectTo');

    if (callback && connectorId) {
      storeCallbackLink(connectorId, callback);
    }

    if (state && connectorId) {
      storeState(state, connectorId);
    }

    if (redirectTo) {
      window.location.assign(redirectTo);
    }
  }, [searchParameters]);

  return <LoadingLayer />;
};

export default Springboard;
