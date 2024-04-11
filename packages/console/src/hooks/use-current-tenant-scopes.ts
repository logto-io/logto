import { useLogto } from '@logto/react';
import { TenantScope, getTenantOrganizationId } from '@logto/schemas';
import { useContext, useEffect, useState } from 'react';

import { TenantsContext } from '@/contexts/TenantsProvider';

const useCurrentTenantScopes = () => {
  const { currentTenantId, isInitComplete } = useContext(TenantsContext);
  const { isAuthenticated, getOrganizationTokenClaims } = useLogto();

  const [scopes, setScopes] = useState<string[]>([]);
  const [canInviteMember, setCanInviteMember] = useState(false);
  const [canRemoveMember, setCanRemoveMember] = useState(false);
  const [canUpdateMemberRole, setCanUpdateMemberRole] = useState(false);
  const [canManageTenant, setCanManageTenant] = useState(false);

  useEffect(() => {
    (async () => {
      if (isAuthenticated && isInitComplete) {
        const organizationId = getTenantOrganizationId(currentTenantId);
        const claims = await getOrganizationTokenClaims(organizationId);
        const allScopes = claims?.scope?.split(' ') ?? [];
        setScopes(allScopes);

        for (const scope of allScopes) {
          switch (scope) {
            case TenantScope.InviteMember: {
              setCanInviteMember(true);
              break;
            }
            case TenantScope.RemoveMember: {
              setCanRemoveMember(true);
              break;
            }
            case TenantScope.UpdateMemberRole: {
              setCanUpdateMemberRole(true);
              break;
            }
            case TenantScope.ManageTenant: {
              setCanManageTenant(true);
              break;
            }
            default: {
              break;
            }
          }
        }
      }
    })();
  }, [currentTenantId, getOrganizationTokenClaims, isAuthenticated, isInitComplete]);

  return {
    canInviteMember,
    canRemoveMember,
    canUpdateMemberRole,
    canManageTenant,
    scopes,
  };
};

export default useCurrentTenantScopes;
