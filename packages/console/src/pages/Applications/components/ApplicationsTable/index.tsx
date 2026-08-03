import { type Application } from '@logto/schemas';
import { condArray } from '@silverhand/essentials';
import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import ApplicationPreview from '@/components/ItemPreview/ApplicationPreview';
import CopyToClipboard from '@/ds-components/CopyToClipboard';
import Table from '@/ds-components/Table';
import { type RowGroup } from '@/ds-components/Table/types';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import pageLayout from '@/scss/page-layout.module.scss';

import DynamicAppPreview from '../DynamicAppPreview';

import styles from './index.module.scss';

const dynamicAppRowId = 'dynamic-app';
const buildDetailsPathname = (id: string) => `/applications/${id}`;

type DynamicAppRow = { id: typeof dynamicAppRowId };
type ApplicationsTableRow = Application | DynamicAppRow;

const dynamicAppRowGroup: RowGroup<ApplicationsTableRow> = {
  key: dynamicAppRowId,
  data: [{ id: dynamicAppRowId }],
};

const isDynamicAppRow = (row: ApplicationsTableRow): row is DynamicAppRow =>
  row.id === dynamicAppRowId;

type Props = {
  readonly applications?: Application[];
  readonly totalCount?: number;
  readonly isLoading: boolean;
  readonly errorMessage?: string;
  readonly placeholder: ReactNode;
  /** Whether the dynamic app (CIMD) row is listed above the applications. */
  readonly hasDynamicAppRow: boolean;
  readonly pagination: { page: number; pageSize: number };
  readonly onPageChange: (page: number) => void;
  readonly onRetry: () => void;
};

function ApplicationsTable({
  applications,
  totalCount,
  isLoading,
  errorMessage,
  placeholder,
  hasDynamicAppRow,
  pagination,
  onPageChange,
  onRetry,
}: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { navigate } = useTenantPathname();

  return (
    <Table<ApplicationsTableRow>
      isLoading={isLoading}
      className={pageLayout.table}
      rowGroups={[
        ...condArray(hasDynamicAppRow && [dynamicAppRowGroup]),
        { key: 'applications', data: applications },
      ]}
      rowIndexKey="id"
      errorMessage={errorMessage}
      placeholder={placeholder}
      columns={[
        {
          title: t('applications.application_name'),
          dataIndex: 'name',
          colSpan: 6,
          render: (row) =>
            isDynamicAppRow(row) ? <DynamicAppPreview /> : <ApplicationPreview data={row} />,
        },
        {
          title: t('applications.app_id'),
          dataIndex: 'id',
          colSpan: 10,
          render: (row) =>
            isDynamicAppRow(row) ? (
              <span className={styles.dynamicAppId}>
                {t('applications.dynamic_app.app_id_placeholder')}
              </span>
            ) : (
              <CopyToClipboard value={row.id} variant="text" />
            ),
        },
      ]}
      isRowClickable={(row) => !isDynamicAppRow(row)}
      rowClickHandler={({ id }) => {
        navigate(buildDetailsPathname(id));
      }}
      pagination={{
        ...pagination,
        totalCount,
        onChange: onPageChange,
      }}
      onRetry={onRetry}
    />
  );
}

export default ApplicationsTable;
