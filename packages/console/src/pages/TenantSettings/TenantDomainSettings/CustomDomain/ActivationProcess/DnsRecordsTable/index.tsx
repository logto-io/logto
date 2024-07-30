import { type DomainDnsRecords } from '@logto/schemas';

import CopyToClipboard from '@/ds-components/CopyToClipboard';
import DynamicT from '@/ds-components/DynamicT';
import { Ring } from '@/ds-components/Spinner';
import Table from '@/ds-components/Table';

import styles from './index.module.scss';

type Props = {
  readonly records: DomainDnsRecords;
};

function DnsRecordsTable({ records }: Props) {
  return (
    <div>
      <div className={styles.tip}>
        <DynamicT forKey="domain.custom.add_dns_records" />
      </div>
      <div className={styles.container}>
        {records.length === 0 ? (
          <div className={styles.loading}>
            <Ring className={styles.loadingIcon} />
            <DynamicT forKey="domain.custom.generating_dns_records" />
          </div>
        ) : (
          <Table
            isRowHoverEffectDisabled
            className={styles.table}
            headerTableClassName={styles.header}
            bodyTableWrapperClassName={styles.bodyTableWrapper}
            rowGroups={[{ key: 'dnsRecords', data: records }]}
            rowIndexKey="name"
            isRowClickable={() => false}
            columns={[
              {
                title: <DynamicT forKey="domain.custom.dns_table.type_field" />,
                dataIndex: 'type',
                colSpan: 2,
                render: ({ type }) => <div className={styles.column}>{type}</div>,
              },
              {
                title: <DynamicT forKey="domain.custom.dns_table.name_field" />,
                dataIndex: 'name',
                colSpan: 7,
                render: ({ name }) => (
                  <CopyToClipboard
                    isWordWrapAllowed
                    className={styles.column}
                    value={name}
                    variant="text"
                  />
                ),
              },
              {
                title: <DynamicT forKey="domain.custom.dns_table.value_field" />,
                dataIndex: 'value',
                colSpan: 7,
                render: ({ value }) => (
                  <CopyToClipboard
                    isWordWrapAllowed
                    className={styles.column}
                    value={value}
                    variant="text"
                  />
                ),
              },
            ]}
          />
        )}
      </div>
    </div>
  );
}

export default DnsRecordsTable;
