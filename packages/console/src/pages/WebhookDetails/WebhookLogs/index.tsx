import { type Log, InteractionHookEvent } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import useSWR from 'swr';
import { z } from 'zod';

import EventSelector from '@/components/AuditLogTable/components/EventSelector';
import EmptyDataPlaceholder from '@/components/EmptyDataPlaceholder';
import { defaultPageSize } from '@/consts';
import { hookEventLabel, hookEventLogKey } from '@/consts/webhooks';
import DynamicT from '@/ds-components/DynamicT';
import Table from '@/ds-components/Table';
import Tag from '@/ds-components/Tag';
import { type RequestError } from '@/hooks/use-api';
import useSearchParametersWatcher from '@/hooks/use-search-parameters-watcher';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import { buildUrl } from '@/utils/url';

import { type WebhookDetailsOutletContext } from '../types';

import * as styles from './index.module.scss';

// TODO: Implement all hook events
const hookLogEventOptions = Object.values(InteractionHookEvent).map((event) => ({
  title: <DynamicT forKey={hookEventLabel[event]} />,
  value: hookEventLogKey[event],
}));

function WebhookLogs() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { navigate } = useTenantPathname();
  const {
    hook: { id },
  } = useOutletContext<WebhookDetailsOutletContext>();

  const pageSize = defaultPageSize;
  const [{ page, event }, updateSearchParameters] = useSearchParametersWatcher({
    page: 1,
    event: '',
    startTimeExclusive: '',
  });

  const url = buildUrl(`api/hooks/${id}/recent-logs`, {
    page: String(page),
    page_size: String(pageSize),
    ...conditional(event && { logKey: event }),
  });

  const { data, error, mutate } = useSWR<[Log[], number], RequestError>(url);
  const isLoading = !data && !error;
  const [logs, totalCount] = data ?? [];

  return (
    <Table
      className={styles.logs}
      rowGroups={[{ key: 'logs', data: logs }]}
      rowIndexKey="id"
      rowClickHandler={({ id }) => {
        navigate(id);
      }}
      filter={
        <div className={styles.filter}>
          <div className={styles.title}>{t('logs.filter_by')}</div>
          <div className={styles.eventSelector}>
            <EventSelector
              value={event}
              options={hookLogEventOptions}
              onChange={(event) => {
                updateSearchParameters({ event, page: undefined });
              }}
            />
          </div>
        </div>
      }
      columns={[
        {
          title: 'Status',
          dataIndex: 'status',
          colSpan: 5,
          render: ({ payload }) => {
            const result = z
              .object({ response: z.object({ statusCode: z.number().optional() }) })
              .optional()
              .safeParse(payload);
            const statusCode = result.success ? result.data?.response.statusCode : undefined;
            const isError = !statusCode || statusCode >= 400;
            return (
              <Tag type="result" status={isError ? 'error' : 'success'}>
                {statusCode ?? 'Request error'}
              </Tag>
            );
          },
        },
        {
          title: t('logs.event'),
          dataIndex: 'event',
          colSpan: 6,
          render: ({ key }) => {
            // TODO: Implement all hook events
            const event = Object.values(InteractionHookEvent).find(
              (event) => hookEventLogKey[event] === key
            );
            return conditional(event && t(hookEventLabel[event])) ?? '-';
          },
        },
        {
          title: t('logs.time'),
          dataIndex: 'time',
          colSpan: 5,
          render: ({ createdAt }) => new Date(createdAt).toLocaleString(),
        },
      ]}
      placeholder={<EmptyDataPlaceholder />}
      pagination={{
        page,
        totalCount,
        pageSize,
        onChange: (page) => {
          updateSearchParameters({ page });
        },
      }}
      isLoading={isLoading}
      errorMessage={error?.body?.message ?? error?.message}
      onRetry={async () => mutate(undefined, true)}
    />
  );
}

export default WebhookLogs;
