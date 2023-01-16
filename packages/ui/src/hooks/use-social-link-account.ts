import { useEffect } from 'react';

import { linkWithSocial } from '@/apis/interaction';
import useApi from '@/hooks/use-api';

const useLinkSocial = () => {
  const { result: linkResult, run: asyncLinkWithSocial } = useApi(linkWithSocial);

  useEffect(() => {
    if (linkResult?.redirectTo) {
      window.location.replace(linkResult.redirectTo);
    }
  }, [linkResult]);

  return asyncLinkWithSocial;
};

export default useLinkSocial;
