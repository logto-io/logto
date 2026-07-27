import { compareDesc } from 'date-fns';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { LocaleDateTime } from '@/components/DateTime';
import Table from '@/ds-components/Table';
import { type Column } from '@/ds-components/Table/types';
import Tag from '@/ds-components/Tag';
import { Tooltip } from '@/ds-components/Tip';

import CertificateActionMenu from './CertificateActionMenu';
import styles from './index.module.scss';
import { type CertificateData } from './types';

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

type Props = {
  readonly data: CertificateData[];
  readonly isLoading: boolean;
  readonly errorMessage?: string;
  readonly buildDownloadFilename: (id: string) => string;
  readonly onDelete: (id: string) => void;
  readonly onActivate: (id: string) => void;
  readonly onDeactivate: (id: string) => void;
};

/** A management table of SAML signing certificates with activate / deactivate / download / delete actions. */
function SamlCertificateTable({
  data,
  isLoading,
  errorMessage,
  buildDownloadFilename,
  onDelete,
  onActivate,
  onDeactivate,
}: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const columns: Array<Column<CertificateData>> = useMemo(
    () => [
      {
        title: t('application_details.saml_idp_certificates.expires_at'),
        dataIndex: 'expiresAt',
        colSpan: 5,
        render: ({ expiresAt }) => (
          <span>
            {isExpired(expiresAt) ? (
              <Expired expiresAt={new Date(expiresAt)} />
            ) : (
              // E.g. Apr 29, 1453, 12:00:00 AM
              <LocaleDateTime format="PPpp">{expiresAt}</LocaleDateTime>
            )}
          </span>
        ),
      },
      {
        title: t('application_details.saml_idp_certificates.finger_print'),
        dataIndex: 'fingerPrint',
        colSpan: 8,
        render: ({ fingerprints }) => (
          <span className={styles.fingerPrint}>{fingerprints.sha256.unformatted}</span>
        ),
      },
      {
        title: t('application_details.saml_idp_certificates.status'),
        dataIndex: 'status',
        colSpan: 2,
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
        colSpan: 2,
        render: (certificateData) => (
          <CertificateActionMenu
            data={certificateData}
            buildDownloadFilename={buildDownloadFilename}
            onDelete={onDelete}
            onActivate={onActivate}
            onDeactivate={onDeactivate}
          />
        ),
      },
    ],
    [buildDownloadFilename, onActivate, onDeactivate, onDelete, t]
  );

  return (
    <Table
      hasBorder
      isRowHoverEffectDisabled
      rowIndexKey="id"
      isLoading={isLoading}
      errorMessage={errorMessage}
      rowGroups={[{ key: 'certificates', data }]}
      columns={columns}
    />
  );
}

export default SamlCertificateTable;
