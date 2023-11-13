import { useTranslation, Trans } from 'react-i18next';

import DynamicT from '@/ds-components/DynamicT';

import * as styles from './index.module.scss';

type Props = {
  type: 'freeStagingTenant' | 'paidTenant';
};

function DevelopmentTenantMigrationHint({ type }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <div>
      <div className={styles.title}>
        <DynamicT forKey="tenants.notification.impact_title" />
      </div>
      <div className={styles.hint}>
        {type === 'freeStagingTenant' && (
          <Trans components={{ strong: <span className={styles.strong} /> }}>
            {t('tenants.notification.staging_env_hint')}
          </Trans>
        )}
        {type === 'paidTenant' && (
          <>
            <Trans components={{ strong: <span className={styles.strong} /> }}>
              {t('tenants.notification.paid_tenant_hint_1')}
            </Trans>
            <ol>
              <li>
                <DynamicT forKey="tenants.notification.paid_tenant_hint_2" />
              </li>
              <li>
                <DynamicT forKey="tenants.notification.paid_tenant_hint_3" />
              </li>
            </ol>
            <DynamicT forKey="tenants.notification.paid_tenant_hint_4" />
          </>
        )}
      </div>
    </div>
  );
}

export default DevelopmentTenantMigrationHint;
