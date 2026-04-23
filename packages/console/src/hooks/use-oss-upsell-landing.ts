import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { isCloud } from '@/consts/env';
import {
  getUpsellTrackingDataFromSearch,
  reportUpsellLanding,
  stripUpsellTrackingSearchParameters,
} from '@/utils/oss-upsell';

function useOssUpsellLanding() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isCloud) {
      return;
    }

    const trackingData = getUpsellTrackingDataFromSearch(location.search);

    if (!trackingData) {
      return;
    }

    reportUpsellLanding({
      ...trackingData,
      url: window.location.href,
      referrer: document.referrer || undefined,
    });

    const cleanedSearch = stripUpsellTrackingSearchParameters(location.search);

    navigate(
      {
        pathname: location.pathname,
        search: cleanedSearch,
        hash: location.hash,
      },
      { replace: true }
    );
  }, [location.hash, location.pathname, location.search, navigate]);
}

export default useOssUpsellLanding;
