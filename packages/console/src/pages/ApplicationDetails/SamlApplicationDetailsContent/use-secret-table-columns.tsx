import { type SamlApplicationSecretResponse } from '@logto/schemas';
import { compareDesc } from 'date-fns';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { LocaleDateTime } from '@/components/DateTime';
import { type Column } from '@/ds-components/Table/types';
import Tag from '@/ds-components/Tag';
import { Tooltip } from '@/ds-components/Tip';

import CertificateActionMenu from './CertificateActionMenu';
import styles from './index.module.scss';

const isExpired = (expiresAt: Date | number) => compareDesc(expiresAt, new Date()) === 1;

function Expired({ expiresAt }: { readonly expiresAt: Date }) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  return (
    <Tooltip
      content={t('application_details.secrets.expired_tooltip', {
        date: expiresAt.toLocaleString(),
      })}
    >
      <span className={styles.expired}>{t('application_details.secrets.expired')}</span>
    </Tooltip>
  );
}

type UseSecretTableColumns = {
  appId: string;
};

export const useSecretTableColumns = ({ appId }: UseSecretTableColumns) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const tableColumns: Array<Column<SamlApplicationSecretResponse>> = useMemo(
    () => [
      {
        title: t('application_details.saml_idp_certificates.expires_at'),
        dataIndex: 'expiresAt',
        colSpan: 3,
        render: ({ expiresAt }) => (
          <span>
            {isExpired(expiresAt) ? (
              <Expired expiresAt={new Date(expiresAt)} />
            ) : (
              <LocaleDateTime>{expiresAt}</LocaleDateTime>
            )}
          </span>
        ),
      },
      {
        title: t('application_details.saml_idp_certificates.finger_print'),
        dataIndex: 'fingerPrint',
        colSpan: 5,
        render: ({ fingerprints }) => (
          <span className={styles.fingerPrint}>{fingerprints.sha256.unformatted}</span>
        ),
      },
      {
        title: t('application_details.saml_idp_certificates.status'),
        dataIndex: 'status',
        render: ({ active }) => (
          <Tag type="state" status={active ? 'success' : 'info'} variant="plain">
            {t(
              active
                ? 'application_details.saml_idp_certificates.active'
                : 'application_details.saml_idp_certificates.inactive'
            )}
          </Tag>
        ),
      },
      {
        title: '',
        dataIndex: 'actions',
        render: (secret) => {
          return <CertificateActionMenu secret={secret} appId={appId} />;
        },
      },
    ],
    [appId, t]
  );

  return tableColumns;
};
