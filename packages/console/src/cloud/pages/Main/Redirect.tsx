import { useLogto } from '@logto/react';
import type { TenantInfo } from '@logto/schemas/models';
import { trySafe } from '@silverhand/essentials';
import { useContext, useEffect } from 'react';
import { useHref } from 'react-router-dom';

import AppLoading from '@/components/AppLoading';
import { TenantsContext } from '@/contexts/TenantsProvider';

type Props = {
  tenants: TenantInfo[];
  toTenantId: string;
};

function Redirect({ tenants, toTenantId }: Props) {
  const { getAccessToken, signIn } = useLogto();
  const tenant = tenants.find(({ id }) => id === toTenantId);
  const { setIsSettle, navigate } = useContext(TenantsContext);
  const href = useHref(toTenantId + '/callback');

  useEffect(() => {
    const validate = async (indicator: string) => {
      // Test fetching an access token for the current Tenant ID.
      // If failed, it means the user finishes the first auth, ands still needs to auth again to
      // fetch the full-scoped (with all available tenants) token.
      if (await trySafe(getAccessToken(indicator))) {
        setIsSettle(true);
        navigate(toTenantId);
      } else {
        void signIn(new URL(href, window.location.origin).toString());
      }
    };

    if (tenant) {
      void validate(tenant.indicator);
    }
  }, [getAccessToken, href, navigate, setIsSettle, signIn, tenant, toTenantId]);

  if (!tenant) {
    /** Fallback to another available tenant instead of showing `Forbidden`. */
    navigate(tenants[0]?.id ?? '');
  }

  return <AppLoading />;
}

export default Redirect;
