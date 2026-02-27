import type { GetUserSessionsResponse } from '@logto/schemas';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import FormCard from '@/components/FormCard';
import Button from '@/ds-components/Button';
import FormField from '@/ds-components/FormField';
import Table from '@/ds-components/Table';
import { type RequestError } from '@/hooks/use-api';

import styles from './index.module.scss';
import { normalizeSessionRows } from './utils';

type Props = {
  readonly userId: string;
};

function UserSessions({ userId }: Props) {
  const { t } = useTranslation(undefined, {
    keyPrefix: 'admin_console',
  });

  const { data, isLoading, error, mutate } = useSWR<GetUserSessionsResponse, RequestError>(
    `api/users/${userId}/sessions`
  );

  const sessionCount = useMemo(() => data?.sessions.length ?? 0, [data?.sessions.length]);
  const rowData = useMemo(() => normalizeSessionRows(data?.sessions ?? []), [data?.sessions]);
  const hasRows = rowData.length > 0;

  return (
    <FormCard title="user_details.sessions.title" description="user_details.sessions.description">
      <FormField title="user_details.sessions.field_name">
        {!isLoading && !error && (
          <div className={styles.description}>
            {t(
              sessionCount > 0
                ? 'user_details.sessions.multiple_signed_in'
                : 'user_details.sessions.not_found'
            )}
          </div>
        )}
        {(isLoading || hasRows || error) && (
          <Table
            hasBorder
            isRowHoverEffectDisabled
            rowGroups={[{ key: 'sessions', data: rowData }]}
            rowIndexKey="sessionId"
            isLoading={isLoading}
            errorMessage={error?.body?.message ?? error?.message}
            columns={[
              {
                title: t('user_details.sessions.name_column'),
                dataIndex: 'name',
                colSpan: 6,
                render: ({ name }) => name || '-',
              },
              {
                title: t('user_details.sessions.session_id_column'),
                dataIndex: 'sessionId',
                colSpan: 5,
                render: ({ sessionId }) => sessionId,
              },
              {
                title: t('user_details.sessions.location_column'),
                dataIndex: 'location',
                colSpan: 5,
                render: ({ location }) => location || '-',
              },
              {
                title: null,
                dataIndex: 'action',
                colSpan: 2,
                render: () => <Button title="general.manage" type="text" size="small" />,
              },
            ]}
            onRetry={async () => mutate(undefined, true)}
          />
        )}
      </FormField>
    </FormCard>
  );
}

export default UserSessions;
