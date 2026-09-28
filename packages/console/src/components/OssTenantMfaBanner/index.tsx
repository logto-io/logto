import { adminTenantEndpoint } from '@/consts';
import DynamicT from '@/ds-components/DynamicT';
import InlineNotification from '@/ds-components/InlineNotification';
import useOssTenantMfa from '@/hooks/use-oss-tenant-mfa';

import styles from './index.module.scss';

/** The Account Center page where the signed-in user sets up MFA. */
const accountSecurityUrl = new URL('/account/security', adminTenantEndpoint).href;

/**
 * Self-hosted only: tells a member who has no MFA while the tenant requires it to set it up now.
 *
 * Requiring MFA does not end existing sessions, so such a member keeps using Console until their
 * next sign-in, where they would be stopped to set up MFA. This sends them to Account Center to do
 * it on their own terms instead. The hook fetches nothing on Cloud or while the self-hosted plans
 * are unreleased, so nothing renders there.
 */
function OssTenantMfaBanner() {
  const { data } = useOssTenantMfa();

  if (!data?.isMfaRequired || !data.isMember || data.hasMfaConfigured) {
    return null;
  }

  return (
    <div className={styles.container}>
      <InlineNotification
        severity="alert"
        action="tenants.settings.tenant_mfa_setup_action"
        onClick={() => {
          // Account Center is a separate app on the admin tenant, not a Console route.
          window.location.assign(accountSecurityUrl);
        }}
      >
        <DynamicT forKey="tenants.settings.tenant_mfa_setup_required" />
      </InlineNotification>
    </div>
  );
}

export default OssTenantMfaBanner;
