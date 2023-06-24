import { useLogto } from '@logto/react';
import { type TenantInfo } from '@logto/schemas/lib/models/tenants.js';
import { trySafe } from '@silverhand/essentials';
import { useContext, useEffect } from 'react';

import { getCallbackUrl } from '@/consts';
import { TenantsContext } from '@/contexts/TenantsProvider';

const useValidateTenantAccess = () => {
  const { getAccessToken, signIn, isAuthenticated } = useLogto();
  const { currentTenant, currentTenantValidated, setCurrentTenantValidated } =
    useContext(TenantsContext);

  useEffect(() => {
    const validate = async ({ indicator, id }: TenantInfo) => {
      // Test fetching an access token for the current Tenant ID.
      // If failed, it means the user finishes the first auth, ands still needs to auth again to
      // fetch the full-scoped (with all available tenants) token.
      if (!(await trySafe(getAccessToken(indicator)))) {
        void signIn(getCallbackUrl(id).href);
      }
    };

    if (isAuthenticated && currentTenant && !currentTenantValidated) {
      setCurrentTenantValidated();
      void validate(currentTenant);
    }
  }, [
    currentTenant,
    currentTenantValidated,
    getAccessToken,
    isAuthenticated,
    setCurrentTenantValidated,
    signIn,
  ]);
};

export default useValidateTenantAccess;
