import { useContext, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { isCloud } from '@/consts/env';
import { logtoCloudDevTenantDataRetention } from '@/consts/external-links';
import { TenantsContext } from '@/contexts/TenantsProvider';
import InlineNotification from '@/ds-components/InlineNotification';
import TextLink from '@/ds-components/TextLink';
import useAvailableRegions from '@/hooks/use-available-regions';
import useDocumentationUrl from '@/hooks/use-documentation-url';

import styles from './index.module.scss';

function DevTenantDataRetentionNotice() {
  const { currentTenant, isDevTenant } = useContext(TenantsContext);
  const { getRegionByName } = useAvailableRegions();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { getDocumentationUrl } = useDocumentationUrl();

  const isPrivateRegionTenant = useMemo(() => {
    if (!currentTenant) {
      return false;
    }

    const region = getRegionByName(currentTenant.regionName);
    return region ? region.isPrivate : false;
  }, [currentTenant, getRegionByName]);

  if (!isCloud || !isDevTenant || isPrivateRegionTenant) {
    return null;
  }

  return (
    <InlineNotification className={styles.notice}>
      <Trans
        components={{
          a: (
            <TextLink
              href={getDocumentationUrl(logtoCloudDevTenantDataRetention)}
              targetBlank="noopener"
            />
          ),
        }}
      >
        {t('users.dev_tenant_data_retention_notice')}
      </Trans>
    </InlineNotification>
  );
}

export default DevTenantDataRetentionNotice;
