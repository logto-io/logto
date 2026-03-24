import { Outlet } from 'react-router-dom';

import { TenantSettingsTabs } from '@/consts';
import CardTitle from '@/ds-components/CardTitle';
import DynamicT from '@/ds-components/DynamicT';
import TabNav, { TabNavItem } from '@/ds-components/TabNav';

import styles from './index.module.scss';

function OssTenantSettings() {
  return (
    <div className={styles.container}>
      <CardTitle
        className={styles.cardTitle}
        title="tenants.title"
        subtitle="tenants.oss_description"
      />
      <TabNav className={styles.tabs}>
        <TabNavItem href={`/tenant-settings/${TenantSettingsTabs.OidcConfigs}`}>
          <DynamicT forKey="tenants.tabs.oidc_configs" />
        </TabNavItem>
        <TabNavItem href="/tenant-settings/members">Members</TabNavItem>
      </TabNav>
      <Outlet />
    </div>
  );
}

export default OssTenantSettings;
