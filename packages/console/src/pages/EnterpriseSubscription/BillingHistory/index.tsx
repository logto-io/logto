import { type ResponseError } from '@withtyped/client';
import dayjs from 'dayjs';
import { useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import useSWR from 'swr';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import { type LogtoEnterpriseSubscriptionInvoiceResponse } from '@/cloud/types/router';
import EmptyDataPlaceholder from '@/components/EmptyDataPlaceholder';
import ItemPreview from '@/components/ItemPreview';
import PageMeta from '@/components/PageMeta';
import DynamicT from '@/ds-components/DynamicT';
import Table from '@/ds-components/Table';
import InvoiceStatusTag from '@/pages/TenantSettings/BillingHistory/InvoiceStatusTag';
import { formatPeriod } from '@/utils/subscription';

function BillingHistory() {
  const { logtoEnterpriseId = '' } = useParams();
  const cloudApi = useCloudApi();

  const { data, isLoading } = useSWR<
    { invoices: LogtoEnterpriseSubscriptionInvoiceResponse[] },
    ResponseError
  >(logtoEnterpriseId && `/api/me/logto-enterprises/${logtoEnterpriseId}/invoices`, async () =>
    cloudApi.get(`/api/me/logto-enterprises/:id/invoices`, {
      params: { id: logtoEnterpriseId },
    })
  );

  // Filter out draft invoices
  const invoices = useMemo(
    () => (data?.invoices ?? []).filter(({ status }) => status !== 'draft'),
    [data?.invoices]
  );

  const openStripeHostedInvoicePage = useCallback(
    async (invoiceId: string) => {
      const { hostedInvoiceUrl } = await cloudApi.get(
        '/api/me/logto-enterprises/:enterpriseId/invoices/:invoiceId/hosted-invoice-url',
        {
          params: { enterpriseId: logtoEnterpriseId, invoiceId },
        }
      );

      window.open(hostedInvoiceUrl, '_blank');
    },
    [cloudApi, logtoEnterpriseId]
  );

  return (
    <div>
      <PageMeta titleKey={['tenants.tabs.billing_history', 'tenants.title']} />
      <Table
        rowGroups={[{ key: 'invoices', data: invoices }]}
        rowIndexKey="id"
        columns={[
          {
            title: <DynamicT forKey="subscription.billing_history.invoice_column" />,
            dataIndex: 'basicSkuId',
            render: ({ periodStart, periodEnd }) => {
              return (
                <ItemPreview title={formatPeriod({ periodStart, periodEnd, displayYear: true })} />
              );
            },
          },
          {
            title: <DynamicT forKey="subscription.billing_history.status_column" />,
            dataIndex: 'status',
            render: ({ status }) => {
              return <InvoiceStatusTag status={status} />;
            },
          },
          {
            title: <DynamicT forKey="subscription.billing_history.amount_column" />,
            dataIndex: 'amountPaid',
            render: ({ amountPaid }) => {
              return `$${(amountPaid / 100).toFixed(2)}`;
            },
          },
          {
            title: <DynamicT forKey="subscription.billing_history.invoice_created_date_column" />,
            dataIndex: 'createdAt',
            render: ({ createdAt }) => {
              return dayjs(createdAt).format('MMMM DD, YYYY');
            },
          },
        ]}
        isLoading={isLoading}
        placeholder={<EmptyDataPlaceholder />}
        rowClickHandler={({ id }) => {
          void openStripeHostedInvoicePage(id);
        }}
      />
    </div>
  );
}

export default BillingHistory;
