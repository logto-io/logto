import { type ApplicationSecret } from '@logto/schemas';
import { compareDesc } from 'date-fns';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import ActionsButton from '@/components/ActionsButton';
import { LocaleDateTime } from '@/components/DateTime';
import CopyToClipboard from '@/ds-components/CopyToClipboard';
import { type Column } from '@/ds-components/Table/types';
import { Tooltip } from '@/ds-components/Tip';
import useApi from '@/hooks/use-api';

import styles from './index.module.scss';

export type ApplicationSecretRow = Pick<ApplicationSecret, 'name' | 'value' | 'expiresAt'> & {
  isLegacy?: boolean;
};

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
  onUpdated: (isLegacy: boolean) => void;
};

export const useSecretTableColumns = ({ appId, onUpdated }: UseSecretTableColumns) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const api = useApi();
  const tableColumns: Array<Column<ApplicationSecretRow>> = useMemo(
    () => [
      {
        title: t('general.name'),
        dataIndex: 'name',
        colSpan: 3,
        render: ({ name }) => <span>{name}</span>,
      },
      {
        title: t('application_details.secrets.value'),
        dataIndex: 'value',
        colSpan: 6,
        render: ({ value }) => (
          <CopyToClipboard
            hasVisibilityToggle
            displayType="block"
            value={value}
            className={styles.copyToClipboard}
            variant="text"
          />
        ),
      },
      {
        title: t('application_details.secrets.expires_at'),
        dataIndex: 'expiresAt',
        colSpan: 3,
        render: ({ expiresAt }) => (
          <span>
            {expiresAt ? (
              compareDesc(expiresAt, new Date()) === 1 ? (
                <Expired expiresAt={new Date(expiresAt)} />
              ) : (
                <LocaleDateTime>{expiresAt}</LocaleDateTime>
              )
            ) : (
              t('application_details.secrets.never')
            )}
          </span>
        ),
      },
      {
        title: '',
        dataIndex: 'actions',
        render: ({ name, isLegacy }) => (
          <ActionsButton
            fieldName="application_details.application_secret"
            deleteConfirmation="application_details.secrets.delete_confirmation"
            onDelete={async () => {
              await (isLegacy
                ? api.delete(`api/applications/${appId}/legacy-secret`)
                : api.delete(`api/applications/${appId}/secrets/${encodeURIComponent(name)}`));
              onUpdated(isLegacy ?? false);
            }}
          />
        ),
      },
    ],
    [api, appId, onUpdated, t]
  );

  return tableColumns;
};
