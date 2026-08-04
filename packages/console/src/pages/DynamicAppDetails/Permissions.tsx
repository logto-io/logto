import OidcPermissionsCard from '@/pages/ApplicationDetails/components/Permissions/OidcPermissionsCard';
import PermissionsCard from '@/pages/ApplicationDetails/components/Permissions/PermissionsCard';
import { ScopeLevel } from '@/pages/ApplicationDetails/components/Permissions/PermissionsCard/ApplicationScopesAssignmentModal/type';

import { cimdUserConsentScopesEndpoint } from './constants';

/**
 * The consent permissions of the dynamic app (CIMD). CIMD clients are unregistered, so the scopes
 * are the tenant-wide ceiling every client is limited to, instead of a per-application grant.
 */
function Permissions() {
  return (
    <>
      {[ScopeLevel.User, ScopeLevel.Organization].map((scopeLevel) => (
        <PermissionsCard
          key={scopeLevel}
          scopesEndpoint={cimdUserConsentScopesEndpoint}
          scopeLevel={scopeLevel}
          phraseGroup="applications.dynamic_app.permissions"
        />
      ))}
      <OidcPermissionsCard />
    </>
  );
}

export default Permissions;
