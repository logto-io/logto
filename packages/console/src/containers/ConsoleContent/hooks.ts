import { Prompt, useLogto } from '@logto/react';
import { getTenantOrganizationId } from '@logto/schemas';
import { useContext, useEffect, useState } from 'react';

import { isCloud } from '@/consts/env';
import { TenantsContext } from '@/contexts/TenantsProvider';
import useCurrentTenantScopes from '@/hooks/use-current-tenant-scopes';
import useRedirectUri from '@/hooks/use-redirect-uri';
import { saveRedirect } from '@/utils/storage';

/**
 * Listens to the tenant scope changes for the current signed-in user. This hook will fetch the tenant scopes
 * for the user, and compare it with the "scope" token claim in access token. After comparing the scopes:
 *
 * - If the user has been granted new scopes, it will re-consent to obtain the additional scopes.
 * - If the user has been revoked scopes, it will clear the cached access token and renew one with shrunk scopes.
 *
 * Note: This hook should only be used once in the ConsoleContent component.
 */
const useTenantScopeListener = () => {
  const { currentTenantId, removeTenant, navigateTenant } = useContext(TenantsContext);
  const { clearAccessToken, clearAllTokens, getOrganizationTokenClaims, signIn } = useLogto();
  const [tokenClaims, setTokenClaims] = useState<string[]>();
  const redirectUri = useRedirectUri();
  const { scopes = [], isLoading } = useCurrentTenantScopes();

  useEffect(() => {
    (async () => {
      const organizationId = getTenantOrganizationId(currentTenantId);
      const claims = await getOrganizationTokenClaims(organizationId);
      setTokenClaims(claims?.scope?.split(' ') ?? []);
    })();
  }, [currentTenantId, getOrganizationTokenClaims]);

  useEffect(() => {
    if (isCloud && !isLoading && scopes.length === 0) {
      // User has no access to the current tenant. Navigate to root and it will return to the
      // last visited tenant, or fallback to the page where the user can create a new tenant.
      removeTenant(currentTenantId);
      navigateTenant('');
    }
  }, [currentTenantId, isLoading, navigateTenant, removeTenant, scopes.length]);

  useEffect(() => {
    if (!isCloud || isLoading || tokenClaims === undefined) {
      return;
    }
    const hasScopesGranted = scopes.some((scope) => !tokenClaims.includes(scope));
    const hasScopesRevoked = tokenClaims.some((claim) => !scopes.includes(claim));
    if (hasScopesGranted) {
      (async () => {
        // User has been newly granted scopes. Need to re-consent to obtain the additional scopes.
        saveRedirect();
        await clearAllTokens();
        void signIn({
          redirectUri: redirectUri.href,
          prompt: Prompt.Consent,
        });
      })();
    }
    if (hasScopesRevoked) {
      // User has been revoked scopes. Need to clear the cached access token and it will be renewed
      // automatically with shrunk scopes.
      void clearAccessToken();
    }
  }, [clearAccessToken, clearAllTokens, isLoading, redirectUri.href, scopes, signIn, tokenClaims]);
};

export default useTenantScopeListener;
