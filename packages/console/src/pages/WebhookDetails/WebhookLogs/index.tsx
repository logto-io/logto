import { type LogResponse } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import useSWR from 'swr';
import { z } from 'zod';

import EventSelector from '@/components/AuditLogTable/components/EventSelector';
import EmptyDataPlaceholder from '@/components/EmptyDataPlaceholder';
import { defaultPageSize } from '@/consts';
import { isDevFeaturesEnabled } from '@/consts/env';
import { availableHookEvents } from '@/consts/webhooks';
import Button from '@/ds-components/Button';
import Table from '@/ds-components/Table';
import Tag from '@/ds-components/Tag';
import useApi, { type RequestError } from '@/hooks/use-api';
import useSearchParametersWatcher from '@/hooks/use-search-parameters-watcher';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import { buildUrl } from '@/utils/url';

import { type WebhookDetailsOutletContext } from '../types';
import { buildHookEventLogKey, getHookEventKey } from '../utils';

import styles from './index.module.scss';

const hookLogEventOptions = availableHookEvents.map((event) => ({
  title: event,
  value: buildHookEventLogKey(event),
}));

function WebhookLogs() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { navigate } = useTenantPathname();
  const {
    hook: { id, enabled },
  } = useOutletContext<WebhookDetailsOutletContext>();
  const api = useApi();
  const [redeliveringLogId, setRedeliveringLogId] = useState<string>();

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

  const { data, error, mutate } = useSWR<[LogResponse[], number], RequestError>(url);
  const isLoading = !data && !error;
  const [logs, totalCount] = data ?? [];

  const redeliver = async (logId: string) => {
    setRedeliveringLogId(logId);

    try {
      await api.post(`api/hooks/${id}/recent-logs/${logId}/redeliver`);
      toast.success(t('webhook_details.logs.redelivery_queued'));
      void mutate();
    } finally {
      setRedeliveringLogId(undefined);
    }
  };

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
            // Durable job queue: show deliveries waiting for a retry as retrying instead of failed
            if (isDevFeaturesEnabled && payload.nextAttemptAt !== undefined) {
              return (
                <Tag type="state" status="alert">
                  {t('webhook_details.logs.retrying')}
                </Tag>
              );
            }

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
          render: ({ key }) => getHookEventKey(key),
        },
        {
          title: t('logs.time'),
          dataIndex: 'time',
          colSpan: 5,
          render: ({ createdAt }) => new Date(createdAt).toLocaleString(),
        },
        // Durable job queue: delivery attempts and manual redelivery
        ...(isDevFeaturesEnabled
          ? [
              {
                title: t('webhook_details.logs.attempts'),
                dataIndex: 'attempts',
                colSpan: 2,
                render: ({ payload }: LogResponse) => payload.attempts ?? '-',
              },
              {
                title: null,
                dataIndex: 'actions',
                colSpan: 3,
                render: ({ id: logId, payload }: LogResponse) =>
                  enabled &&
                  payload.result === 'Error' &&
                  payload.nextAttemptAt === undefined && (
                    <Button
                      type="text"
                      size="small"
                      title="webhook_details.logs.redeliver"
                      isLoading={redeliveringLogId === logId}
                      disabled={redeliveringLogId !== undefined}
                      onClick={(event) => {
                        event.stopPropagation();
                        void redeliver(logId);
                      }}
                    />
                  ),
              },
            ]
          : []),
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
