import { Theme } from '@logto/schemas';
import type { TenantInfo } from '@logto/schemas/models';
import classNames from 'classnames';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import Plus from '@/assets/icons/plus.svg';
import TenantLandingPageImageDark from '@/assets/images/tenant-landing-page-dark.svg';
import TenantLandingPageImage from '@/assets/images/tenant-landing-page.svg';
import Button from '@/ds-components/Button';
import DynamicT from '@/ds-components/DynamicT';
import useTenants from '@/hooks/use-tenants';
import useTheme from '@/hooks/use-theme';

import CreateTenantModal from './CreateTenantModal';
import * as styles from './index.module.scss';

type Props = {
  className?: string;
};

function TenantLandingPageContent({ className }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { tenants, mutate } = useTenants();
  const theme = useTheme();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  if (tenants?.length) {
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
        onClose={async (tenant?: TenantInfo) => {
          if (tenant) {
            void mutate();
            toast.success(t('tenants.tenant_created', { name: tenant.name }));
            window.location.assign(new URL(`/${tenant.id}`, window.location.origin).toString());
          }
          setIsCreateModalOpen(false);
        }}
      />
    </>
  );
}

export default TenantLandingPageContent;
