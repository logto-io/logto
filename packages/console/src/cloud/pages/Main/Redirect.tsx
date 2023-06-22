import { useLogto } from '@logto/react';
import { trySafe } from '@silverhand/essentials';
import { useContext, useEffect } from 'react';
import { useHref } from 'react-router-dom';

import AppLoading from '@/components/AppLoading';
import { TenantsContext } from '@/contexts/TenantsProvider';

function Redirect() {
  const { getAccessToken, signIn } = useLogto();
  const { navigateTenant, tenants, currentTenantId } = useContext(TenantsContext);

  const tenant = tenants.find(({ id }) => id === currentTenantId);
  const href = useHref(currentTenantId + '/callback');

  useEffect(() => {
    const validate = async (indicator: string) => {
      // Test fetching an access token for the current Tenant ID.
      // If failed, it means the user finishes the first auth, ands still needs to auth again to
      // fetch the full-scoped (with all available tenants) token.
      if (await trySafe(getAccessToken(indicator))) {
        navigateTenant(currentTenantId);
      } else {
        void signIn(new URL(href, window.location.origin).toString());
      }
    };

    if (tenant) {
      void validate(tenant.indicator);
    }
  }, [currentTenantId, getAccessToken, href, navigateTenant, signIn, tenant]);

  useEffect(() => {
    if (!tenant) {
      /** Fallback to another available tenant instead of showing `Forbidden`. */
      navigateTenant(tenants[0]?.id ?? '');
    }
  }, [navigateTenant, tenant, tenants]);

  return <AppLoading />;
}

export default Redirect;
