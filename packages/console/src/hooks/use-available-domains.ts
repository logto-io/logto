import { useContext, useMemo } from 'react';

import { AppDataContext } from '@/contexts/AppDataProvider';
import useCustomDomain from '@/hooks/use-custom-domain';

const useAvailableDomains = () => {
  const { activeCustomDomains } = useCustomDomain();
  const { tenantEndpoint } = useContext(AppDataContext);

  return useMemo(() => {
    const customDomains = activeCustomDomains.map((domain) => domain);

    const defaultDomain = tenantEndpoint?.host;

    return defaultDomain ? [...customDomains, defaultDomain] : customDomains;
  }, [activeCustomDomains, tenantEndpoint]);
};

export default useAvailableDomains;
