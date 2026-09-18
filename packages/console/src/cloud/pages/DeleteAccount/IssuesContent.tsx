import { useTranslation } from 'react-i18next';

import { type TenantResponse } from '@/cloud/types/router';
import Button from '@/ds-components/Button';

import TenantsList from './TenantsList';
import styles from './index.module.scss';

export default function IssuesContent({
  issues,
  hasConsoleSsoConnectors,
  onClose,
}: {
  readonly issues: ReadonlyArray<{
    readonly description: 'paid_plan' | 'subscription_status' | 'open_invoice';
    readonly tenants: readonly TenantResponse[];
  }>;
  readonly hasConsoleSsoConnectors: boolean;
  readonly onClose: () => void;
}) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.profile.delete_account' });

  return (
    <div className={styles.container}>
      <p>{t('p.has_issue')}</p>
      {hasConsoleSsoConnectors && <p>{t('issues.console_sso')}</p>}
      {issues.map(
        ({ description, tenants }) =>
          tenants.length > 0 && (
            <TenantsList
              key={description}
              description={t(`issues.${description}`, { count: tenants.length })}
              tenants={tenants}
            />
          )
      )}
      <p>{t('p.after_resolved')}</p>
      <div className={styles.actions}>
        <Button size="large" title="general.got_it" onClick={onClose} />
      </div>
    </div>
  );
}
