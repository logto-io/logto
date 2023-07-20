import { withAppInsights } from '@logto/app-insights/react';
import { conditional } from '@silverhand/essentials';
import dayjs from 'dayjs';
import { useContext, useMemo } from 'react';

import EmptyDataPlaceholder from '@/components/EmptyDataPlaceholder';
import ItemPreview from '@/components/ItemPreview';
import PageMeta from '@/components/PageMeta';
import PlanName from '@/components/PlanName';
import { TenantsContext } from '@/contexts/TenantsProvider';
import DynamicT from '@/ds-components/DynamicT';
import Table from '@/ds-components/Table';
import useInvoices from '@/hooks/use-invoices';
import { formatPeriod } from '@/utils/subscription';

import InvoiceStatusTag from './InvoiceStatusTag';

function BillingHistory() {
  const { currentTenantId } = useContext(TenantsContext);
  const { data: invoices, error } = useInvoices(currentTenantId);
  const isLoadingInvoices = !invoices && !error;
  const displayInvoices = useMemo(
    // Don't show draft invoices
    () => invoices?.filter(({ status }) => status !== 'draft'),
    [invoices]
  );

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
            render: ({ planName, hostedInvoiceUrl, periodStart, periodEnd }) => {
              return (
                <ItemPreview
                  title={formatPeriod({ periodStart, periodEnd, displayYear: true })}
                  subtitle={conditional(planName && <PlanName name={planName} />)}
                  to={conditional(hostedInvoiceUrl)}
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
      />
    </div>
  );
}

export default withAppInsights(BillingHistory);
