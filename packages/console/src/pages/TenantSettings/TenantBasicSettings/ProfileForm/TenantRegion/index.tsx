import { Trans, useTranslation } from 'react-i18next';

import { trustAndSecurityLink } from '@/consts';
import TextLink from '@/ds-components/TextLink';

import * as styles from './index.module.scss';

function TenantRegion() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <div className={styles.container}>
      <div className={styles.region}>
        <span className={styles.icon}>🇪🇺</span>EU
      </div>
      <div className={styles.regionTip}>
        <Trans
          components={{
            a: <TextLink targetBlank="noopener" href={trustAndSecurityLink} />,
          }}
        >
          {t('tenants.settings.tenant_region_tip', { region: 'EU' })}
        </Trans>
      </div>
    </div>
  );
}

export default TenantRegion;
