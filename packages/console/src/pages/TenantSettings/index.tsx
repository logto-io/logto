import { Outlet } from 'react-router-dom';

import { TenantSettingsTabs } from '@/consts';
import CardTitle from '@/ds-components/CardTitle';
import DynamicT from '@/ds-components/DynamicT';
import TabNav, { TabNavItem } from '@/ds-components/TabNav';

import * as styles from './index.module.scss';

function TenantSettings() {
  return (
    <div className={styles.container}>
      <CardTitle
        title="tenant_settings.title"
        subtitle="tenant_settings.description"
        className={styles.cardTitle}
      />
      <TabNav className={styles.tabs}>
        <TabNavItem href={`/tenant-settings/${TenantSettingsTabs.Settings}`}>
          <DynamicT forKey="tenant_settings.tabs.settings" />
        </TabNavItem>
        <TabNavItem href={`/tenant-settings/${TenantSettingsTabs.Domains}`}>
          <DynamicT forKey="tenant_settings.tabs.domains" />
        </TabNavItem>
      </TabNav>
      <Outlet />
    </div>
  );
}

export default TenantSettings;
