import { useTranslation } from 'react-i18next';

import { type TenantResponse } from '@/cloud/types/router';
import Button from '@/ds-components/Button';

import TenantsList from './TenantsList';
import styles from './index.module.scss';

export default function IssuesContent({
  tenants,
  hasConsoleSsoConnectors,
  onClose,
}: {
  readonly tenants: readonly TenantResponse[];
  readonly hasConsoleSsoConnectors: boolean;
  readonly onClose: () => void;
}) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.profile.delete_account' });

  return (
    <div className={styles.container}>
      <p>{t('p.has_issue')}</p>
      {hasConsoleSsoConnectors && <p>{t('issues.console_sso')}</p>}
      {tenants.length > 0 && <TenantsList description={t('issues.tenants')} tenants={tenants} />}
      <p>{t('p.after_resolved')}</p>
      <div className={styles.actions}>
        <Button size="large" title="general.got_it" onClick={onClose} />
      </div>
    </div>
  );
}
