import type { Log, ApplicationResponse } from '@logto/schemas';
import { LogResult, ApplicationType } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import ApplicationName from '@/components/ApplicationName';
import UserName from '@/components/UserName';
import { auditLogEventTitle, defaultPageSize } from '@/consts';
import Table from '@/ds-components/Table';
import type { Column } from '@/ds-components/Table/types';
import type { RequestError } from '@/hooks/use-api';
import useSearchParametersWatcher from '@/hooks/use-search-parameters-watcher';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import { buildUrl } from '@/utils/url';

import EmptyDataPlaceholder from '../EmptyDataPlaceholder';

import ApplicationSelector from './components/ApplicationSelector';
import EventName from './components/EventName';
import EventSelector from './components/EventSelector';
import * as styles from './index.module.scss';

const auditLogEventOptions = Object.entries(auditLogEventTitle).map(([value, title]) => ({
  value,
  title: title ?? value,
}));

type Props = {
  readonly applicationId?: string;
  readonly userId?: string;
  readonly className?: string;
};

function AuditLogTable({ applicationId, userId, className }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const pageSize = defaultPageSize;

  const [{ page, event, applicationId: applicationIdFromSearch }, updateSearchParameters] =
    useSearchParametersWatcher({
      page: 1,
      event: '',
      // If `applicationId` not specified when init this component, then search parameter of `applicationId` can be accepted.
      ...conditional(!applicationId && { applicationId: '' }),
    });

  // TODO: LOG-7135, revisit this fallback logic and see whether this should be done outside of this component.
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  const searchApplicationId = applicationId || applicationIdFromSearch;
  const { data: specifiedApplication } = useSWR<ApplicationResponse>(
    applicationId && `api/applications/${applicationId}`
  );

  const url = buildUrl('api/logs', {
    page: String(page),
    page_size: String(pageSize),
    ...conditional(event && { logKey: event }),
    ...conditional(searchApplicationId && { applicationId: searchApplicationId }),
    ...conditional(userId && { userId }),
  });

  const { data, error, mutate } = useSWR<[Log[], number], RequestError>(url);
  const isLoading = !data && !error;
  const { navigate } = useTenantPathname();
  const [logs, totalCount] = data ?? [];
  const isUserColumnVisible =
    !userId && specifiedApplication?.type !== ApplicationType.MachineToMachine;

  const eventColumn: Column<Log> = {
    title: t('logs.event'),
    dataIndex: 'event',
    colSpan: isUserColumnVisible ? 5 : 6,
    render: ({ key, payload: { result } }) => (
      <EventName eventKey={key} isSuccess={result === LogResult.Success} />
    ),
  };

  const userColumn: Column<Log> = {
    title: t('logs.user'),
    dataIndex: 'user',
    colSpan: 5,
    render: ({ payload: { userId } }) => (userId ? <UserName userId={userId} /> : <div>-</div>),
  };

  const applicationColumn: Column<Log> = {
    title: t('logs.application'),
    dataIndex: 'application',
    colSpan: isUserColumnVisible ? 3 : 5,
    render: ({ payload: { applicationId } }) =>
      applicationId ? <ApplicationName applicationId={applicationId} /> : <div>-</div>,
  };

  const timeColumn: Column<Log> = {
    title: t('logs.time'),
    dataIndex: 'time',
    colSpan: isUserColumnVisible ? 3 : 5,
    render: ({ createdAt }) => new Date(createdAt).toLocaleString(),
  };

  const columns: Array<Column<Log>> = [
    eventColumn,
    conditional(isUserColumnVisible && userColumn),
    applicationColumn,
    timeColumn,
    // eslint-disable-next-line unicorn/prefer-native-coercion-functions
  ].filter((column): column is Column<Log> => Boolean(column));

  return (
    <Table
      className={className}
      rowGroups={[{ key: 'logs', data: logs }]}
      rowIndexKey="id"
      columns={columns}
      rowClickHandler={({ id }) => {
        navigate(id);
      }}
      filter={
        <div className={styles.filter}>
          <div className={styles.title}>{t('logs.filter_by')}</div>
          <div className={styles.eventSelector}>
            <EventSelector
              value={event}
              options={auditLogEventOptions}
              onChange={(event) => {
                updateSearchParameters({ event, page: undefined });
              }}
            />
          </div>
          {!applicationId && (
            <div className={styles.applicationSelector}>
              <ApplicationSelector
                value={applicationIdFromSearch}
                onChange={(applicationIdFromSearch) => {
                  updateSearchParameters({
                    applicationId: applicationIdFromSearch,
                    page: undefined,
                  });
                }}
              />
            </div>
          )}
        </div>
      }
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

export default AuditLogTable;
