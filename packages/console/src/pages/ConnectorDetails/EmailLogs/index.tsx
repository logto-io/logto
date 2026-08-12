import { useTranslation } from 'react-i18next';

import { type TenantEmailLog } from '@/cloud/types/router';
import TimeRangePicker from '@/components/AuditLogTable/components/TimeRangePicker';
import { defaultPresetRange } from '@/components/AuditLogTable/components/TimeRangePicker/preset';
import useAuditLogTimeWindow from '@/components/AuditLogTable/components/TimeRangePicker/use-audit-log-time-window';
import EmptyDataPlaceholder from '@/components/EmptyDataPlaceholder';
import Button from '@/ds-components/Button';
import CopyToClipboard from '@/ds-components/CopyToClipboard';
import Search from '@/ds-components/Search';
import Table from '@/ds-components/Table';
import { type Column } from '@/ds-components/Table/types';
import Tag from '@/ds-components/Tag';
import useSearchParametersWatcher from '@/hooks/use-search-parameters-watcher';

import styles from './index.module.scss';
import useEmailLogs from './use-email-logs';

/**
 * The hosted-email send log for the built-in email connector: sent + failed rows from the
 * cloud email-logs endpoint, windowed like the audit log (preset ranges + custom range) and
 * cursor-paginated (the endpoint has no total count, so paging is previous/next only).
 */
function EmailLogs() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  // URL values are untyped; validated downstream via `isPresetRange`.
  const initialRange: string = defaultPresetRange;
  const [{ range, start_time, end_time, recipient }, updateSearchParameters] =
    useSearchParametersWatcher({
      range: initialRange,
      start_time: '',
      end_time: '',
      recipient: '',
    });

  const {
    startTime,
    endTime,
    pickerRangeValue,
    customStartDate,
    customEndDate,
    handleRangeChange,
    handleCustomDatesChange,
  } = useAuditLogTimeWindow({
    range,
    startTimeRaw: start_time,
    endTimeRaw: end_time,
    updateSearchParameters,
  });

  const { logs, error, isLoading, mutate, hasNext, hasPrevious, next, previous } = useEmailLogs({
    startTime,
    endTime,
    recipient,
  });

  // Column spans are proportional (the table is `table-layout: fixed`); sized by content type —
  // recipient addresses and message ids are the long fields, language tags and status tags short.
  const columns: Array<Column<TenantEmailLog>> = [
    {
      title: t('connector_details.email_logs.time'),
      dataIndex: 'time',
      colSpan: 3,
      render: ({ createdAt }) => new Date(createdAt).toLocaleString(),
    },
    {
      title: t('connector_details.email_logs.recipient'),
      dataIndex: 'recipient',
      colSpan: 4,
      render: ({ recipient }) => recipient ?? '-',
    },
    {
      title: t('connector_details.email_logs.template_type'),
      dataIndex: 'templateType',
      colSpan: 3,
      render: ({ templateType }) => templateType ?? '-',
    },
    {
      title: t('connector_details.email_logs.language_tag'),
      dataIndex: 'locale',
      colSpan: 2,
      render: ({ locale }) => locale ?? '-',
    },
    {
      title: t('connector_details.email_logs.provider_message_id'),
      dataIndex: 'providerMessageId',
      colSpan: 5,
      render: ({ providerMessageId }) =>
        providerMessageId ? (
          <div className={styles.messageId}>
            <span className={styles.messageIdValue} title={providerMessageId}>
              {providerMessageId}
            </span>
            <CopyToClipboard variant="icon" value={providerMessageId} />
          </div>
        ) : (
          '-'
        ),
    },
    {
      title: t('connector_details.email_logs.status'),
      dataIndex: 'status',
      colSpan: 3,
      render: ({ status }) => (
        <Tag type="result" status={status === 'sent' ? 'success' : 'error'}>
          {t(
            status === 'sent'
              ? 'connector_details.email_logs.status_sent'
              : 'connector_details.email_logs.status_failed'
          )}
        </Tag>
      ),
    },
  ];

  return (
    <>
      <Table
        className={styles.logs}
        rowGroups={[{ key: 'logs', data: logs }]}
        rowIndexKey="id"
        columns={columns}
        filter={
          <div className={styles.filter}>
            <Search
              placeholder={t('connector_details.email_logs.recipient_placeholder')}
              defaultValue={recipient}
              isClearable={Boolean(recipient)}
              onSearch={(value) => {
                updateSearchParameters({ recipient: value });
              }}
              onClearSearch={() => {
                updateSearchParameters({ recipient: '' });
              }}
            />
            <div className={styles.timeWindow}>
              <div className={styles.title}>{t('logs.filter_by')}</div>
              <div className={styles.timeRangePicker}>
                <TimeRangePicker
                  value={pickerRangeValue}
                  customStartDate={customStartDate}
                  customEndDate={customEndDate}
                  onChange={handleRangeChange}
                  onCustomDatesChange={handleCustomDatesChange}
                />
              </div>
            </div>
          </div>
        }
        placeholder={<EmptyDataPlaceholder />}
        isLoading={isLoading}
        errorMessage={error instanceof Error ? error.message : undefined}
        onRetry={async () => mutate(undefined, true)}
      />
      {(hasPrevious || hasNext) && (
        <div className={styles.pagination}>
          <Button
            title="connector_details.email_logs.previous_page"
            disabled={!hasPrevious}
            onClick={previous}
          />
          <Button
            title="connector_details.email_logs.next_page"
            disabled={!hasNext}
            onClick={next}
          />
        </div>
      )}
    </>
  );
}

export default EmailLogs;
