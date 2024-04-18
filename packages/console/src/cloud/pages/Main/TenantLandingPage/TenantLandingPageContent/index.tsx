import { Theme } from '@logto/schemas';
import classNames from 'classnames';
import { useContext, useState } from 'react';

import Plus from '@/assets/icons/plus.svg';
import TenantLandingPageImageDark from '@/assets/images/tenant-landing-page-dark.svg';
import TenantLandingPageImage from '@/assets/images/tenant-landing-page.svg';
import { type TenantResponse } from '@/cloud/types/router';
import CreateTenantModal from '@/components/CreateTenantModal';
import { TenantsContext } from '@/contexts/TenantsProvider';
import Button from '@/ds-components/Button';
import DynamicT from '@/ds-components/DynamicT';
import useTheme from '@/hooks/use-theme';

import * as styles from './index.module.scss';

type Props = {
  readonly className?: string;
};

function TenantLandingPageContent({ className }: Props) {
  const { tenants, prependTenant, navigateTenant } = useContext(TenantsContext);
  const theme = useTheme();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  if (tenants.length > 0) {
    return null;
  }

  return (
    <>
      <div className={classNames(styles.placeholder, className)}>
        <div className={styles.image}>
          {theme === Theme.Light ? <TenantLandingPageImage /> : <TenantLandingPageImageDark />}
        </div>
        <div className={styles.title}>
          <DynamicT forKey="tenants.tenant_landing_page.title" />
        </div>
        <div className={styles.description}>
          <DynamicT forKey="tenants.tenant_landing_page.description" />
        </div>
        <Button
          title="tenants.tenant_landing_page.create_tenant_button"
          type="primary"
          size="large"
          icon={<Plus />}
          className={styles.button}
          onClick={() => {
            setIsCreateModalOpen(true);
          }}
        />
      </div>
      <CreateTenantModal
        isOpen={isCreateModalOpen}
        onClose={async (tenant?: TenantResponse) => {
          if (tenant) {
            prependTenant(tenant);
            navigateTenant(tenant.id);
          }
          setIsCreateModalOpen(false);
        }}
      />
    </>
  );
}

export default TenantLandingPageContent;
