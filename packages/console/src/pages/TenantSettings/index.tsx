import { Outlet } from 'react-router-dom';

import CardTitle from '@/components/CardTitle';
import DynamicT from '@/components/DynamicT';
import TabNav, { TabNavItem } from '@/components/TabNav';
import { TenantSettingsTabs } from '@/consts';

import * as styles from './index.module.scss';

function TenantSettings() {
  return (
    <div className={styles.container}>
      <CardTitle title="tenant_settings.title" subtitle="tenant_settings.description" />
      <TabNav>
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
