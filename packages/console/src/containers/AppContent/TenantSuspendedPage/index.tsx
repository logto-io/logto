import { Theme } from '@logto/schemas';

import ErrorDark from '@/assets/images/error-dark.svg?react';
import Error from '@/assets/images/error.svg?react';
import { contactEmailLink } from '@/consts';
import Button from '@/ds-components/Button';
import DynamicT from '@/ds-components/DynamicT';
import useTheme from '@/hooks/use-theme';

import styles from './index.module.scss';

function TenantSuspendedPage() {
  const theme = useTheme();
  const ErrorImage = theme === Theme.Light ? Error : ErrorDark;

  return (
    <div className={styles.suspendedPage}>
      <ErrorImage className={styles.image} />
      <div className={styles.title}>
        <DynamicT forKey="tenants.tenant_suspended_page.title" />
      </div>
      <div className={styles.description}>
        <DynamicT forKey="tenants.tenant_suspended_page.description_1" />
      </div>
      <div className={styles.description}>
        <DynamicT forKey="tenants.tenant_suspended_page.description_2" />
      </div>
      <a href={contactEmailLink} className={styles.linkButton} rel="noopener">
        <Button title="general.contact_us_action" type="outline" />
      </a>
    </div>
  );
}

export default TenantSuspendedPage;
