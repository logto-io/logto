import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useSelfHostedLicenses } from '@/cloud/hooks/use-self-hosted-licenses';
import ItemPreview from '@/components/ItemPreview';
import SkuName from '@/components/SkuName';
import { GlobalRoute } from '@/contexts/TenantsProvider';
import DynamicT from '@/ds-components/DynamicT';
import Table from '@/ds-components/Table';

import Status from './Status';
import styles from './index.module.scss';

function List() {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { data, error, isLoading, mutate } = useSelfHostedLicenses();
  const navigate = useNavigate();

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
          render: ({ id, plan }) => <ItemPreview title={<SkuName skuId={plan} />} subtitle={id} />,
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
      rowClickHandler={({ id }) => {
        navigate(`${GlobalRoute.SelfHostedLicenses}/${id}`);
      }}
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
