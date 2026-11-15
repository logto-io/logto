import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import EmptyDark from '@/assets/images/table-empty-dark.svg?react';
import Empty from '@/assets/images/table-empty.svg?react';
import { useSelfHostedLicenses } from '@/cloud/hooks/use-self-hosted-licenses';
import ItemPreview from '@/components/ItemPreview';
import SkuName from '@/components/SkuName';
import { selfHostedLicenseGuideLink } from '@/consts/external-links';
import { GlobalRoute } from '@/contexts/TenantsProvider';
import Button from '@/ds-components/Button';
import CardTitle from '@/ds-components/CardTitle';
import Table from '@/ds-components/Table';
import TablePlaceholder from '@/ds-components/Table/TablePlaceholder';
import pageLayout from '@/scss/page-layout.module.scss';

import Status from './Status';

type Props = {
  readonly onCreate?: () => void;
  readonly isCreating?: boolean;
  readonly children?: ReactNode;
};

function List({ onCreate, isCreating, children }: Props) {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { data, error, isLoading, mutate } = useSelfHostedLicenses();
  const navigate = useNavigate();

  const createButton = onCreate && (
    <Button
      title="cloud.self_hosted_licenses.create"
      type="primary"
      size="large"
      isLoading={isCreating}
      onClick={onCreate}
    />
  );

  return (
    <>
      <div className={pageLayout.headline}>
        <CardTitle
          title="cloud.self_hosted_licenses.title"
          subtitle="cloud.self_hosted_licenses.description"
          learnMoreLink={{ href: selfHostedLicenseGuideLink }}
        />
        {Boolean(data?.length) && createButton}
      </div>
      {children}
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
              <ItemPreview title={<SkuName skuId={plan} />} subtitle={id} />
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
        rowClickHandler={({ id }) => {
          navigate(`${GlobalRoute.SelfHostedLicenses}/${id}`);
        }}
        placeholder={
          <TablePlaceholder
            image={<Empty />}
            imageDark={<EmptyDark />}
            title="cloud.self_hosted_licenses.empty_title"
            description="cloud.self_hosted_licenses.empty_description"
            action={createButton}
          />
        }
        onRetry={() => {
          void mutate();
        }}
      />
    </>
  );
}

export default List;
