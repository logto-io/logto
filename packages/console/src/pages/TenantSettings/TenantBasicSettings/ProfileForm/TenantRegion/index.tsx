import { Trans, useTranslation } from 'react-i18next';

import Region, { RegionName } from '@/components/Region';
import { trustAndSecurityLink } from '@/consts';
import TextLink from '@/ds-components/TextLink';

import * as styles from './index.module.scss';

function TenantRegion() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <div className={styles.container}>
      {/* TODO: Read the value from the tenant */}
      <Region className={styles.region} regionName={RegionName.EU} />
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
