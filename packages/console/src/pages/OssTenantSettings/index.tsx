import { Outlet } from 'react-router-dom';

import { TenantSettingsTabs } from '@/consts';
import { isDevFeaturesEnabled } from '@/consts/env';
import CardTitle from '@/ds-components/CardTitle';
import DynamicT from '@/ds-components/DynamicT';
import TabNav, { TabNavItem } from '@/ds-components/TabNav';

import styles from './index.module.scss';
import useShouldShowOssTenantSettingsTab from './use-should-show-settings-tab';
import { shouldShowOssTenantLicenseTab, shouldShowOssTenantMembersTab } from './utils';

function OssTenantSettings() {
  const shouldShowMembersTab = shouldShowOssTenantMembersTab({ isCloud: false });
  const shouldShowLicenseTab = shouldShowOssTenantLicenseTab({
    isCloud: false,
    isDevFeaturesEnabled,
  });
  const shouldShowSettingsTab = useShouldShowOssTenantSettingsTab();

  return (
    <div className={styles.container}>
      <CardTitle
        className={styles.cardTitle}
        title="tenants.title"
        subtitle="tenants.oss_description"
      />
      <TabNav className={styles.tabs}>
        {shouldShowSettingsTab && (
          <TabNavItem href={`/tenant-settings/${TenantSettingsTabs.Settings}`}>
            <DynamicT forKey="tenants.tabs.settings" />
          </TabNavItem>
        )}
        <TabNavItem href={`/tenant-settings/${TenantSettingsTabs.OidcConfigs}`}>
          <DynamicT forKey="tenants.tabs.oidc_configs" />
        </TabNavItem>
        {shouldShowMembersTab && (
          <TabNavItem href={`/tenant-settings/${TenantSettingsTabs.Members}`}>
            <DynamicT forKey="tenants.tabs.members" />
          </TabNavItem>
        )}
        {shouldShowLicenseTab && (
          <TabNavItem href={`/tenant-settings/${TenantSettingsTabs.License}`}>
            <DynamicT forKey="tenants.tabs.license" />
          </TabNavItem>
        )}
      </TabNav>
      <Outlet />
    </div>
  );
}

export default OssTenantSettings;
