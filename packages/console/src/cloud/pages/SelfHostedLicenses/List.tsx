import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import SkuName from '@/components/SkuName';
import { GlobalRoute } from '@/contexts/TenantsProvider';
import DynamicT from '@/ds-components/DynamicT';
import Table from '@/ds-components/Table';

import Status from './Status';
import styles from './index.module.scss';
import { useSelfHostedLicenses } from './use-self-hosted-licenses';

function List() {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { data, error, isLoading, mutate } = useSelfHostedLicenses();

  return (
    <Table
      rowGroups={[{ key: 'licenses', data: error ? undefined : data }]}
      rowIndexKey="id"
      isLoading={isLoading}
      errorMessage={error ? t('cloud.self_hosted_licenses.load_error') : undefined}
      columns={[
        {
          title: t('tenants.license.plan_field'),
          dataIndex: 'plan',
          colSpan: 4,
          render: ({ id, plan }) => (
            <Link className={styles.licenseLink} to={`${GlobalRoute.SelfHostedLicenses}/${id}`}>
              <SkuName skuId={plan} />
              <span className={styles.identifier}>{id}</span>
            </Link>
          ),
        },
        {
          title: t('subscription.billing_history.status_column'),
          dataIndex: 'status',
          colSpan: 3,
          render: (license) => <Status license={license} />,
        },
        {
          title: t('cloud.self_hosted_licenses.period_end'),
          dataIndex: 'currentPeriodEnd',
          colSpan: 3,
          render: ({ currentPeriodEnd }) =>
            currentPeriodEnd
              ? new Date(currentPeriodEnd).toLocaleDateString(i18n.language, {
                  dateStyle: 'medium',
                })
              : '—',
        },
      ]}
      placeholder={
        <div className={styles.empty}>
          <h3>
            <DynamicT forKey="cloud.self_hosted_licenses.empty_title" />
          </h3>
          <p>
            <DynamicT forKey="cloud.self_hosted_licenses.empty_description" />
          </p>
        </div>
      }
      onRetry={() => {
        void mutate();
      }}
    />
  );
}

export default List;
