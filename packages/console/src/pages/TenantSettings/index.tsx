import { Outlet } from 'react-router-dom';

import { TenantSettingsTabs } from '@/consts';
import { isProduction } from '@/consts/env';
import CardTitle from '@/ds-components/CardTitle';
import DynamicT from '@/ds-components/DynamicT';
import TabNav, { TabNavItem } from '@/ds-components/TabNav';

import * as styles from './index.module.scss';

function TenantSettings() {
  return (
    <div className={styles.container}>
      <CardTitle
        title="tenants.title"
        subtitle="tenants.description"
        className={styles.cardTitle}
      />
      <TabNav className={styles.tabs}>
        <TabNavItem href={`/tenant-settings/${TenantSettingsTabs.Settings}`}>
          <DynamicT forKey="tenants.tabs.settings" />
        </TabNavItem>
        <TabNavItem href={`/tenant-settings/${TenantSettingsTabs.Domains}`}>
          <DynamicT forKey="tenants.tabs.domains" />
        </TabNavItem>
        {!isProduction && (
          <TabNavItem href={`/tenant-settings/${TenantSettingsTabs.Subscription}`}>
            <DynamicT forKey="tenants.tabs.subscription" />
          </TabNavItem>
        )}
      </TabNav>
      <Outlet />
    </div>
  );
}

export default TenantSettings;
