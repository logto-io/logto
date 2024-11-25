import { conditional } from '@silverhand/essentials';
import dayjs from 'dayjs';
import { useCallback, useContext, useEffect, useMemo } from 'react';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import EmptyDataPlaceholder from '@/components/EmptyDataPlaceholder';
import ItemPreview from '@/components/ItemPreview';
import PageMeta from '@/components/PageMeta';
import SkuName from '@/components/SkuName';
import { TenantsContext } from '@/contexts/TenantsProvider';
import DynamicT from '@/ds-components/DynamicT';
import Table from '@/ds-components/Table';
import useInvoices from '@/hooks/use-invoices';
import { formatPeriod } from '@/utils/subscription';

import InvoiceStatusTag from './InvoiceStatusTag';

function BillingHistory() {
  const cloudApi = useCloudApi();
  const { currentTenantId, updateTenant } = useContext(TenantsContext);
  const { data: invoices, error } = useInvoices(currentTenantId);
  const isLoadingInvoices = !invoices && !error;

  const displayInvoices = useMemo(
    // Don't show draft invoices
    () => invoices?.filter(({ status }) => status !== 'draft'),
    [invoices]
  );

  const openInvoices = useMemo(
    () => invoices?.filter(({ status }) => status === 'open'),
    [invoices]
  );

  const openStripeHostedInvoicePage = useCallback(
    async (invoiceId: string) => {
      const { hostedInvoiceUrl } = await cloudApi.get(
        '/api/tenants/:tenantId/invoices/:invoiceId/hosted-invoice-url',
        {
          params: { tenantId: currentTenantId, invoiceId },
        }
      );

      window.open(hostedInvoiceUrl, '_blank');
    },
    [cloudApi, currentTenantId]
  );

  useEffect(() => {
    if (openInvoices) {
      updateTenant(currentTenantId, {
        openInvoices,
      });
    }
  }, [currentTenantId, openInvoices, updateTenant]);

  return (
    <div>
      <PageMeta titleKey={['tenants.tabs.billing_history', 'tenants.title']} />
      <Table
        rowGroups={[{ key: 'invoices', data: displayInvoices }]}
        rowIndexKey="id"
        columns={[
          {
            title: <DynamicT forKey="subscription.billing_history.invoice_column" />,
            dataIndex: 'planName',
            render: ({ skuId, periodStart, periodEnd }) => {
              return (
                <ItemPreview
                  title={formatPeriod({ periodStart, periodEnd, displayYear: true })}
                  subtitle={conditional(skuId && <SkuName skuId={skuId} />)}
                />
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
            dataIndex: 'created',
            render: ({ createdAt }) => {
              return dayjs(createdAt).format('MMMM DD, YYYY');
            },
          },
        ]}
        isLoading={isLoadingInvoices}
        placeholder={<EmptyDataPlaceholder />}
        rowClickHandler={({ id }) => {
          void openStripeHostedInvoicePage(id);
        }}
      />
    </div>
  );
}

export default BillingHistory;
