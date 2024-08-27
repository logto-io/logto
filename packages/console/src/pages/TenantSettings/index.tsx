import { useContext } from 'react';
import { Outlet } from 'react-router-dom';

import { TenantSettingsTabs } from '@/consts';
import { TenantsContext } from '@/contexts/TenantsProvider';
import CardTitle from '@/ds-components/CardTitle';
import DynamicT from '@/ds-components/DynamicT';
import TabNav, { TabNavItem } from '@/ds-components/TabNav';
import useCurrentTenantScopes from '@/hooks/use-current-tenant-scopes';

import styles from './index.module.scss';

function TenantSettings() {
  const { isDevTenant } = useContext(TenantsContext);
  const {
    access: { canManageTenant },
  } = useCurrentTenantScopes();

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
        <TabNavItem href={`/tenant-settings/${TenantSettingsTabs.Members}`}>
          <DynamicT forKey="tenants.tabs.members" />
        </TabNavItem>
        {!isDevTenant && canManageTenant && (
          <>
            <TabNavItem href={`/tenant-settings/${TenantSettingsTabs.Subscription}`}>
              <DynamicT forKey="tenants.tabs.subscription" />
            </TabNavItem>
            <TabNavItem href={`/tenant-settings/${TenantSettingsTabs.BillingHistory}`}>
              <DynamicT forKey="tenants.tabs.billing_history" />
            </TabNavItem>
          </>
        )}
      </TabNav>
      <Outlet />
    </div>
  );
}

export default TenantSettings;
