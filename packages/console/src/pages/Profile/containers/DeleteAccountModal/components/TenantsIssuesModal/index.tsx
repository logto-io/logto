import { type LocalePhrase } from '@logto/phrases';
import { useTranslation } from 'react-i18next';

import { type TenantResponse } from '@/cloud/types/router';
import Button from '@/ds-components/Button';
import ModalLayout from '@/ds-components/ModalLayout';

import styles from '../../index.module.scss';
import TenantsList from '../TenantsList';

type Props = {
  readonly issues: ReadonlyArray<{
    readonly description: keyof LocalePhrase['translation']['admin_console']['profile']['delete_account']['issues'];
    readonly tenants: readonly TenantResponse[];
  }>;
  readonly onClose: () => void;
};

/** A display component for tenant issues that prevent account deletion. */
export default function TenantsIssuesModal({ issues, onClose }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.profile.delete_account' });

  return (
    <ModalLayout
      title="profile.delete_account.label"
      footer={<Button size="large" title="general.got_it" onClick={onClose} />}
    >
      <div className={styles.container}>
        <p>{t('p.has_issue')}</p>
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
      </div>
    </ModalLayout>
  );
}
