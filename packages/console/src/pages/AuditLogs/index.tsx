import { LogDTO, LogResult } from '@logto/schemas';
import { conditionalString } from '@silverhand/essentials';
import classNames from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useSWR from 'swr';

import ApplicationName from '@/components/ApplicationName';
import Card from '@/components/Card';
import CardTitle from '@/components/CardTitle';
import Pagination from '@/components/Pagination';
import TableEmpty from '@/components/Table/TableEmpty';
import TableError from '@/components/Table/TableError';
import TableLoading from '@/components/Table/TableLoading';
import UserName from '@/components/UserName';
import { RequestError } from '@/hooks/use-api';
import * as tableStyles from '@/scss/table.module.scss';

import ApplicationSelector from './components/ApplicationSelector';
import EventName from './components/EventName';
import EventSelector from './components/EventSelector';
import * as styles from './index.module.scss';

const pageSize = 20;

const AuditLogs = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [query, setQuery] = useSearchParams();
  const pageIndex = Number(query.get('page') ?? '1');
  const event = query.get('event');
  const applicationId = query.get('applicationId');
  const { data, error, mutate } = useSWR<[LogDTO[], number], RequestError>(
    `/api/logs?page=${pageIndex}&page_size=${pageSize}${conditionalString(
      event && `&logType=${event}`
    )}${conditionalString(applicationId && `&applicationId=${applicationId}`)}`
  );
  const isLoading = !data && !error;
  const navigate = useNavigate();
  const [logs, totalCount] = data ?? [];

  return (
    <Card className={styles.card}>
      <div className={styles.headline}>
        <CardTitle title="logs.title" subtitle="logs.subtitle" />
      </div>
      <div className={styles.filter}>
        <div className={styles.title}>{t('logs.filter_by')}</div>
        <div className={styles.eventSelector}>
          <EventSelector
            value={event ?? undefined}
            onChange={(value) => {
              setQuery({ event: value ?? '' });
            }}
          />
        </div>
        <div className={styles.applicationSelector}>
          <ApplicationSelector
            value={applicationId ?? undefined}
            onChange={(value) => {
              setQuery({ applicationId: value ?? '' });
            }}
          />
        </div>
      </div>
      <div className={classNames(styles.table, tableStyles.scrollable)}>
        <table className={classNames(!data && tableStyles.empty)}>
          <colgroup>
            <col className={styles.eventName} />
            <col />
            <col />
            <col />
          </colgroup>
          <thead>
            <tr>
              <th>{t('logs.event')}</th>
              <th>{t('logs.user')}</th>
              <th>{t('logs.application')}</th>
              <th>{t('logs.time')}</th>
            </tr>
          </thead>
          <tbody>
            {!data && error && (
              <TableError
                columns={4}
                content={error.body?.message ?? error.message}
                onRetry={async () => mutate(undefined, true)}
              />
            )}
            {isLoading && <TableLoading columns={4} />}
            {logs?.length === 0 && <TableEmpty columns={4} />}
            {logs?.map(({ type, payload, createdAt, id }) => (
              <tr
                key={id}
                className={tableStyles.clickable}
                onClick={() => {
                  navigate(`/audit-logs/${id}`);
                }}
              >
                <td>
                  <EventName type={type} isSuccess={payload.result === LogResult.Success} />
                </td>
                <td>{payload.userId ? <UserName userId={payload.userId} /> : '-'}</td>
                <td>
                  {payload.applicationId ? (
                    <ApplicationName applicationId={payload.applicationId} />
                  ) : (
                    '-'
                  )}
                </td>
                <td>{new Date(createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.pagination}>
        {!!totalCount && (
          <Pagination
            pageCount={Math.ceil(totalCount / pageSize)}
            pageIndex={pageIndex}
            onChange={(page) => {
              setQuery({ page: String(page) });
            }}
          />
        )}
      </div>
    </Card>
  );
};

export default AuditLogs;
